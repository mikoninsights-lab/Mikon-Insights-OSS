import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, type Locale } from 'date-fns';
import { es, enUS, ca } from 'date-fns/locale';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { RevenueMonthEntry } from '@/lib/api';

const DATE_LOCALES: Record<string, Locale> = { es, en: enUS, ca };

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(value || 0);

interface RevenueChartProps {
  data: RevenueMonthEntry[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = DATE_LOCALES[i18n.language] || es;

  const chartData = useMemo(
    () =>
      data.map((entry) => ({
        month: format(new Date(entry._id.year, entry._id.month - 1, 1), 'MMM yyyy', {
          locale: dateLocale,
        }),
        scalable: entry.scalable,
        consultancy: entry.consultancy,
        total: entry.revenue,
      })),
    [data, dateLocale]
  );

  return (
    <Card className="tech-card h-[420px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          {t('dashboard.revenueChartTitle')}
        </CardTitle>
        <CardDescription>{t('dashboard.revenueChartDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            {t('dashboard.revenueChartEmpty')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScalable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--mikon-primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--mikon-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConsultancy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--mikon-secondary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--mikon-secondary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                tickFormatter={(value) => formatCurrency(value)}
                width={70}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: 'rgba(10, 10, 10, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(8px)',
                  fontSize: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-[10px] font-bold uppercase tracking-widest ml-1">{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="scalable"
                name={t('dashboard.chartScalable')}
                stackId="revenue"
                stroke="var(--mikon-primary)"
                strokeWidth={2}
                fill="url(#colorScalable)"
              />
              <Area
                type="monotone"
                dataKey="consultancy"
                name={t('dashboard.chartConsultancy')}
                stackId="revenue"
                stroke="var(--mikon-secondary)"
                strokeWidth={2}
                fill="url(#colorConsultancy)"
              />
              <Line
                type="monotone"
                dataKey="total"
                name={t('dashboard.chartTotal')}
                stroke="#ffffff"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
