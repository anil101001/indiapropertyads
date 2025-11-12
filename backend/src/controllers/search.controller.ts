import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Property from '../models/Property.model';
import { generateQueryEmbedding } from '../services/embedding.service';
import logger from '../utils/logger';

/**
 * @route   POST /api/v1/search/semantic
 * @desc    Semantic search using vector similarity
 * @access  Public
 */
export const semanticSearch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      query,
      limit = 20,
      minScore = 0.7, // Minimum similarity score (0-1)
      filters = {} // Additional filters (city, price, etc.)
    } = req.body;

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: 'Query must be at least 3 characters'
      });
      return;
    }

    // Check if vector search is enabled
    if (process.env.ENABLE_VECTORIZATION !== 'true') {
      res.status(503).json({
        success: false,
        message: 'Semantic search is not enabled. Use regular search instead.',
        fallbackEndpoint: '/api/v1/properties?search=' + encodeURIComponent(query)
      });
      return;
    }

    logger.info(`Semantic search query: "${query}"`);

    // Generate embedding for user query
    const queryEmbedding = await generateQueryEmbedding(query);

    if (!queryEmbedding) {
      // Fallback to regular text search
      logger.warn('Could not generate query embedding - falling back to text search');
      return await fallbackTextSearch(req, res);
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      // Vector search stage
      {
        $vectorSearch: {
          index: 'property_vector_index', // MongoDB Atlas vector search index name
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100, // Consider top 100 candidates
          limit: parseInt(limit as string) * 2 // Get 2x results before filtering
        }
      },
      // Add similarity score
      {
        $addFields: {
          score: { $meta: 'vectorSearchScore' }
        }
      },
      // Filter by minimum score
      {
        $match: {
          score: { $gte: parseFloat(minScore as string) }
        }
      }
    ];

    // Add additional filters (city, price, property type, etc.)
    if (Object.keys(filters).length > 0) {
      const additionalFilters: any = {};

      if (filters.city) {
        additionalFilters['address.city'] = new RegExp(filters.city, 'i');
      }

      if (filters.minPrice || filters.maxPrice) {
        additionalFilters['pricing.expectedPrice'] = {};
        if (filters.minPrice) {
          additionalFilters['pricing.expectedPrice'].$gte = parseFloat(filters.minPrice);
        }
        if (filters.maxPrice) {
          additionalFilters['pricing.expectedPrice'].$lte = parseFloat(filters.maxPrice);
        }
      }

      if (filters.bedrooms) {
        additionalFilters['specs.bedrooms'] = parseInt(filters.bedrooms);
      }

      if (filters.propertyType) {
        additionalFilters.propertyType = filters.propertyType;
      }

      if (filters.listingType) {
        additionalFilters.listingType = filters.listingType;
      }

      // Only show approved properties to non-owners
      if (!req.user || req.user.role === 'buyer') {
        additionalFilters.status = 'approved';
      }

      pipeline.push({ $match: additionalFilters });
    } else {
      // Default: only show approved properties
      pipeline.push({ $match: { status: 'approved' } });
    }

    // Project only necessary fields (don't include embedding in response)
    pipeline.push({
      $project: {
        embedding: 0, // Exclude large embedding array
        embeddingMetadata: 0
      }
    });

    // Limit results
    pipeline.push({ $limit: parseInt(limit as string) });

    // Execute search
    const results = await Property.aggregate(pipeline);

    logger.info(`Semantic search returned ${results.length} results`);

    res.json({
      success: true,
      query,
      count: results.length,
      results,
      searchType: 'semantic'
    });

  } catch (error: any) {
    logger.error('Semantic search error:', error);

    // Check if error is due to missing vector index
    if (error.message?.includes('vector search index')) {
      res.status(503).json({
        success: false,
        message: 'Vector search index not configured. Please run setup instructions.',
        error: 'VECTOR_INDEX_NOT_FOUND'
      });
      return;
    }

    // Fallback to regular search on any error
    logger.warn('Semantic search failed - falling back to text search');
    return await fallbackTextSearch(req, res);
  }
};

/**
 * Fallback to regular text search if semantic search fails
 */
async function fallbackTextSearch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { query, limit = 20, filters = {} } = req.body;

    const searchRegex = new RegExp(query.trim(), 'i');
    const searchQuery: any = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex }
      ]
    };

    // Apply filters
    if (filters.city) {
      searchQuery['address.city'] = new RegExp(filters.city, 'i');
    }

    if (filters.minPrice || filters.maxPrice) {
      searchQuery['pricing.expectedPrice'] = {};
      if (filters.minPrice) {
        searchQuery['pricing.expectedPrice'].$gte = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice) {
        searchQuery['pricing.expectedPrice'].$lte = parseFloat(filters.maxPrice);
      }
    }

    // Only show approved properties
    if (!req.user || req.user.role === 'buyer') {
      searchQuery.status = 'approved';
    }

    const results = await Property.find(searchQuery)
      .select('-embedding -embeddingMetadata')
      .limit(parseInt(limit as string))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      query,
      count: results.length,
      results,
      searchType: 'text', // Indicate fallback was used
      fallback: true
    });

  } catch (error: any) {
    logger.error('Fallback text search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
}

/**
 * @route   GET /api/v1/search/similar/:id
 * @desc    Find similar properties using vector similarity
 * @access  Public
 */
export const findSimilarProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    // Find the reference property
    const referenceProperty = await Property.findById(id).select('+embedding');

    if (!referenceProperty) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    if (!referenceProperty.embedding || referenceProperty.embedding.length === 0) {
      res.status(503).json({
        success: false,
        message: 'Property does not have vector embedding. Please regenerate embeddings.'
      });
      return;
    }

    // Find similar properties
    const pipeline = [
      {
        $vectorSearch: {
          index: 'property_vector_index',
          path: 'embedding',
          queryVector: referenceProperty.embedding,
          numCandidates: 50,
          limit: parseInt(limit as string) + 1 // +1 to exclude self
        }
      },
      {
        $match: {
          _id: { $ne: referenceProperty._id }, // Exclude the reference property
          status: 'approved'
        }
      },
      {
        $addFields: {
          similarityScore: { $meta: 'vectorSearchScore' }
        }
      },
      {
        $project: {
          embedding: 0,
          embeddingMetadata: 0
        }
      },
      {
        $limit: parseInt(limit as string)
      }
    ];

    const similarProperties = await Property.aggregate(pipeline);

    res.json({
      success: true,
      referenceProperty: {
        id: referenceProperty._id,
        title: referenceProperty.title
      },
      count: similarProperties.length,
      results: similarProperties
    });

  } catch (error: any) {
    logger.error('Find similar properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find similar properties'
    });
  }
};
