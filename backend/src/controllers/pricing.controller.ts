import { Response } from 'express';
import PricingRule from '../models/Pricing.model';
import Offer from '../models/Offer.model';
import PaymentPlan from '../models/PaymentPlan.model';
import Project from '../models/Project.model';
import Builder from '../models/Builder.model';
import Unit from '../models/Unit.model';
import { AuthRequest } from '../middleware/auth.middleware';

// ============== PRICING RULE CONTROLLERS ==============

// Create pricing rule for a project
export const createPricingRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const builder = await Builder.findOne({ user: userId });
    if (!builder || project.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    const pricingRule = await PricingRule.create({
      ...req.body,
      project: projectId,
      builder: project.builder
    });

    res.status(201).json({
      success: true,
      message: 'Pricing rule created successfully',
      data: pricingRule
    });
  } catch (error: any) {
    console.error('Create pricing rule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create pricing rule'
    });
  }
};

// Get pricing rules for a project
export const getProjectPricingRules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { towerId, activeOnly } = req.query;

    const query: any = { project: projectId };
    if (towerId) query.tower = towerId;
    if (activeOnly === 'true') query.isActive = true;

    const rules = await PricingRule.find(query)
      .populate('tower', 'name type')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: rules,
      count: rules.length
    });
  } catch (error: any) {
    console.error('Get pricing rules error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch pricing rules'
    });
  }
};

// Get single pricing rule
export const getPricingRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ruleId } = req.params;

    const rule = await PricingRule.findById(ruleId)
      .populate('project', 'name')
      .populate('tower', 'name type');

    if (!rule) {
      res.status(404).json({ success: false, message: 'Pricing rule not found' });
      return;
    }

    res.json({
      success: true,
      data: rule
    });
  } catch (error: any) {
    console.error('Get pricing rule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch pricing rule'
    });
  }
};

// Update pricing rule
export const updatePricingRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ruleId } = req.params;
    const userId = req.user?.userId;

    const rule = await PricingRule.findById(ruleId);
    if (!rule) {
      res.status(404).json({ success: false, message: 'Pricing rule not found' });
      return;
    }

    const builder = await Builder.findOne({ user: userId });
    if (!builder || rule.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    delete req.body.project;
    delete req.body.builder;

    const updatedRule = await PricingRule.findByIdAndUpdate(
      ruleId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Pricing rule updated successfully',
      data: updatedRule
    });
  } catch (error: any) {
    console.error('Update pricing rule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update pricing rule'
    });
  }
};

// Delete pricing rule
export const deletePricingRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ruleId } = req.params;
    const userId = req.user?.userId;

    const rule = await PricingRule.findById(ruleId);
    if (!rule) {
      res.status(404).json({ success: false, message: 'Pricing rule not found' });
      return;
    }

    const builder = await Builder.findOne({ user: userId });
    if (!builder || rule.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    await PricingRule.findByIdAndDelete(ruleId);

    res.json({
      success: true,
      message: 'Pricing rule deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete pricing rule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete pricing rule'
    });
  }
};

// Calculate price for a unit using pricing rule
export const calculateUnitPrice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ruleId } = req.params;
    const unitData = req.body;

    const rule = await PricingRule.findById(ruleId);
    if (!rule) {
      res.status(404).json({ success: false, message: 'Pricing rule not found' });
      return;
    }

    const priceCalculation = (rule as any).calculateUnitPrice(unitData);

    res.json({
      success: true,
      data: priceCalculation
    });
  } catch (error: any) {
    console.error('Calculate unit price error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate price'
    });
  }
};

// Apply pricing rule to all units in a tower
export const applyPricingToTower = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ruleId, towerId } = req.params;
    const userId = req.user?.userId;

    const rule = await PricingRule.findById(ruleId);
    if (!rule) {
      res.status(404).json({ success: false, message: 'Pricing rule not found' });
      return;
    }

    const builder = await Builder.findOne({ user: userId });
    if (!builder || rule.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    const units = await Unit.find({ tower: towerId, status: 'available', isActive: true });
    let updatedCount = 0;

    for (const unit of units) {
      const priceCalc = (rule as any).calculateUnitPrice({
        area: unit.area,
        floor: unit.floor,
        facing: unit.facing,
        isCorner: unit.isCorner,
        unitType: unit.unitType,
        parking: { covered: unit.configuration.parking, open: 0 }
      });

      unit.pricing.pricePerSqft = priceCalc.pricePerSqft;
      unit.pricing.basePrice = priceCalc.breakdown.basePrice;
      unit.pricing.floorRise = priceCalc.breakdown.floorRise || 0;
      unit.pricing.facingPremium = priceCalc.breakdown.facingPremium || 0;
      unit.pricing.cornerPremium = priceCalc.breakdown.cornerPremium || 0;
      unit.pricing.carParking = priceCalc.breakdown.carParking || 0;
      unit.pricing.clubMembership = priceCalc.breakdown.clubMembership || 0;
      unit.pricing.maintenanceDeposit = priceCalc.breakdown.maintenanceDeposit || 0;
      unit.pricing.totalPrice = priceCalc.totalPrice;
      unit.pricing.allInclusivePrice = priceCalc.allInclusivePrice;

      await unit.save();
      updatedCount++;
    }

    res.json({
      success: true,
      message: `Pricing applied to ${updatedCount} units`,
      data: { updatedCount }
    });
  } catch (error: any) {
    console.error('Apply pricing to tower error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to apply pricing'
    });
  }
};

// ============== OFFER CONTROLLERS ==============

// Create offer
export const createOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const builder = await Builder.findOne({ user: userId });
    if (!builder || project.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    const offer = await Offer.create({
      ...req.body,
      project: projectId,
      builder: project.builder
    });

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: offer
    });
  } catch (error: any) {
    console.error('Create offer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create offer'
    });
  }
};

// Get offers for a project
export const getProjectOffers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { status, activeOnly } = req.query;

    const query: any = { project: projectId };
    if (status) query.status = status;
    if (activeOnly === 'true') {
      query.isActive = true;
      query.status = 'active';
      query.validFrom = { $lte: new Date() };
      query.validUntil = { $gte: new Date() };
    }

    const offers = await Offer.find(query)
      .populate('tower', 'name')
      .sort({ 'display.priority': -1, createdAt: -1 });

    res.json({
      success: true,
      data: offers,
      count: offers.length
    });
  } catch (error: any) {
    console.error('Get offers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch offers'
    });
  }
};

// Get public active offers for a project
export const getPublicOffers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const offers = await Offer.find({
      project: projectId,
      isActive: true,
      status: 'active',
      'display.showOnWebsite': true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    })
      .select('name description offerType discount giftDetails validUntil display')
      .sort({ 'display.priority': -1 });

    res.json({
      success: true,
      data: offers
    });
  } catch (error: any) {
    console.error('Get public offers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch offers'
    });
  }
};

// Get single offer
export const getOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId)
      .populate('project', 'name')
      .populate('tower', 'name');

    if (!offer) {
      res.status(404).json({ success: false, message: 'Offer not found' });
      return;
    }

    res.json({
      success: true,
      data: offer
    });
  } catch (error: any) {
    console.error('Get offer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch offer'
    });
  }
};

// Update offer
export const updateOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { offerId } = req.params;
    const userId = req.user?.userId;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      res.status(404).json({ success: false, message: 'Offer not found' });
      return;
    }

    const builder = await Builder.findOne({ user: userId });
    if (!builder || offer.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    delete req.body.project;
    delete req.body.builder;
    delete req.body.usage;

    const updatedOffer = await Offer.findByIdAndUpdate(
      offerId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Offer updated successfully',
      data: updatedOffer
    });
  } catch (error: any) {
    console.error('Update offer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update offer'
    });
  }
};

// Delete offer
export const deleteOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { offerId } = req.params;
    const userId = req.user?.userId;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      res.status(404).json({ success: false, message: 'Offer not found' });
      return;
    }

    const builder = await Builder.findOne({ user: userId });
    if (!builder || offer.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    await Offer.findByIdAndDelete(offerId);

    res.json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete offer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete offer'
    });
  }
};

// Validate offer code
export const validateOfferCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, unitId } = req.body;

    const offer = await Offer.findOne({
      code: code.toUpperCase(),
      isActive: true,
      status: 'active',
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!offer) {
      res.status(404).json({ success: false, message: 'Invalid or expired offer code' });
      return;
    }

    if (unitId) {
      const unit = await Unit.findById(unitId);
      if (unit) {
        const applicability = (offer as any).isApplicableToUnit({
          unitType: unit.unitType,
          floor: unit.floor,
          pricing: { totalPrice: unit.pricing.totalPrice }
        });

        if (!applicability.applicable) {
          res.status(400).json({ success: false, message: applicability.reason });
          return;
        }

        const discount = (offer as any).calculateDiscount({
          basePrice: unit.pricing.basePrice,
          floorRise: unit.pricing.floorRise,
          facingPremium: unit.pricing.facingPremium,
          totalPrice: unit.pricing.totalPrice,
          area: unit.area.superBuiltUp
        });

        res.json({
          success: true,
          data: {
            offer: {
              _id: offer._id,
              name: offer.name,
              description: offer.description,
              offerType: offer.offerType
            },
            discount
          }
        });
        return;
      }
    }

    res.json({
      success: true,
      data: {
        offer: {
          _id: offer._id,
          name: offer.name,
          description: offer.description,
          offerType: offer.offerType,
          discount: offer.discount
        }
      }
    });
  } catch (error: any) {
    console.error('Validate offer code error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate offer'
    });
  }
};

// ============== PAYMENT PLAN CONTROLLERS ==============

// Create payment plan
export const createPaymentPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const builder = await Builder.findOne({ user: userId });
    if (!builder || project.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    const plan = await PaymentPlan.create({
      ...req.body,
      project: projectId,
      builder: project.builder
    });

    res.status(201).json({
      success: true,
      message: 'Payment plan created successfully',
      data: plan
    });
  } catch (error: any) {
    console.error('Create payment plan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment plan'
    });
  }
};

// Get payment plans for a project
export const getProjectPaymentPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { planType, activeOnly } = req.query;

    const query: any = { project: projectId };
    if (planType) query.planType = planType;
    if (activeOnly === 'true') query.isActive = true;

    const plans = await PaymentPlan.find(query)
      .populate('tower', 'name')
      .sort({ 'display.priority': -1, createdAt: -1 });

    res.json({
      success: true,
      data: plans,
      count: plans.length
    });
  } catch (error: any) {
    console.error('Get payment plans error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment plans'
    });
  }
};

// Get public payment plans
export const getPublicPaymentPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const plans = await PaymentPlan.find({
      project: projectId,
      isActive: true
    })
      .select('name description planType bookingAmount milestones benefits display subvention downPayment flexiPayment')
      .sort({ 'display.priority': -1 });

    res.json({
      success: true,
      data: plans
    });
  } catch (error: any) {
    console.error('Get public payment plans error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment plans'
    });
  }
};

// Get single payment plan
export const getPaymentPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;

    const plan = await PaymentPlan.findById(planId)
      .populate('project', 'name')
      .populate('tower', 'name');

    if (!plan) {
      res.status(404).json({ success: false, message: 'Payment plan not found' });
      return;
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error: any) {
    console.error('Get payment plan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment plan'
    });
  }
};

// Update payment plan
export const updatePaymentPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const userId = req.user?.userId;

    const plan = await PaymentPlan.findById(planId);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Payment plan not found' });
      return;
    }

    const builder = await Builder.findOne({ user: userId });
    if (!builder || plan.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    delete req.body.project;
    delete req.body.builder;

    const updatedPlan = await PaymentPlan.findByIdAndUpdate(
      planId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Payment plan updated successfully',
      data: updatedPlan
    });
  } catch (error: any) {
    console.error('Update payment plan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update payment plan'
    });
  }
};

// Delete payment plan
export const deletePaymentPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const userId = req.user?.userId;

    const plan = await PaymentPlan.findById(planId);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Payment plan not found' });
      return;
    }

    const builder = await Builder.findOne({ user: userId });
    if (!builder || plan.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    await PaymentPlan.findByIdAndDelete(planId);

    res.json({
      success: true,
      message: 'Payment plan deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete payment plan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete payment plan'
    });
  }
};

// Generate payment schedule for a unit
export const generatePaymentSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const { unitId, bookingDate, possessionDate } = req.body;

    const plan = await PaymentPlan.findById(planId);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Payment plan not found' });
      return;
    }

    let unitPrice = req.body.unitPrice;

    if (unitId) {
      const unit = await Unit.findById(unitId);
      if (unit) {
        unitPrice = unit.pricing.totalPrice;
      }
    }

    if (!unitPrice) {
      res.status(400).json({ success: false, message: 'Unit price is required' });
      return;
    }

    const schedule = (plan as any).generateSchedule(
      unitPrice,
      new Date(bookingDate || Date.now()),
      possessionDate ? new Date(possessionDate) : undefined
    );

    res.json({
      success: true,
      data: {
        plan: {
          _id: plan._id,
          name: plan.name,
          planType: plan.planType
        },
        unitPrice,
        ...schedule
      }
    });
  } catch (error: any) {
    console.error('Generate payment schedule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate schedule'
    });
  }
};

// Calculate EMI
export const calculateEMI = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const { loanAmount, tenure, interestRate } = req.body;

    const plan = await PaymentPlan.findById(planId);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Payment plan not found' });
      return;
    }

    const emiDetails = (plan as any).calculateEMI(loanAmount, tenure, interestRate);

    res.json({
      success: true,
      data: emiDetails
    });
  } catch (error: any) {
    console.error('Calculate EMI error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate EMI'
    });
  }
};
