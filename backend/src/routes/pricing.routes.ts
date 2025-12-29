import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';
import {
  // Pricing Rule controllers
  createPricingRule,
  getProjectPricingRules,
  getPricingRule,
  updatePricingRule,
  deletePricingRule,
  calculateUnitPrice,
  applyPricingToTower,
  // Offer controllers
  createOffer,
  getProjectOffers,
  getPublicOffers,
  getOffer,
  updateOffer,
  deleteOffer,
  validateOfferCode,
  // Payment Plan controllers
  createPaymentPlan,
  getProjectPaymentPlans,
  getPublicPaymentPlans,
  getPaymentPlan,
  updatePaymentPlan,
  deletePaymentPlan,
  generatePaymentSchedule,
  calculateEMI
} from '../controllers/pricing.controller';

const router = Router();

// ============== PUBLIC ROUTES ==============

// Public offers for a project
router.get('/projects/:projectId/offers/public', optionalAuthenticate, getPublicOffers);

// Public payment plans for a project
router.get('/projects/:projectId/payment-plans/public', optionalAuthenticate, getPublicPaymentPlans);

// Validate offer code
router.post('/offers/validate', optionalAuthenticate, validateOfferCode);

// ============== PROTECTED ROUTES (Builder) ==============

// Pricing Rules
router.post(
  '/projects/:projectId/pricing-rules',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  createPricingRule
);

router.get(
  '/projects/:projectId/pricing-rules',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getProjectPricingRules
);

router.get(
  '/pricing-rules/:ruleId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getPricingRule
);

router.put(
  '/pricing-rules/:ruleId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  updatePricingRule
);

router.delete(
  '/pricing-rules/:ruleId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  deletePricingRule
);

router.post(
  '/pricing-rules/:ruleId/calculate',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  calculateUnitPrice
);

router.post(
  '/pricing-rules/:ruleId/apply/:towerId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  applyPricingToTower
);

// Offers
router.post(
  '/projects/:projectId/offers',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  createOffer
);

router.get(
  '/projects/:projectId/offers',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getProjectOffers
);

router.get(
  '/offers/:offerId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getOffer
);

router.put(
  '/offers/:offerId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  updateOffer
);

router.delete(
  '/offers/:offerId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  deleteOffer
);

// Payment Plans
router.post(
  '/projects/:projectId/payment-plans',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  createPaymentPlan
);

router.get(
  '/projects/:projectId/payment-plans',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getProjectPaymentPlans
);

router.get(
  '/payment-plans/:planId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  getPaymentPlan
);

router.put(
  '/payment-plans/:planId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  updatePaymentPlan
);

router.delete(
  '/payment-plans/:planId',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  deletePaymentPlan
);

router.post(
  '/payment-plans/:planId/schedule',
  authenticate,
  authorize('owner', 'agent', 'admin'),
  generatePaymentSchedule
);

router.post(
  '/payment-plans/:planId/emi',
  optionalAuthenticate,
  calculateEMI
);

export default router;
