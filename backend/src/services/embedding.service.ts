import OpenAI from 'openai';
import logger from '../utils/logger';

// Lazy initialization of OpenAI client (created on first use, not at module load)
let openaiClient: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-development'
    });
  }
  return openaiClient;
};

// Feature flag to enable/disable vectorization (check at runtime, not module load time)
const isVectorizationEnabled = () => process.env.ENABLE_VECTORIZATION === 'true';

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
  const startTime = Date.now();
  
  // Check if feature is enabled
  if (!isVectorizationEnabled()) {
    logger.warn('🔴 Vectorization skipped: ENABLE_VECTORIZATION=false in .env');
    return null;
  }

  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-development') {
    logger.warn('🔴 Vectorization skipped: OpenAI API key not configured or using dummy key');
    return null;
  }

  try {
    logger.info(`🔄 Generating embedding for property: ${propertyData._id}`);
    
    // Combine relevant property fields for embedding
    const textToEmbed = buildEmbeddingText(propertyData);
    
    if (!textToEmbed || textToEmbed.trim().length < 10) {
      logger.warn(`⚠️ Insufficient text (${textToEmbed?.length || 0} chars) for embedding - skipping`);
      return null;
    }

    logger.info(`📝 Text prepared: ${textToEmbed.length} characters`);

    // Generate embedding using OpenAI
    const response = await getOpenAIClient().embeddings.create({
      model: 'text-embedding-3-small',
      input: textToEmbed,
      dimensions: 1536 // Can be reduced to 512 or 256 for storage savings
    });

    const duration = Date.now() - startTime;
    logger.info(`✅ Embedding generated successfully in ${duration}ms`);
    logger.info(`   Vector dimensions: 1536`);
    logger.info(`   Model: text-embedding-3-small`);

    // Save embedding to property
    if (propertyData.save) {
      propertyData.embedding = response.data[0].embedding;
      propertyData.embeddingMetadata = {
        model: 'text-embedding-3-small',
        generatedAt: new Date(),
        textUsed: textToEmbed.substring(0, 500)
      };
      await propertyData.save();
      logger.info(`💾 Embedding saved to database for property: ${propertyData._id}`);
    }

    return {
      embedding: response.data[0].embedding,
      model: 'text-embedding-3-small',
      textUsed: textToEmbed.substring(0, 500) // Store first 500 chars for reference
    };

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Embedding generation failed after ${duration}ms: ${error.message}`);
    
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
  if (!isVectorizationEnabled()) {
    logger.warn('Query embedding skipped: VECTORIZATION_ENABLED is false');
    return null;
  }

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-development') {
    logger.warn('Query embedding skipped: OPENAI_API_KEY not set or is dummy key');
    return null;
  }

  try {
    logger.info(`Generating query embedding for: "${query.substring(0, 50)}..."`);
    const response = await getOpenAIClient().embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      dimensions: 1536
    });

    logger.info(`Query embedding generated: ${response.data[0].embedding.length} dimensions`);
    return response.data[0].embedding;

  } catch (error: any) {
    logger.error('Error generating query embedding:', error.message);
    if (error.response) {
      logger.error('OpenAI API response:', error.response.data);
    }
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
