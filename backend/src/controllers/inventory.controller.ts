import { Response } from 'express';
import mongoose from 'mongoose';
import Tower from '../models/Tower.model';
import Unit from '../models/Unit.model';
import Project from '../models/Project.model';
import Builder from '../models/Builder.model';
import { AuthRequest } from '../middleware/auth.middleware';

// ============== TOWER CONTROLLERS ==============

// Create a new tower/phase for a project
export const createTower = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    // Verify project exists and user owns it
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Get builder for this user
    const builder = await Builder.findOne({ user: userId });
    if (!builder || project.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    const towerData = {
      ...req.body,
      project: projectId,
      builder: project.builder
    };

    const tower = await Tower.create(towerData);

    res.status(201).json({
      success: true,
      message: 'Tower created successfully',
      data: tower
    });
  } catch (error: any) {
    console.error('Create tower error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create tower'
    });
  }
};

// Get all towers for a project
export const getProjectTowers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { status, includeUnits } = req.query;

    const query: any = { project: projectId, isActive: true };
    if (status) query.status = status;

    let towersQuery = Tower.find(query).sort({ displayOrder: 1, name: 1 });

    const towers = await towersQuery;

    // Optionally include unit counts per tower
    let towersWithCounts: any[] = towers;
    if (includeUnits === 'true') {
      towersWithCounts = await Promise.all(
        towers.map(async (tower) => {
          const unitCounts = await Unit.aggregate([
            { $match: { tower: tower._id, isActive: true } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]);
          
          const counts: Record<string, number> = {};
          unitCounts.forEach((c: { _id: string; count: number }) => {
            counts[c._id] = c.count;
          });

          return {
            ...tower.toObject(),
            unitCounts: counts
          };
        })
      );
    }

    res.json({
      success: true,
      data: towersWithCounts,
      count: towers.length
    });
  } catch (error: any) {
    console.error('Get project towers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch towers'
    });
  }
};

// Get single tower details
export const getTower = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { towerId } = req.params;

    const tower = await Tower.findById(towerId)
      .populate('project', 'name slug location')
      .populate('builder', 'companyName brandName');

    if (!tower) {
      res.status(404).json({ success: false, message: 'Tower not found' });
      return;
    }

    res.json({
      success: true,
      data: tower
    });
  } catch (error: any) {
    console.error('Get tower error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch tower'
    });
  }
};

// Update tower
export const updateTower = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { towerId } = req.params;
    const userId = req.user?.userId;

    const tower = await Tower.findById(towerId);
    if (!tower) {
      res.status(404).json({ success: false, message: 'Tower not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || tower.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    // Don't allow changing project or builder
    delete req.body.project;
    delete req.body.builder;

    const updatedTower = await Tower.findByIdAndUpdate(
      towerId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Tower updated successfully',
      data: updatedTower
    });
  } catch (error: any) {
    console.error('Update tower error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update tower'
    });
  }
};

// Delete tower (soft delete)
export const deleteTower = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { towerId } = req.params;
    const userId = req.user?.userId;

    const tower = await Tower.findById(towerId);
    if (!tower) {
      res.status(404).json({ success: false, message: 'Tower not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || tower.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    // Check if tower has any booked/sold units
    const bookedUnits = await Unit.countDocuments({
      tower: towerId,
      status: { $in: ['booked', 'sold'] }
    });

    if (bookedUnits > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete tower with ${bookedUnits} booked/sold units`
      });
      return;
    }

    // Soft delete tower and its units
    await Tower.findByIdAndUpdate(towerId, { isActive: false, status: 'archived' });
    await Unit.updateMany({ tower: towerId }, { isActive: false });

    res.json({
      success: true,
      message: 'Tower deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete tower error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete tower'
    });
  }
};

// Update tower construction progress
export const updateTowerProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { towerId } = req.params;
    const { status, progressPercentage } = req.body;
    const userId = req.user?.userId;

    const tower = await Tower.findById(towerId);
    if (!tower) {
      res.status(404).json({ success: false, message: 'Tower not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || tower.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    tower.construction.status = status || tower.construction.status;
    tower.construction.progressPercentage = progressPercentage ?? tower.construction.progressPercentage;
    tower.construction.lastUpdated = new Date();

    if (status === 'completed') {
      tower.construction.actualCompletion = new Date();
    }

    await tower.save();

    res.json({
      success: true,
      message: 'Tower progress updated',
      data: tower
    });
  } catch (error: any) {
    console.error('Update tower progress error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update progress'
    });
  }
};

// ============== UNIT CONTROLLERS ==============

// Create a single unit
export const createUnit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { towerId } = req.params;
    const userId = req.user?.userId;

    const tower = await Tower.findById(towerId);
    if (!tower) {
      res.status(404).json({ success: false, message: 'Tower not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || tower.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    const unitData = {
      ...req.body,
      tower: towerId,
      project: tower.project,
      builder: tower.builder
    };

    const unit = await Unit.create(unitData);

    // Update tower inventory
    if (typeof (tower as any).updateInventory === 'function') {
      await (tower as any).updateInventory();
    }

    res.status(201).json({
      success: true,
      message: 'Unit created successfully',
      data: unit
    });
  } catch (error: any) {
    console.error('Create unit error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create unit'
    });
  }
};

// Bulk create units for a tower
export const bulkCreateUnits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { towerId } = req.params;
    const { units } = req.body;
    const userId = req.user?.userId;

    if (!Array.isArray(units) || units.length === 0) {
      res.status(400).json({ success: false, message: 'Units array is required' });
      return;
    }

    const tower = await Tower.findById(towerId);
    if (!tower) {
      res.status(404).json({ success: false, message: 'Tower not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || tower.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    // Add tower, project, builder to each unit
    const unitsToCreate = units.map((unit: any) => ({
      ...unit,
      tower: towerId,
      project: tower.project,
      builder: tower.builder
    }));

    const createdUnits = await Unit.insertMany(unitsToCreate, { ordered: false });

    // Update tower inventory
    if (typeof (tower as any).updateInventory === 'function') {
      await (tower as any).updateInventory();
    }

    res.status(201).json({
      success: true,
      message: `${createdUnits.length} units created successfully`,
      data: { count: createdUnits.length }
    });
  } catch (error: any) {
    console.error('Bulk create units error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create units'
    });
  }
};

// Get units for a tower with filters
export const getTowerUnits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { towerId } = req.params;
    const {
      status,
      unitType,
      floor,
      facing,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      page = '1',
      limit = '50',
      sortBy = 'floor',
      sortOrder = 'asc'
    } = req.query;

    const query: any = { tower: towerId, isActive: true };

    if (status) query.status = status;
    if (unitType) query.unitType = unitType;
    if (floor) query.floor = Number(floor);
    if (facing) query.facing = facing;
    if (minPrice || maxPrice) {
      query['pricing.totalPrice'] = {};
      if (minPrice) query['pricing.totalPrice'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.totalPrice'].$lte = Number(maxPrice);
    }
    if (minArea || maxArea) {
      query['area.superBuiltUp'] = {};
      if (minArea) query['area.superBuiltUp'].$gte = Number(minArea);
      if (maxArea) query['area.superBuiltUp'].$lte = Number(maxArea);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const [units, total] = await Promise.all([
      Unit.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .select('-statusHistory'),
      Unit.countDocuments(query)
    ]);

    // Get status counts
    const statusCounts = await Unit.aggregate([
      { $match: { tower: new mongoose.Types.ObjectId(towerId), isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts: Record<string, number> = {};
    statusCounts.forEach((c: { _id: string; count: number }) => {
      counts[c._id] = c.count;
    });

    res.json({
      success: true,
      data: {
        units,
        statusCounts: counts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    console.error('Get tower units error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch units'
    });
  }
};

// Get single unit details
export const getUnit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findById(unitId)
      .populate('project', 'name slug location')
      .populate('tower', 'name type')
      .populate('builder', 'companyName brandName');

    if (!unit) {
      res.status(404).json({ success: false, message: 'Unit not found' });
      return;
    }

    res.json({
      success: true,
      data: unit
    });
  } catch (error: any) {
    console.error('Get unit error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch unit'
    });
  }
};

// Update unit
export const updateUnit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { unitId } = req.params;
    const userId = req.user?.userId;

    const unit = await Unit.findById(unitId);
    if (!unit) {
      res.status(404).json({ success: false, message: 'Unit not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || unit.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    // Don't allow changing project, tower, or builder
    delete req.body.project;
    delete req.body.tower;
    delete req.body.builder;

    const updatedUnit = await Unit.findByIdAndUpdate(
      unitId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Unit updated successfully',
      data: updatedUnit
    });
  } catch (error: any) {
    console.error('Update unit error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update unit'
    });
  }
};

// Update unit status (book, sell, release, hold)
export const updateUnitStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { unitId } = req.params;
    const { action, ...data } = req.body;
    const userId = req.user?.userId;

    const unit = await Unit.findById(unitId);
    if (!unit) {
      res.status(404).json({ success: false, message: 'Unit not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || unit.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    let updatedUnit;

    switch (action) {
      case 'book':
        updatedUnit = await (unit as any).book(data, userId);
        break;
      case 'sell':
        updatedUnit = await (unit as any).markSold(data, userId);
        break;
      case 'release':
        updatedUnit = await (unit as any).release(data.reason || 'Released by builder', userId);
        break;
      case 'hold':
        updatedUnit = await (unit as any).holdUnit(data, userId);
        break;
      case 'block':
        unit.status = 'blocked';
        (unit as any)._statusChangedBy = userId;
        (unit as any)._statusChangeReason = data.reason || 'Blocked by builder';
        updatedUnit = await unit.save();
        break;
      default:
        res.status(400).json({ success: false, message: 'Invalid action' });
        return;
    }

    res.json({
      success: true,
      message: `Unit ${action}ed successfully`,
      data: updatedUnit
    });
  } catch (error: any) {
    console.error('Update unit status error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update unit status'
    });
  }
};

// Bulk update unit prices
export const bulkUpdatePrices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { towerId } = req.params;
    const { pricePerSqft, floorRise, facingPremiums, unitTypeFilter } = req.body;
    const userId = req.user?.userId;

    const tower = await Tower.findById(towerId);
    if (!tower) {
      res.status(404).json({ success: false, message: 'Tower not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || tower.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    const query: any = { tower: towerId, status: 'available', isActive: true };
    if (unitTypeFilter) query.unitType = unitTypeFilter;

    const units = await Unit.find(query);
    let updatedCount = 0;

    for (const unit of units) {
      let updated = false;

      if (pricePerSqft) {
        unit.pricing.pricePerSqft = pricePerSqft;
        unit.pricing.basePrice = pricePerSqft * unit.area.superBuiltUp;
        updated = true;
      }

      if (floorRise !== undefined) {
        unit.pricing.floorRise = floorRise * unit.floor;
        updated = true;
      }

      if (facingPremiums && facingPremiums[unit.facing]) {
        unit.pricing.facingPremium = facingPremiums[unit.facing];
        updated = true;
      }

      if (updated) {
        await unit.save();
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `${updatedCount} units updated`,
      data: { updatedCount }
    });
  } catch (error: any) {
    console.error('Bulk update prices error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update prices'
    });
  }
};

// Get project inventory summary
export const getProjectInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Get tower-wise inventory
    const towers = await Tower.find({ project: projectId, isActive: true })
      .select('name type structure inventory construction status')
      .sort({ displayOrder: 1 });

    // Get overall inventory stats
    const overallStats = await Unit.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId), isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$pricing.totalPrice' }
        }
      }
    ]);

    // Get unit type distribution
    const unitTypeStats = await Unit.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId), isActive: true } },
      {
        $group: {
          _id: { unitType: '$unitType', status: '$status' },
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricing.totalPrice' }
        }
      }
    ]);

    // Get floor-wise availability
    const floorStats = await Unit.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId), isActive: true, status: 'available' } },
      {
        $group: {
          _id: '$floor',
          available: { $sum: 1 },
          minPrice: { $min: '$pricing.totalPrice' },
          maxPrice: { $max: '$pricing.totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const statusMap: Record<string, { count: number; value: number }> = {};
    overallStats.forEach((s: { _id: string; count: number; totalValue: number }) => {
      statusMap[s._id] = { count: s.count, value: s.totalValue };
    });

    res.json({
      success: true,
      data: {
        project: {
          id: project._id,
          name: project.name
        },
        towers,
        summary: {
          total: Object.values(statusMap).reduce((a, b) => a + b.count, 0),
          available: statusMap.available?.count || 0,
          booked: statusMap.booked?.count || 0,
          sold: statusMap.sold?.count || 0,
          blocked: statusMap.blocked?.count || 0,
          hold: statusMap.hold?.count || 0,
          totalValue: Object.values(statusMap).reduce((a, b) => a + b.value, 0),
          availableValue: statusMap.available?.value || 0,
          soldValue: statusMap.sold?.value || 0
        },
        unitTypeStats,
        floorStats
      }
    });
  } catch (error: any) {
    console.error('Get project inventory error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch inventory'
    });
  }
};

// Generate units automatically for a tower
export const generateUnits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { towerId } = req.params;
    const { unitConfig } = req.body;
    const userId = req.user?.userId;

    const tower = await Tower.findById(towerId);
    if (!tower) {
      res.status(404).json({ success: false, message: 'Tower not found' });
      return;
    }

    // Verify ownership
    const builder = await Builder.findOne({ user: userId });
    if (!builder || tower.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    // Check if units already exist
    const existingUnits = await Unit.countDocuments({ tower: towerId });
    if (existingUnits > 0) {
      res.status(400).json({
        success: false,
        message: 'Units already exist for this tower. Delete them first to regenerate.'
      });
      return;
    }

    const units: any[] = [];
    const { totalFloors, unitsPerFloor, groundFloor } = tower.structure;
    const startFloor = groundFloor ? 0 : 1;
    const endFloor = groundFloor ? totalFloors - 1 : totalFloors;

    for (let floor = startFloor; floor <= endFloor; floor++) {
      for (let unitNum = 1; unitNum <= unitsPerFloor; unitNum++) {
        const floorLabel = floor === 0 ? 'G' : floor.toString();
        const unitNumber = `${tower.name.charAt(0)}-${floorLabel}${unitNum.toString().padStart(2, '0')}`;

        // Find matching unit config
        const config = unitConfig?.find((c: any) => 
          (!c.floors || c.floors.includes(floor)) &&
          (!c.unitPositions || c.unitPositions.includes(unitNum))
        ) || unitConfig?.[0] || {};

        units.push({
          project: tower.project,
          tower: towerId,
          builder: tower.builder,
          unitNumber,
          floor,
          floorName: floor === 0 ? 'Ground Floor' : `${floor}${getOrdinalSuffix(floor)} Floor`,
          unitType: config.unitType || '2 BHK',
          category: config.category || 'apartment',
          facing: config.facing || 'east',
          area: {
            carpet: config.carpetArea || 800,
            builtUp: config.builtUpArea || 1000,
            superBuiltUp: config.superBuiltUpArea || 1200,
            unit: 'sqft'
          },
          configuration: {
            bedrooms: config.bedrooms || 2,
            bathrooms: config.bathrooms || 2,
            balconies: config.balconies || 1,
            parking: config.parking || 1
          },
          pricing: {
            basePrice: (config.pricePerSqft || 5000) * (config.superBuiltUpArea || 1200),
            pricePerSqft: config.pricePerSqft || 5000,
            floorRise: (config.floorRisePerFloor || 50) * floor,
            totalPrice: (config.pricePerSqft || 5000) * (config.superBuiltUpArea || 1200) + ((config.floorRisePerFloor || 50) * floor * (config.superBuiltUpArea || 1200))
          },
          status: 'available'
        });
      }
    }

    await Unit.insertMany(units);

    // Update tower inventory
    if (typeof (tower as any).updateInventory === 'function') {
      await (tower as any).updateInventory();
    }

    res.status(201).json({
      success: true,
      message: `${units.length} units generated successfully`,
      data: { count: units.length }
    });
  } catch (error: any) {
    console.error('Generate units error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate units'
    });
  }
};

// Helper function for ordinal suffix
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
