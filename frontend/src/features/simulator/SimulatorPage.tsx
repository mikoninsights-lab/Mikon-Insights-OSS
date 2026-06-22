import { useEffect } from 'react';
import { useROISimulator } from '@/hooks/useROISimulator';
import { 
  Calculator, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Package,
  Gauge,
  Target,
  Zap,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const formatCurrency = (value: number) => {
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
          <span className="text-sm font-medium">{label}</span>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <span className="font-mono text-sm text-primary">
          {value}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([val]: number[]) => onChange(val)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function ResultCard({ title, value, subtitle, icon: Icon, variant = 'default' }: { title: string, value: string, subtitle?: string, icon?: any, variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' }) {
  const variants = {
    default: 'border-border/50',
    primary: 'border-primary/40 bg-primary/5',
    secondary: 'border-secondary/40 bg-secondary/5',
    success: 'border-emerald-500/40 bg-emerald-500/5',
    warning: 'border-amber-500/40 bg-amber-500/5',
  };

  const textVariants = {
    default: 'text-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
  };

  return (
    <Card className={`tech-card ${variants[variant]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="stat-label">{title}</span>
          {Icon && <Icon className={`w-4 h-4 ${textVariants[variant]}`} />}
        </div>
        <p className={`text-2xl font-heading font-bold ${textVariants[variant]}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SimulatorPage() {
  const simulator = useROISimulator({
    estimatedHours: 20,
    hourlyRate: 75,
    modulesUsed: 1,
    complexityModifier: 1.0,
  });

  useEffect(() => {
    simulator.calculate();
  }, [simulator.estimatedHours, simulator.hourlyRate, simulator.modulesUsed, simulator.complexityModifier]);

  const getROIStatus = () => {
    if (simulator.roi >= 100) return { color: 'text-emerald-400', label: 'Excelente', variant: 'success' as const };
    if (simulator.roi >= 50) return { color: 'text-primary', label: 'Bueno', variant: 'primary' as const };
    if (simulator.roi >= 0) return { color: 'text-amber-400', label: 'Ajustado', variant: 'warning' as const };
    return { color: 'text-red-400', label: 'Negativo', variant: 'default' as const };
  };

  const roiStatus = getROIStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Calculator className="w-8 h-8 text-primary" />
          Simulador ROI
        </h1>
        <p className="text-muted-foreground">
          Calcula el margen de beneficio proyectado antes de crear un contrato
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                Parámetros del Proyecto
              </CardTitle>
              <CardDescription>
                Ajusta los valores para simular diferentes escenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <SimulatorSlider
                label="Horas Estimadas"
                value={simulator.estimatedHours}
                onChange={simulator.setHours}
                min={1}
                max={200}
                step={1}
                unit="h"
                icon={Clock}
                description="Horas totales estimadas para el proyecto"
              />

              <SimulatorSlider
                label="Tarifa por Hora"
                value={simulator.hourlyRate}
                onChange={simulator.setRate}
                min={25}
                max={200}
                step={5}
                unit="€"
                icon={DollarSign}
                description="Tu tarifa por hora de consultoría"
              />

              <SimulatorSlider
                label="Módulos XAI Aplicados"
                value={simulator.modulesUsed}
                onChange={simulator.setModules}
                min={0}
                max={5}
                step={1}
                unit=""
                icon={Package}
                description="Número de módulos reutilizables (PersonaCraft, CultureCraft, Brújula Predictiva). Cada módulo reduce el tiempo efectivo un 20%"
              />

              <SimulatorSlider
                label="Modificador de Complejidad"
                value={simulator.complexityModifier}
                onChange={simulator.setComplexity}
                min={0.5}
                max={2.0}
                step={0.1}
                unit="x"
                icon={Target}
                description="1.0 = normal. >1 = más complejo (cobra más). <1 = más simple"
              />
            </CardContent>
          </Card>

          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Desglose Visual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horas Originales → Efectivas</span>
                  <span className="font-mono">
                    {simulator.estimatedHours}h → {simulator.effectiveHours}h
                  </span>
                </div>
                <div className="flex h-4 rounded-lg overflow-hidden bg-muted/30">
                  <div 
                    className="bg-primary/60 transition-all duration-300"
                    style={{ width: `${(simulator.effectiveHours / simulator.estimatedHours) * 100}%` }}
                  />
                  <div 
                    className="bg-emerald-500/60 transition-all duration-300"
                    style={{ width: `${((simulator.estimatedHours - simulator.effectiveHours) / simulator.estimatedHours) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="stat-label mb-1">Ingresos Base</p>
                  <p className="font-mono text-lg">{formatCurrency(simulator.baseRevenue)}</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <p className="stat-label mb-1">Ahorro Módulos</p>
                  <p className="font-mono text-lg text-emerald-400">{formatCurrency(simulator.moduleSavings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="tech-card border-primary/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Resultados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/30">
                <p className="stat-label mb-2">ROI Proyectado</p>
                <p className={`text-5xl font-heading font-bold ${roiStatus.color}`}>
                  {simulator.roi}%
                </p>
                <Badge variant="outline" className={`mt-3 ${
                  roiStatus.variant === 'success' ? 'badge-success' : 
                  roiStatus.variant === 'warning' ? 'badge-warning' : 
                  'badge-info'
                }`}>
                  {roiStatus.label}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Score de Eficiencia</span>
                  <span className="font-mono font-medium">{simulator.efficiencyScore}/100</span>
                </div>
                <Progress value={simulator.efficiencyScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <ResultCard
            title="Margen Proyectado"
            value={formatCurrency(simulator.projectedMargin)}
            subtitle="Beneficio neto estimado"
            icon={TrendingUp}
            variant={simulator.projectedMargin > 0 ? 'success' : 'warning'}
          />

          <ResultCard
            title="Horas Efectivas"
            value={`${simulator.effectiveHours}h`}
            subtitle={`De ${simulator.estimatedHours}h originales`}
            icon={Clock}
            variant="primary"
          />

          <ResultCard
            title="Ahorro por Módulos"
            value={formatCurrency(simulator.moduleSavings)}
            subtitle={`${simulator.modulesUsed} módulo(s) aplicado(s)`}
            icon={Package}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}
