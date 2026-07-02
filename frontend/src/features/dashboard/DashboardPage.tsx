import { useDashboardData } from '@/hooks/useDashboardData';
import { useIndependenceScore } from '@/hooks/useIndependenceScore';
import { useCapacityAlert } from '@/hooks/useCapacityAlert';
import {
  TrendingUp,
  CreditCard,
  Zap,
  ArrowUpRight,
  Target,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndependenceScoreCard } from './IndependenceScoreCard';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value || 0);

export default function DashboardPage() {
  const {
    totalFixedCosts,
    scalableRevenue,
    totalRevenue,
    efficiencyScore,
    activeProjects,
    committedHours,
    maxCapacity,
  } = useDashboardData();

  const independenceScore = useIndependenceScore(scalableRevenue, totalFixedCosts);
  const capacityAlert = useCapacityAlert(committedHours, maxCapacity);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground">
            Monitor de salud financiera y operativa de Mikon Insights
          </p>
        </div>
        <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20">
          <Activity className="w-3 h-3 mr-1" />
          Modo Laboratorio Activo
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <IndependenceScoreCard
          independenceScore={independenceScore}
          scalableRevenue={scalableRevenue}
          totalFixedCosts={totalFixedCosts}
        />

        <div className="space-y-6">
          <Card className="tech-card border-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 text-[10px]">
                  EFICIENCIA
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Uso de Módulos XAI</p>
              <h3 className="text-3xl font-heading font-bold">{efficiencyScore}%</h3>
              <p className="text-xs text-muted-foreground mt-2">Proyectos que aprovechan el Lab</p>
            </CardContent>
          </Card>

          <Card className="tech-card border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Target className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-amber-500/20 text-amber-400 text-[10px]">
                  OPERACIONES
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Proyectos Activos</p>
              <h3 className="text-3xl font-heading font-bold">{activeProjects}</h3>
              <p className="text-xs text-muted-foreground mt-2">Carga de trabajo actual</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Ingresos Totales',  value: formatCurrency(totalRevenue),                                  icon: TrendingUp,  color: 'text-primary'      },
          { title: 'Gastos Mensuales',  value: formatCurrency(totalFixedCosts),                               icon: CreditCard,  color: 'text-red-400'      },
          { title: 'Margen Bruto',      value: formatCurrency(totalRevenue - totalFixedCosts),                icon: ArrowUpRight, color: 'text-emerald-400' },
          { title: 'Alerta Capacidad',  value: `${capacityAlert.percentage}% (${capacityAlert.status})`,     icon: AlertTriangle, color: capacityAlert.color },
        ].map((item, i) => (
          <Card key={i} className="tech-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">{item.title}</span>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <p className="text-lg font-bold font-mono">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
