import { useState, useEffect, useCallback } from 'react';
import { format, type Locale } from 'date-fns';
import { es, enUS, ca } from 'date-fns/locale';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAuditLogs, type AuditLogEntry } from '@/lib/api';

const ACTION_BADGE: Record<string, string> = {
  create: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  update: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  delete: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const DATE_LOCALES: Record<string, Locale> = { es, en: enUS, ca };

export default function AuditLogPage() {
  const { t, i18n } = useTranslation();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const ACTION_LABEL: Record<string, string> = {
    create: t('auditLog.actionCreate'),
    update: t('auditLog.actionUpdate'),
    delete: t('auditLog.actionDelete'),
  };

  const dateLocale = DATE_LOCALES[i18n.language] || es;

  const loadLogs = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const data = await getAuditLogs(targetPage);
      setLogs(data.logs);
      setPage(data.pagination.page);
      setPages(data.pagination.pages || 1);
      setTotal(data.pagination.total);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
          <ScrollText className="w-8 h-8 text-primary" />
          {t('auditLog.title')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('auditLog.subtitle')}
        </p>
      </div>

      <Card className="tech-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('auditLog.colDate')}</TableHead>
                <TableHead>{t('auditLog.colUser')}</TableHead>
                <TableHead>{t('auditLog.colAction')}</TableHead>
                <TableHead>{t('auditLog.colEntity')}</TableHead>
                <TableHead>{t('auditLog.colDetail')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t('auditLog.loading')}
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t('auditLog.noRecords')}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {format(new Date(log.createdAt), "d MMM yyyy, HH:mm", { locale: dateLocale })}
                    </TableCell>
                    <TableCell className="text-sm">{log.userEmail}</TableCell>
                    <TableCell>
                      <Badge className={ACTION_BADGE[log.action]}>{ACTION_LABEL[log.action]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.entityType}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.entityLabel}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
            <p className="text-xs text-muted-foreground">{t('auditLog.recordsCount', { count: total })}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => loadLogs(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {page} / {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages || loading}
                onClick={() => loadLogs(page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
