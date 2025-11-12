import OpenAI from 'openai';
import logger from '../utils/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-development'
});

// Feature flag to enable/disable vectorization
const VECTORIZATION_ENABLED = process.env.ENABLE_VECTORIZATION === 'true';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  textUsed: string;
}

/**
 * Generate embedding vector for property
 * @param propertyData - Property data to vectorize
 * @returns Embedding result or null if disabled/error
 */
export const generatePropertyEmbedding = async (
  propertyData: any
): Promise<EmbeddingResult | null> => {
  // Check if feature is enabled
  if (!VECTORIZATION_ENABLED) {
    logger.info('Vectorization is disabled via feature flag');
    return null;
  }

  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-development') {
    logger.warn('OpenAI API key not configured - skipping vectorization');
    return null;
  }

  try {
    // Combine relevant property fields for embedding
    const textToEmbed = buildEmbeddingText(propertyData);
    
    if (!textToEmbed || textToEmbed.trim().length < 10) {
      logger.warn('Insufficient text for embedding generation');
      return null;
    }

    // Generate embedding using OpenAI
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: textToEmbed,
      dimensions: 1536 // Can be reduced to 512 or 256 for storage savings
    });

    logger.info(`Generated embedding for property (${textToEmbed.length} chars)`);

    return {
      embedding: response.data[0].embedding,
      model: 'text-embedding-3-small',
      textUsed: textToEmbed.substring(0, 500) // Store first 500 chars for reference
    };

  } catch (error: any) {
    logger.error('Error generating embedding:', error.message);
    
    // Don't throw - gracefully degrade to non-vectorized property
    return null;
  }
};

/**
 * Generate embedding for search query
 * @param query - User search query
 * @returns Embedding vector or null
 */
export const generateQueryEmbedding = async (query: string): Promise<number[] | null> => {
  if (!VECTORIZATION_ENABLED) {
    return null;
  }

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-development') {
    return null;
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      dimensions: 1536
    });

    return response.data[0].embedding;

  } catch (error: any) {
    logger.error('Error generating query embedding:', error.message);
    return null;
  }
};

/**
 * Build text string from property data for embedding
 * Combines title, description, location, and key features
 */
function buildEmbeddingText(propertyData: any): string {
  const parts: string[] = [];

  // Title
  if (propertyData.title) {
    parts.push(propertyData.title);
  }

  // Property type and listing type
  if (propertyData.propertyType) {
    parts.push(`${propertyData.propertyType} for ${propertyData.listingType || 'sale'}`);
  }

  // BHK configuration
  if (propertyData.specs?.bedrooms) {
    parts.push(`${propertyData.specs.bedrooms} bedroom${propertyData.specs.bedrooms > 1 ? 's' : ''}`);
  }

  // Location
  if (propertyData.address) {
    const location = [
      propertyData.address.city,
      propertyData.address.state,
      propertyData.address.landmark
    ].filter(Boolean).join(', ');
    
    if (location) {
      parts.push(`Located in ${location}`);
    }
  }

  // Description
  if (propertyData.description) {
    parts.push(propertyData.description);
  }

  // Amenities
  if (propertyData.amenities && propertyData.amenities.length > 0) {
    parts.push(`Amenities: ${propertyData.amenities.join(', ')}`);
  }

  // Furnishing status
  if (propertyData.specs?.furnishing) {
    parts.push(`${propertyData.specs.furnishing} property`);
  }

  // Area
  if (propertyData.specs?.carpetArea) {
    parts.push(`${propertyData.specs.carpetArea} sqft carpet area`);
  }

  return parts.join('. ').trim();
}

/**
 * Batch generate embeddings for multiple properties
 * Useful for bulk vectorization
 */
export const generateBatchEmbeddings = async (
  properties: any[]
): Promise<Array<EmbeddingResult | null>> => {
  const results: Array<EmbeddingResult | null> = [];

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    
    try {
      const result = await generatePropertyEmbedding(property);
      results.push(result);

      // Log progress
      if ((i + 1) % 10 === 0) {
        logger.info(`Vectorized ${i + 1}/${properties.length} properties`);
      }

      // Rate limiting: Pause every 100 requests (OpenAI limit ~3000/min)
      if ((i + 1) % 100 === 0) {
        logger.info('Rate limit pause: waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error: any) {
      logger.error(`Error vectorizing property ${property._id}:`, error.message);
      results.push(null);
    }
  }

  return results;
};
