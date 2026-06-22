import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  ShieldCheck, 
  TrendingUp, 
  CreditCard, 
  Zap, 
  ArrowUpRight,
  Target,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value || 0);
};

export default function DashboardPage() {
  const { 
    independenceScore, 
    totalFixedCosts, 
    scalableRevenue, 
    totalRevenue,
    efficiencyScore,
    activeProjects 
  } = useDashboardData();

  const getScoreStatus = (score: number) => {
    if (score >= 150) return { label: 'Óptimo', color: 'text-emerald-400', badge: 'badge-success' };
    if (score >= 100) return { label: 'Seguro', color: 'text-primary', badge: 'badge-info' };
    if (score >= 50) return { label: 'Atención', color: 'text-amber-400', badge: 'badge-warning' };
    return { label: 'Crítico', color: 'text-red-400', badge: 'badge-danger' };
  };

  const status = getScoreStatus(independenceScore);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground">Monitor de salud financiera y operativa de Mikon Insights</p>
        </div>
        <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20">
          <Activity className="w-3 h-3 mr-1" />
          Modo Laboratorio Activo
        </Badge>
      </div>

      {/* Main KPI: Independence Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 tech-card border-primary/20 bg-gradient-to-br from-card/50 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Independence Score
            </CardTitle>
            <CardDescription>Ratio de cobertura de gastos fijos mediante ingresos escalables</CardDescription>
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
                    ? 'Tus gastos fijos están cubiertos por módulos' 
                    : 'Dependes de horas de consultoría manual'}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progreso hacia el cinturón de seguridad (150%)</span>
                <span className="font-mono">{Math.min(100, Math.round((independenceScore / 150) * 100))}%</span>
              </div>
              <Progress value={(independenceScore / 150) * 100} className="h-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Ingresos Escalables</p>
                <p className="text-xl font-bold font-mono">{formatCurrency(scalableRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Gastos Fijos</p>
                <p className="text-xl font-bold font-mono text-red-400">-{formatCurrency(totalFixedCosts)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="tech-card border-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 text-[10px]">EFICIENCIA</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Uso de Módulos XAI</p>
              <h3 className="text-3xl font-heading font-bold">{efficiencyScore}%</h3>
              <p className="text-xs text-muted-foreground mt-2">
                Proyectos que aprovechan el Lab
              </p>
            </CardContent>
          </Card>

          <Card className="tech-card border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Target className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-amber-500/20 text-amber-400 text-[10px]">OPERACIONES</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Proyectos Activos</p>
              <h3 className="text-3xl font-heading font-bold">{activeProjects}</h3>
              <p className="text-xs text-muted-foreground mt-2">
                Carga de trabajo actual
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Ingresos Totales', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-primary' },
          { title: 'Gastos Mensuales', value: formatCurrency(totalFixedCosts), icon: CreditCard, color: 'text-red-400' },
          { title: 'Margen Bruto', value: formatCurrency(totalRevenue - totalFixedCosts), icon: ArrowUpRight, color: 'text-emerald-400' },
          { title: 'Alerta Capacidad', value: 'Baja', icon: AlertTriangle, color: 'text-blue-400' },
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
