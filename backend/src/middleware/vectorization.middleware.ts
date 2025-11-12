import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { generatePropertyEmbedding } from '../services/embedding.service';
import logger from '../utils/logger';

/**
 * Middleware to auto-generate embeddings for new/updated properties
 * Runs asynchronously - doesn't block the response
 * 
 * Usage:
 *   router.post('/properties', auth, vectorizeProperty, createProperty);
 *   router.put('/properties/:id', auth, vectorizeProperty, updateProperty);
 */
export const vectorizeProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only vectorize if enabled (feature flag check happens in service)
    if (!process.env.OPENAI_API_KEY || process.env.ENABLE_VECTORIZATION !== 'true') {
      // Skip vectorization but continue request
      return next();
    }

    // Extract property data from request body
    const propertyData = req.body;

    // Generate embedding asynchronously (don't wait for it)
    // This ensures the API response isn't delayed by OpenAI API call
    setImmediate(async () => {
      try {
        const embeddingResult = await generatePropertyEmbedding(propertyData);

        if (embeddingResult) {
          // Attach embedding to request body for the controller to save
          req.body.embedding = embeddingResult.embedding;
          req.body.embeddingMetadata = {
            model: embeddingResult.model,
            generatedAt: new Date(),
            textUsed: embeddingResult.textUsed
          };

          logger.info('Embedding generated and attached to property data');
        }
      } catch (error: any) {
        // Log error but don't fail the request
        logger.error('Error in async vectorization:', error.message);
      }
    });

    // Continue to next middleware immediately
    next();

  } catch (error: any) {
    // If middleware itself fails, log but continue
    logger.error('Vectorization middleware error:', error.message);
    next();
  }
};

/**
 * Synchronous version of vectorization middleware
 * Waits for embedding generation before proceeding
 * Use only if you need embedding to be ready before saving
 * 
 * NOTE: This will add ~200-500ms latency to API response
 */
export const vectorizePropertySync = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.ENABLE_VECTORIZATION !== 'true') {
      return next();
    }

    const propertyData = req.body;

    // Wait for embedding generation
    const embeddingResult = await generatePropertyEmbedding(propertyData);

    if (embeddingResult) {
      req.body.embedding = embeddingResult.embedding;
      req.body.embeddingMetadata = {
        model: embeddingResult.model,
        generatedAt: new Date(),
        textUsed: embeddingResult.textUsed
      };

      logger.info('Embedding generated synchronously');
    }

    next();

  } catch (error: any) {
    logger.error('Sync vectorization middleware error:', error.message);
    // Continue even if vectorization fails
    next();
  }
};

/**
 * Middleware to re-vectorize property if critical fields changed
 * Use on UPDATE endpoints
 */
export const reVectorizeIfNeeded = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.ENABLE_VECTORIZATION !== 'true') {
      return next();
    }

    // Check if any fields that affect embedding were changed
    const criticalFields = ['title', 'description', 'address', 'amenities', 'specs'];
    const updatedFields = Object.keys(req.body);

    const needsReVectorization = criticalFields.some(field => 
      updatedFields.includes(field)
    );

    if (needsReVectorization) {
      logger.info('Critical fields changed - triggering re-vectorization');
      
      // Trigger async re-vectorization
      setImmediate(async () => {
        try {
          const embeddingResult = await generatePropertyEmbedding(req.body);
          if (embeddingResult) {
            req.body.embedding = embeddingResult.embedding;
            req.body.embeddingMetadata = {
              model: embeddingResult.model,
              generatedAt: new Date(),
              textUsed: embeddingResult.textUsed
            };
          }
        } catch (error: any) {
          logger.error('Error in re-vectorization:', error.message);
        }
      });
    }

    next();

  } catch (error: any) {
    logger.error('Re-vectorization middleware error:', error.message);
    next();
  }
};
