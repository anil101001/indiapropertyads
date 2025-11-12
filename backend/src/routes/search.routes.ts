import { Router } from 'express';
import { semanticSearch, findSimilarProperties } from '../controllers/search.controller';
import { optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * Semantic search routes
 * These are OPTIONAL - won't break existing functionality
 */

// POST /api/v1/search/semantic
// Body: { query: string, limit?: number, minScore?: number, filters?: object }
router.post('/semantic', optionalAuthenticate, semanticSearch);

// GET /api/v1/search/similar/:id
// Find properties similar to a given property
router.get('/similar/:id', optionalAuthenticate, findSimilarProperties);

export default router;
