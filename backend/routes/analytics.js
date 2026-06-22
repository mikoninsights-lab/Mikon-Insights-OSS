import express from 'express';
import { Project, FixedCost, Service, User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get date range for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Aggregate projects by category
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalBudget: { $sum: '$totalBudget' },
          totalInvoiced: { $sum: '$invoicedAmount' },
          totalHours: { $sum: '$actualHours' }
        }
      }
    ]);

    // Get total revenue (invoiced amount)
    const revenueData = await Project.aggregate([
      {
        $match: { invoicedAmount: { $gt: 0 } }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$invoicedAmount' },
          scalableRevenue: {
            $sum: {
              $cond: [
                { $in: ['$category', ['Recurrente Pasivo', 'Pay per Use']] },
                '$invoicedAmount',
                0
              ]
            }
          },
          consultancyRevenue: {
            $sum: {
              $cond: [
                { $in: ['$category', ['Puntual', 'Mantenimiento', 'Recurrente Activo']] },
                '$invoicedAmount',
                0
              ]
            }
          },
          bonusRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$category', 'Bonus por Éxito'] },
                '$invoicedAmount',
                0
              ]
            }
          }
        }
      }
    ]);

    // Get monthly fixed costs
    const monthlyExpenses = await FixedCost.aggregate([
      {
        $match: {
          dueDate: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' }
        }
      }
    ]);

    // Get total fixed costs (all time for coverage calculation)
    const totalFixedCosts = await FixedCost.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get active maintenance hours (for capacity)
    const maintenanceProjects = await Project.find({
      category: 'Mantenimiento',
      status: { $in: ['In Progress', 'Completed'] }
    }).lean();

    const committedMaintenanceHours = maintenanceProjects.reduce(
      (sum, p) => sum + (p.actualHours || p.estimatedHours || 0),
      0
    );

    // Get user capacity
    const user = await User.findById(req.user.id).lean();
    const maxCapacity = user?.maxHoursCapacity || 160;

    // Active projects + module-usage efficiency (for the dashboard's "Eficiencia" card)
    const activeProjectsCount = await Project.countDocuments({ status: 'In Progress' });
    const totalProjectsCount = await Project.countDocuments();
    const projectsUsingModules = await Project.countDocuments({
      linkedServiceIds: { $exists: true, $not: { $size: 0 } }
    });
    const efficiencyScore = totalProjectsCount > 0
      ? Math.round((projectsUsingModules / totalProjectsCount) * 100)
      : 0;

    // Monthly revenue trends (last 12 months)
    const revenueByMonth = await Project.aggregate([
      {
        $match: {
          billingStartDate: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$billingStartDate' },
            month: { $month: '$billingStartDate' }
          },
          revenue: { $sum: '$invoicedAmount' },
          scalable: {
            $sum: {
              $cond: [
                { $in: ['$category', ['Recurrente Pasivo', 'Pay per Use']] },
                '$invoicedAmount',
                0
              ]
            }
          },
          consultancy: {
            $sum: {
              $cond: [
                { $in: ['$category', ['Puntual', 'Mantenimiento', 'Recurrente Activo']] },
                '$invoicedAmount',
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Expenses by category
    const expensesByCategory = await FixedCost.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Calculate key metrics
    const revenue = revenueData[0] || { totalRevenue: 0, scalableRevenue: 0, consultancyRevenue: 0, bonusRevenue: 0 };
    const monthlyFixed = monthlyExpenses[0]?.totalExpenses || 0;
    
    // Independence Score: (Scalable Revenue) / Monthly Fixed Costs
    const independenceScore = monthlyFixed > 0 
      ? Math.min(((revenue.scalableRevenue || 0) / monthlyFixed) * 100, 200)
      : 0;

    // Capacity usage percentage
    const capacityUsage = maxCapacity > 0 
      ? (committedMaintenanceHours / maxCapacity) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        kpis: {
          totalRevenue: revenue.totalRevenue || 0,
          scalableRevenue: revenue.scalableRevenue || 0,
          consultancyRevenue: revenue.consultancyRevenue || 0,
          bonusRevenue: revenue.bonusRevenue || 0,
          monthlyExpenses: monthlyFixed,
          totalFixedCosts: totalFixedCosts[0]?.total || 0,
          independenceScore: Math.round(independenceScore * 10) / 10,
          capacityUsage: Math.round(capacityUsage * 10) / 10,
          maxCapacity,
          committedHours: committedMaintenanceHours,
          activeProjects: activeProjectsCount,
          efficiencyScore
        },
        projectStats,
        revenueByMonth,
        expensesByCategory
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// ROI Simulator endpoint
router.post('/roi-simulator', authenticateToken, async (req, res) => {
  try {
    const { 
      estimatedHours, 
      hourlyRate = 75,
      modulesUsed = 0,
      modulesSavings = 0.2, // 20% savings per module
      complexityModifier = 1.0
    } = req.body;

    // Base calculation
    const baseRevenue = estimatedHours * hourlyRate * complexityModifier;
    
    // Savings from using existing modules
    const moduleSavingsAmount = baseRevenue * (modulesUsed * modulesSavings);
    
    // Effective cost (time investment)
    const effectiveHours = estimatedHours * (1 - (modulesUsed * modulesSavings));
    
    // ROI calculation
    const roi = effectiveHours > 0 
      ? ((baseRevenue - (effectiveHours * hourlyRate)) / (effectiveHours * hourlyRate)) * 100
      : 0;

    // Efficiency score
    const efficiencyScore = Math.min(100, modulesUsed * 25 + (100 - complexityModifier * 50));

    res.json({
      success: true,
      data: {
        baseRevenue: Math.round(baseRevenue * 100) / 100,
        moduleSavings: Math.round(moduleSavingsAmount * 100) / 100,
        effectiveHours: Math.round(effectiveHours * 10) / 10,
        projectedMargin: Math.round((baseRevenue - effectiveHours * hourlyRate) * 100) / 100,
        roi: Math.round(roi * 10) / 10,
        efficiencyScore: Math.round(efficiencyScore * 10) / 10
      }
    });
  } catch (error) {
    console.error('ROI simulator error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating ROI'
    });
  }
});

export default router;
