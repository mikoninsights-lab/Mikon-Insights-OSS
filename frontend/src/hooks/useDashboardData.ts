import { useQuery } from '@tanstack/react-query';
import { getDashboardAnalytics } from '@/lib/api';

export function useDashboardData() {
  const { data } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: getDashboardAnalytics,
  });

  const kpis = data?.kpis || {
    totalRevenue: 0,
    scalableRevenue: 0,
    totalFixedCosts: 0,
    monthlyExpenses: 0,
    independenceScore: 0,
    efficiencyScore: 0,
    activeProjects: 0,
    capacityUsage: 0,
    maxCapacity: 160,
    committedHours: 0,
  };

  return {
    totalFixedCosts: kpis.totalFixedCosts,
    scalableRevenue: kpis.scalableRevenue,
    totalRevenue: kpis.totalRevenue,
    independenceScore: kpis.independenceScore,
    efficiencyScore: kpis.efficiencyScore,
    activeProjects: kpis.activeProjects,
    capacityUsage: kpis.capacityUsage,
    maxCapacity: kpis.maxCapacity,
    committedHours: kpis.committedHours,
    revenueByMonth: data?.revenueByMonth || [],
  };
}
