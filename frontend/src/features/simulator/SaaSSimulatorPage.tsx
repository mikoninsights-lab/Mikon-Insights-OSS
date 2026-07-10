import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSaaSSimulator } from '@/hooks/useSaaSSimulator';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Info,
  ArrowUpRight,
  Target,
  BarChart3,
  ChevronRight,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k €`;
  }
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(value || 0);
};

interface SimulatorSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  icon?: any;
  description?: string;
}

function SimulatorSlider({ label, value, onChange, min, max, step, unit, icon: Icon, description }: SimulatorSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            {Icon && <Icon className="w-4 h-4 text-primary" />}
          </div>
          <span className="text-sm font-medium">{label}</span>
          {description && (
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] bg-background/95 backdrop-blur-md border-primary/20">
                  <p className="text-xs">{description}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-sm font-bold text-primary">
            {value}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">{unit}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([val]: number[]) => onChange(val)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color = 'primary' }: { title: string, value: string, icon?: any, color?: string }) {
  const colorClasses = {
    primary: 'text-primary border-primary/20 bg-primary/5',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
  };

  return (
    <Card className={`tech-card overflow-hidden group hover:border-primary/40 transition-all duration-300`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            {Icon && <Icon className="w-4 h-4" />}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-heading font-bold tracking-tight">
            {value}
          </p>
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary/50 to-transparent w-0 group-hover:w-full transition-all duration-500" />
    </Card>
  );
}

export default function SaaSSimulatorPage() {
  const { t } = useTranslation();
  const simulator = useSaaSSimulator();

  useEffect(() => {
    simulator.calculate();
  }, [
    simulator.monthlyPrice,
    simulator.initialCustomers,
    simulator.newCustomersPerMonth,
    simulator.churnRate,
    simulator.horizonMonths
  ]);

  const chartData = useMemo(() => {
    return simulator.projections.map(p => ({
      name: `M${p.month}`,
      Base: p.baseMRR,
      Optimista: p.optimisticMRR,
      Pesimista: p.pessimisticMRR,
    }));
  }, [simulator.projections]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 py-1">
              {t('saas.badge')}
            </Badge>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">
            {t('saas.title')} <span className="text-primary">{t('saas.titleHighlight')}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {t('saas.subtitle')}
          </p>
        </div>

        <div className="flex p-1 bg-muted/30 rounded-xl border border-border/40 w-fit">
          <button
            onClick={() => simulator.setHorizon(12)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${simulator.horizonMonths === 12 ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('saas.months12')}
          </button>
          <button
            onClick={() => simulator.setHorizon(24)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${simulator.horizonMonths === 24 ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('saas.months24')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Parameters */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="tech-card border-primary/10 shadow-2xl shadow-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-heading flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                {t('saas.parameters')}
              </CardTitle>
              <CardDescription>
                {t('saas.parametersDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <SimulatorSlider
                label={t('saas.monthlyPrice')}
                value={simulator.monthlyPrice}
                onChange={simulator.setPrice}
                min={5}
                max={500}
                step={1}
                unit="€"
                icon={DollarSign}
                description={t('saas.monthlyPriceDesc')}
              />

              <SimulatorSlider
                label={t('saas.initialCustomers')}
                value={simulator.initialCustomers}
                onChange={simulator.setInitialCustomers}
                min={0}
                max={100}
                step={1}
                unit="CLI"
                icon={Users}
                description={t('saas.initialCustomersDesc')}
              />

              <SimulatorSlider
                label={t('saas.newCustomers')}
                value={simulator.newCustomersPerMonth}
                onChange={simulator.setNewCustomers}
                min={0}
                max={50}
                step={1}
                unit="CLI"
                icon={ArrowUpRight}
                description={t('saas.newCustomersDesc')}
              />

              <SimulatorSlider
                label={t('saas.churn')}
                value={simulator.churnRate}
                onChange={simulator.setChurn}
                min={0}
                max={20}
                step={0.5}
                unit="%"
                icon={Percent}
                description={t('saas.churnDesc')}
              />
            </CardContent>
          </Card>

          {/* Education Block */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20 space-y-4">
            <h3 className="font-heading font-bold text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              {t('saas.whatWeMeasure')}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-foreground">{t('saas.mrrTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('saas.mrrDesc')}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t('saas.arrTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('saas.arrDesc')}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t('saas.churnTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('saas.churnRateDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visualization & Metrics */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              title={t('saas.mrrFinal')}
              value={formatCurrency(simulator.finalMRR)}
              icon={BarChart3}
              color="primary"
            />
            <MetricCard
              title={t('saas.arrEstimated')}
              value={formatCurrency(simulator.finalARR)}
              icon={Calendar}
              color="emerald"
            />
            <MetricCard
              title={t('saas.customers')}
              value={simulator.finalCustomers.toString()}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title={t('saas.cumulativeRevenue')}
              value={formatCurrency(simulator.cumulativeRevenue)}
              icon={TrendingUp}
              color="amber"
            />
          </div>

          <Card className="tech-card h-[450px] flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-heading">{t('saas.mrrProjection')}</CardTitle>
                  <CardDescription>{t('saas.scenarios')}</CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">M0 - M{simulator.horizonMonths}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}}
                    interval={window.innerWidth < 768 ? 4 : 2}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}}
                    tickFormatter={(value) => `${value}€`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 10, 10, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(8px)',
                      fontSize: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest ml-1">{value}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="Optimista"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOpt)"
                    strokeDasharray="5 5"
                  />
                  <Area
                    type="monotone"
                    dataKey="Base"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBase)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Pesimista"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="transparent"
                    strokeDasharray="3 3"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-muted/20 border border-border/50">
              <h4 className="font-heading font-bold mb-2 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-primary" />
                {t('saas.churnImpact')}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('saas.churnImpactDesc', {
                  from: simulator.churnRate,
                  to: Math.max(0, simulator.churnRate - 1),
                  months: simulator.horizonMonths,
                })}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-muted/20 border border-border/50">
              <h4 className="font-heading font-bold mb-2 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-primary" />
                {t('saas.scalability')}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('saas.scalabilityDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
