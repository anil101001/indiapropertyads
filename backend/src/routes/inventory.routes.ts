import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';
import {
  // Tower controllers
  createTower,
  getProjectTowers,
  getTower,
  updateTower,
  deleteTower,
  updateTowerProgress,
  // Unit controllers
  createUnit,
  bulkCreateUnits,
  getTowerUnits,
  getUnit,
  updateUnit,
  updateUnitStatus,
  bulkUpdatePrices,
  getProjectInventory,
  generateUnits
} from '../controllers/inventory.controller';

const router = Router();

// ============== PUBLIC ROUTES ==============

// Get towers for a project (public view)
router.get('/projects/:projectId/towers', optionalAuthenticate, getProjectTowers);

// Get single tower details
router.get('/towers/:towerId', optionalAuthenticate, getTower);

// Get units for a tower (public can see available units)
router.get('/towers/:towerId/units', optionalAuthenticate, getTowerUnits);

// Get single unit details
router.get('/units/:unitId', optionalAuthenticate, getUnit);

// ============== PROTECTED ROUTES (Builder) ==============

// Tower management
router.post(
  '/projects/:projectId/towers',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  createTower
);

router.put(
  '/towers/:towerId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  updateTower
);

router.delete(
  '/towers/:towerId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  deleteTower
);

router.patch(
  '/towers/:towerId/progress',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  updateTowerProgress
);

// Unit management
router.post(
  '/towers/:towerId/units',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  createUnit
);

router.post(
  '/towers/:towerId/units/bulk',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  bulkCreateUnits
);

router.post(
  '/towers/:towerId/units/generate',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  generateUnits
);

router.put(
  '/units/:unitId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  updateUnit
);

router.patch(
  '/units/:unitId/status',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  updateUnitStatus
);

router.patch(
  '/towers/:towerId/units/prices',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  bulkUpdatePrices
);

// Project inventory summary
router.get(
  '/projects/:projectId/inventory',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getProjectInventory
);

export default router;
