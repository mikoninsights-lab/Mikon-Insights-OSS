import { Project, FixedCost, User } from '../models/index.js';

const SCALABLE_CATEGORIES = ['Recurrente Pasivo', 'Pay per Use'];
const CONSULTANCY_CATEGORIES = ['Puntual', 'Mantenimiento', 'Recurrente Activo'];

async function getProjectStats() {
  return Project.aggregate([
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
}

async function getRevenueBreakdown() {
  const [result] = await Project.aggregate([
    { $match: { invoicedAmount: { $gt: 0 } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$invoicedAmount' },
        scalableRevenue: {
          $sum: { $cond: [{ $in: ['$category', SCALABLE_CATEGORIES] }, '$invoicedAmount', 0] }
        },
        consultancyRevenue: {
          $sum: { $cond: [{ $in: ['$category', CONSULTANCY_CATEGORIES] }, '$invoicedAmount', 0] }
        },
        bonusRevenue: {
          $sum: { $cond: [{ $eq: ['$category', 'Bonus por Éxito'] }, '$invoicedAmount', 0] }
        }
      }
    }
  ]);
  return result || { totalRevenue: 0, scalableRevenue: 0, consultancyRevenue: 0, bonusRevenue: 0 };
}

async function getMonthlyExpenses(startOfMonth, endOfMonth) {
  const [result] = await FixedCost.aggregate([
    { $match: { dueDate: { $gte: startOfMonth, $lte: endOfMonth } } },
    { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
  ]);
  return result?.totalExpenses || 0;
}

async function getTotalFixedCosts() {
  const [result] = await FixedCost.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return result?.total || 0;
}

async function getMaintenanceHours() {
  const maintenanceProjects = await Project.find({
    category: 'Mantenimiento',
    status: { $in: ['In Progress', 'Completed'] }
  }).lean();

  return maintenanceProjects.reduce(
    (sum, p) => sum + (p.actualHours || p.estimatedHours || 0),
    0
  );
}

async function getUserCapacity(userId) {
  const user = await User.findById(userId).lean();
  return user?.maxHoursCapacity || 160;
}

async function getEfficiencyMetrics() {
  const [activeProjectsCount, totalProjectsCount, projectsUsingModules] = await Promise.all([
    Project.countDocuments({ status: 'In Progress' }),
    Project.countDocuments(),
    Project.countDocuments({ linkedServiceIds: { $exists: true, $not: { $size: 0 } } })
  ]);

  const efficiencyScore = totalProjectsCount > 0
    ? Math.round((projectsUsingModules / totalProjectsCount) * 100)
    : 0;

  return { activeProjectsCount, efficiencyScore };
}

async function getRevenueByMonth() {
  // Sort descending + limit to get the most recent 12 months, then reverse
  // to ascending order for the chart's X axis (oldest -> newest).
  const results = await Project.aggregate([
    { $match: { billingStartDate: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: {
          year: { $year: '$billingStartDate' },
          month: { $month: '$billingStartDate' }
        },
        revenue: { $sum: '$invoicedAmount' },
        scalable: {
          $sum: { $cond: [{ $in: ['$category', SCALABLE_CATEGORIES] }, '$invoicedAmount', 0] }
        },
        consultancy: {
          $sum: { $cond: [{ $in: ['$category', CONSULTANCY_CATEGORIES] }, '$invoicedAmount', 0] }
        }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  return results.reverse();
}

async function getExpensesByCategory() {
  return FixedCost.aggregate([
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);
}

export const getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      projectStats,
      revenue,
      monthlyFixed,
      totalFixedCosts,
      committedMaintenanceHours,
      maxCapacity,
      efficiencyMetrics,
      revenueByMonth,
      expensesByCategory
    ] = await Promise.all([
      getProjectStats(),
      getRevenueBreakdown(),
      getMonthlyExpenses(startOfMonth, endOfMonth),
      getTotalFixedCosts(),
      getMaintenanceHours(),
      getUserCapacity(req.user.id),
      getEfficiencyMetrics(),
      getRevenueByMonth(),
      getExpensesByCategory()
    ]);

    // Independence Score: (Scalable Revenue) / Monthly Fixed Costs
    const independenceScore = monthlyFixed > 0
      ? Math.min(((revenue.scalableRevenue || 0) / monthlyFixed) * 100, 200)
      : 0;

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
          totalFixedCosts,
          independenceScore: Math.round(independenceScore * 10) / 10,
          capacityUsage: Math.round(capacityUsage * 10) / 10,
          maxCapacity,
          committedHours: committedMaintenanceHours,
          activeProjects: efficiencyMetrics.activeProjectsCount,
          efficiencyScore: efficiencyMetrics.efficiencyScore
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
};

export const calculateROISimulation = async (req, res) => {
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
};
