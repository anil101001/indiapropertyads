/**
 * AI Chat Module - Property Search Service
 * Integrates with vector search and regular search
 */

import Property from '../../models/Property.model';
import { UserPreferences, SearchResult } from '../types/chat.types';
import { generateQueryEmbedding } from '../../services/embedding.service';
import logger from '../../utils/logger';

class PropertySearchService {
  /**
   * Search properties using natural language query
   * Attempts vector search first, falls back to text search
   */
  async searchProperties(
    query: string,
    filters: Partial<UserPreferences> = {},
    limit: number = 5
  ): Promise<SearchResult> {
    try {
      // Try vector search first
      if (process.env.ENABLE_VECTORIZATION === 'true') {
        logger.info('Attempting vector search...');
        try {
          const vectorResults = await this.vectorSearch(query, filters, limit);
          logger.info(`Vector search completed: ${vectorResults.properties.length} results`);
          if (vectorResults.properties.length > 0) {
            return vectorResults;
          }
        } catch (vectorError: any) {
          logger.warn('Vector search failed, falling back to text search:', vectorError.message);
        }
      }

      // Fallback to regular search
      logger.info('Using text search');
      return await this.textSearch(query, filters, limit);

    } catch (error: any) {
      logger.error('Property search error:', error);
      // Return empty results instead of throwing
      return {
        properties: [],
        query,
        filters,
        totalFound: 0
      };
    }
  }

  /**
   * Vector-based semantic search
   */
  private async vectorSearch(
    query: string,
    filters: Partial<UserPreferences>,
    limit: number
  ): Promise<SearchResult> {
    try {
      // Generate embedding for query
      const queryEmbedding = await generateQueryEmbedding(query);

      if (!queryEmbedding) {
        throw new Error('Could not generate query embedding');
      }

      // Build aggregation pipeline
      const pipeline: any[] = [
        {
          $vectorSearch: {
            index: 'property_vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 50,
            limit: limit * 2 // Get more for filtering
          }
        },
        {
          $addFields: {
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ];

      // Add filters
      const matchFilters = this.buildMatchFilters(filters);
      if (Object.keys(matchFilters).length > 0) {
        pipeline.push({ $match: matchFilters });
      }

      // Project fields
      pipeline.push({
        $project: {
          embedding: 0,
          embeddingMetadata: 0
        }
      });

      // Limit results
      pipeline.push({ $limit: limit });

      const properties = await Property.aggregate(pipeline);

      return {
        properties,
        query,
        filters,
        totalFound: properties.length
      };

    } catch (error: any) {
      logger.error('Vector search error:', error);
      throw error;
    }
  }

  /**
   * Text-based keyword search
   */
  private async textSearch(
    query: string,
    filters: Partial<UserPreferences>,
    limit: number
  ): Promise<SearchResult> {
    try {
      const searchRegex = new RegExp(query, 'i');
      
      const searchQuery: any = {
        status: 'approved',
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { 'address.city': searchRegex },
          { 'address.state': searchRegex },
          { 'address.fullAddress': searchRegex }
        ]
      };

      // Apply filters
      Object.assign(searchQuery, this.buildMatchFilters(filters));

      logger.info(`Text search query: ${JSON.stringify(searchQuery).substring(0, 200)}`);

      const properties = await Property.find(searchQuery)
        .select('-embedding -embeddingMetadata')
        .limit(limit)
        .sort({ createdAt: -1 });

      logger.info(`Text search found ${properties.length} properties`);
      if (properties.length > 0) {
        logger.info(`First property title: ${properties[0].title}`);
      }

      return {
        properties,
        query,
        filters,
        totalFound: properties.length
      };

    } catch (error: any) {
      logger.error('Text search error:', error);
      throw error;
    }
  }

  /**
   * Search by filters only (no text query)
   */
  async searchByFilters(
    filters: Partial<UserPreferences>,
    limit: number = 10,
    skip: number = 0
  ): Promise<SearchResult> {
    try {
      const matchFilters = this.buildMatchFilters(filters);

      const properties = await Property.find(matchFilters)
        .select('-embedding -embeddingMetadata')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      const totalFound = await Property.countDocuments(matchFilters);

      return {
        properties,
        query: '',
        filters,
        totalFound
      };

    } catch (error: any) {
      logger.error('Filter search error:', error);
      return {
        properties: [],
        query: '',
        filters,
        totalFound: 0
      };
    }
  }

  /**
   * Get similar properties to a given property
   */
  async getSimilarProperties(propertyId: string, limit: number = 5): Promise<any[]> {
    try {
      const referenceProperty = await Property.findById(propertyId).select('+embedding');

      if (!referenceProperty || !referenceProperty.embedding) {
        // Fallback: find properties with similar specs
        return this.getSimilarBySpecs(propertyId, limit);
      }

      const pipeline = [
        {
          $vectorSearch: {
            index: 'property_vector_index',
            path: 'embedding',
            queryVector: referenceProperty.embedding,
            numCandidates: 50,
            limit: limit + 1
          }
        },
        {
          $match: {
            _id: { $ne: referenceProperty._id },
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
        { $limit: limit }
      ];

      return await Property.aggregate(pipeline);

    } catch (error: any) {
      logger.error('Get similar properties error:', error);
      return [];
    }
  }

  /**
   * Get similar properties based on specs (fallback)
   */
  private async getSimilarBySpecs(propertyId: string, limit: number): Promise<any[]> {
    const property = await Property.findById(propertyId);
    
    if (!property) return [];

    return await Property.find({
      _id: { $ne: propertyId },
      status: 'approved',
      propertyType: property.propertyType,
      'specs.bedrooms': property.specs.bedrooms,
      'pricing.expectedPrice': {
        $gte: property.pricing.expectedPrice * 0.8,
        $lte: property.pricing.expectedPrice * 1.2
      },
      'address.city': property.address.city
    })
      .select('-embedding -embeddingMetadata')
      .limit(limit);
  }

  /**
   * Build MongoDB match filters from user preferences
   */
  private buildMatchFilters(filters: Partial<UserPreferences>): any {
    const matchFilters: any = {
      status: 'approved'
    };

    // Location filters
    if (filters.location?.city) {
      matchFilters['address.city'] = new RegExp(filters.location.city, 'i');
    }

    if (filters.location?.locality) {
      matchFilters['address.fullAddress'] = new RegExp(filters.location.locality, 'i');
    }

    // Price filters
    if (filters.budget?.min || filters.budget?.max) {
      matchFilters['pricing.expectedPrice'] = {};
      if (filters.budget.min) {
        matchFilters['pricing.expectedPrice'].$gte = filters.budget.min;
      }
      if (filters.budget.max) {
        matchFilters['pricing.expectedPrice'].$lte = filters.budget.max;
      }
    }

    // Property type
    if (filters.propertyType) {
      matchFilters.propertyType = filters.propertyType;
    }

    // Bedrooms
    if (filters.bedrooms) {
      matchFilters['specs.bedrooms'] = filters.bedrooms;
    }

    // Furnishing
    if (filters.furnishing) {
      matchFilters['specs.furnishing'] = filters.furnishing;
    }

    // Listing type
    if (filters.listingType) {
      matchFilters.listingType = filters.listingType;
    }

    // Amenities (if specified, property must have at least one)
    if (filters.amenities && filters.amenities.length > 0) {
      matchFilters.amenities = { $in: filters.amenities };
    }

    return matchFilters;
  }

  /**
   * Get property details by ID
   */
  async getPropertyById(propertyId: string): Promise<any | null> {
    try {
      return await Property.findById(propertyId)
        .select('-embedding -embeddingMetadata')
        .populate('owner', 'profile email');

    } catch (error: any) {
      logger.error('Get property by ID error:', error);
      return null;
    }
  }

  /**
   * Get trending/featured properties
   */
  async getTrendingProperties(limit: number = 5): Promise<any[]> {
    try {
      return await Property.find({
        status: 'approved',
        verified: true
      })
        .select('-embedding -embeddingMetadata')
        .sort({ 'stats.views': -1, createdAt: -1 })
        .limit(limit);

    } catch (error: any) {
      logger.error('Get trending properties error:', error);
      return [];
    }
  }
}

// Export singleton instance
export default new PropertySearchService();
