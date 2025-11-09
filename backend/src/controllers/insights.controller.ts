import { Request, Response } from 'express';
import Property from '../models/Property.model';
import Inquiry from '../models/Inquiry.model';
import User from '../models/User.model';
import logger from '../utils/logger';

// Get overview statistics
export const getOverview = async (_req: Request, res: Response) => {
  try {
    // Get totals
    const [totalProperties, totalInquiries, totalUsers, propertiesWithViews] = await Promise.all([
      Property.countDocuments(),
      Inquiry.countDocuments(),
      User.countDocuments(),
      Property.find().select('stats.views')
    ]);

    const totalViews = propertiesWithViews.reduce((sum, prop) => sum + (prop.stats?.views || 0), 0);

    // Get previous period for growth calculation (30 days ago)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [prevProperties, prevInquiries, prevUsers] = await Promise.all([
      Property.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      Inquiry.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } })
    ]);

    const [currProperties, currInquiries, currUsers] = await Promise.all([
      Property.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Inquiry.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Calculate growth rates
    const growthRates = {
      properties: prevProperties > 0 ? ((currProperties - prevProperties) / prevProperties) * 100 : 0,
      inquiries: prevInquiries > 0 ? ((currInquiries - prevInquiries) / prevInquiries) * 100 : 0,
      users: prevUsers > 0 ? ((currUsers - prevUsers) / prevUsers) * 100 : 0,
      views: 0 // Views growth calculation would need historical data
    };

    res.json({
      success: true,
      data: {
        totalProperties,
        totalInquiries,
        totalUsers,
        totalViews,
        growthRates
      }
    });
  } catch (error) {
    logger.error('Error fetching overview:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch overview data' });
  }
};

// Get properties posted timeline
export const getPropertiesTimeline = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const timeline = await Property.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1
        }
      }
    ]);

    res.json({ success: true, data: timeline });
  } catch (error) {
    logger.error('Error fetching properties timeline:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timeline data' });
  }
};

// Get inquiries timeline
export const getInquiriesTimeline = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const timeline = await Inquiry.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1
        }
      }
    ]);

    res.json({ success: true, data: timeline });
  } catch (error) {
    logger.error('Error fetching inquiries timeline:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inquiries timeline' });
  }
};

// Get property type distribution
export const getPropertyTypes = async (_req: Request, res: Response) => {
  try {
    const distribution = await Property.aggregate([
      {
        $group: {
          _id: "$propertyType",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    const dataWithPercentage = distribution.map(item => ({
      ...item,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
    }));

    res.json({ success: true, data: dataWithPercentage });
  } catch (error) {
    logger.error('Error fetching property types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch property types' });
  }
};

// Get top locations
export const getTopLocations = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const locations = await Property.aggregate([
      {
        $match: {
          $and: [
            { "location.city": { $exists: true, $nin: [null, ""] } },
            { "location.state": { $exists: true, $nin: [null, ""] } }
          ]
        }
      },
      {
        $group: {
          _id: {
            city: "$location.city",
            state: "$location.state"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 0,
          city: "$_id.city",
          state: "$_id.state",
          count: 1
        }
      }
    ]);

    res.json({ success: true, data: locations });
  } catch (error) {
    logger.error('Error fetching top locations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch top locations' });
  }
};

// Get top properties by views
export const getTopProperties = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const properties = await Property.find()
      .sort({ 'stats.views': -1 })
      .limit(limit)
      .select('title price location stats propertyType')
      .populate('owner', 'profile.name email');

    res.json({ success: true, data: properties });
  } catch (error) {
    logger.error('Error fetching top properties:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch top properties' });
  }
};

// Get user registration timeline
export const getUserRegistrations = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const timeline = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1
        }
      }
    ]);

    res.json({ success: true, data: timeline });
  } catch (error) {
    logger.error('Error fetching user registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user registrations' });
  }
};

// Get properties by type (drill-down)
export const getPropertiesByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const properties = await Property.find({ propertyType: type })
      .sort({ 'stats.views': -1 })
      .limit(limit)
      .select('title price location stats propertyType createdAt')
      .populate('owner', 'profile.name email');

    res.json({ success: true, data: properties });
  } catch (error) {
    logger.error('Error fetching properties by type:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
};

// Get properties by location (drill-down)
export const getPropertiesByLocation = async (req: Request, res: Response) => {
  try {
    const { city, state } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;

    const filter: any = {};
    if (city) filter['location.city'] = city;
    if (state) filter['location.state'] = state;

    const properties = await Property.find(filter)
      .sort({ 'stats.views': -1 })
      .limit(limit)
      .select('title price location stats propertyType createdAt')
      .populate('owner', 'profile.name email');

    res.json({ success: true, data: properties });
  } catch (error) {
    logger.error('Error fetching properties by location:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
};

// Get properties by date range (drill-down)
export const getPropertiesByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!date) {
      res.status(400).json({ success: false, message: 'Date parameter required' });
      return;
    }

    const startDate = new Date(date as string);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const properties = await Property.find({
      createdAt: { $gte: startDate, $lt: endDate }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title price location stats propertyType createdAt')
      .populate('owner', 'profile.name email');

    res.json({ success: true, data: properties });
  } catch (error) {
    logger.error('Error fetching properties by date:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
};
