import { useMemo } from 'react';

/**
  Evaluates if a project leverages existing modules or depends on manual hours.
  Uses useMemo for performance optimization.
  Formula: Base efficiency from modules with hours impact reduction.
*/
export function useEfficiencyScore(budget: number, modulesUsed: number, artisanHours: number) {
  return useMemo(() => {
    if (budget <= 0 && modulesUsed === 0) return 0;
    
    // Base score is derived from modules used (e.g., 25 points each, up to 100)
    const baseScore = modulesUsed * 25;
    
    // Artisan (manual) hours slightly penalize efficiency if they are high
    const hoursPenalty = Math.min(30, artisanHours * 0.5);
    
    const efficiency = Math.max(0, Math.min(100, baseScore - hoursPenalty + 50));
    return Math.round(efficiency);
  }, [budget, modulesUsed, artisanHours]);
}
