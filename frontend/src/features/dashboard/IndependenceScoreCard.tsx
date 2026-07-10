import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value || 0);

const useScoreStatus = (score: number) => {
  const { t } = useTranslation();
  if (score >= 150) return { label: t('dashboard.statusOptimal'), color: 'text-emerald-400', badge: 'badge-success' };
  if (score >= 100) return { label: t('dashboard.statusSafe'), color: 'text-primary', badge: 'badge-info' };
  if (score >= 50) return { label: t('dashboard.statusAttention'), color: 'text-amber-400', badge: 'badge-warning' };
  return { label: t('dashboard.statusCritical'), color: 'text-red-400', badge: 'badge-danger' };
};

interface IndependenceScoreCardProps {
  independenceScore: number;
  scalableRevenue: number;
  totalFixedCosts: number;
}

export function IndependenceScoreCard({
  independenceScore,
  scalableRevenue,
  totalFixedCosts,
}: IndependenceScoreCardProps) {
  const { t } = useTranslation();
  const status = useScoreStatus(independenceScore);

  return (
    <Card className="lg:col-span-2 tech-card border-primary/20 bg-gradient-to-br from-card/50 to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          {t('dashboard.independenceScore')}
        </CardTitle>
        <CardDescription>
          {t('dashboard.independenceScoreDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-end gap-4">
          <span className={`text-7xl font-heading font-bold ${status.color}`}>
            {independenceScore}%
          </span>
          <div className="pb-2 space-y-1">
            <Badge className={status.badge}>{status.label}</Badge>
            <p className="text-xs text-muted-foreground italic">
              {independenceScore >= 100
                ? t('dashboard.coveredByModules')
                : t('dashboard.dependsOnHours')}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('dashboard.progressToSafety')}
            </span>
            <span className="font-mono">
              {Math.min(100, Math.round((independenceScore / 150) * 100))}%
            </span>
          </div>
          <Progress value={(independenceScore / 150) * 100} className="h-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
              {t('dashboard.scalableRevenue')}
            </p>
            <p className="text-xl font-bold font-mono">{formatCurrency(scalableRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
              {t('dashboard.fixedCosts')}
            </p>
            <p className="text-xl font-bold font-mono text-red-400">
              -{formatCurrency(totalFixedCosts)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
