import { useMemo } from 'react';

/**
  Monitors consultant workload capacity and alerts if usage is near limits.
  Trigger threshold: 90% capacity.
  Returns percentage, active alert flag, status tier, and associated color styles.
*/
export function useCapacityAlert(committedHours: number, maxCapacity: number = 160) {
  return useMemo(() => {
    const percentage = maxCapacity > 0 ? (committedHours / maxCapacity) * 100 : 0;
    const hasAlert = percentage >= 90;
    
    let status: 'Baja' | 'Media' | 'Alta' | 'Peligro' = 'Baja';
    let color = 'text-emerald-400';
    let badgeClass = 'badge-success';

    if (percentage >= 90) {
      status = 'Peligro';
      color = 'text-red-400';
      badgeClass = 'badge-danger';
    } else if (percentage >= 70) {
      status = 'Alta';
      color = 'text-amber-400';
      badgeClass = 'badge-warning';
    } else if (percentage >= 40) {
      status = 'Media';
      color = 'text-blue-400';
      badgeClass = 'badge-info';
    }

    return {
      percentage: Math.round(percentage * 10) / 10,
      hasAlert,
      status,
      color,
      badgeClass,
    };
  }, [committedHours, maxCapacity]);
}
