import { useMemo } from 'react';

/**
  Calculates the financial freedom ratio (Independence Score).
  Uses useMemo to prevent unnecessary calculations.
  Formula: (Scalable Revenue / Monthly Fixed Costs) * 100
*/
export function useIndependenceScore(scalableRevenue: number, fixedCosts: number) {
  return useMemo(() => {
    if (!fixedCosts || fixedCosts <= 0) return 0;
    const score = (scalableRevenue / fixedCosts) * 100;
    // Cap at 200% as in backend aggregation or return actual rounded score
    return Math.round(score * 10) / 10;
  }, [scalableRevenue, fixedCosts]);
}
