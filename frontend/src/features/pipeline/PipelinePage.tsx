import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Clock, MoreHorizontal, Filter, Plus, Target, ChevronRight, Edit, Trash2, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { getLeads, createLead, updateLead, deleteLead, getServices } from '@/lib/api';
import { PipelineFilters } from './PipelineFilters';
import { LeadFormDialog, type LeadForm } from './LeadFormDialog';
import { BOARD_STAGES, ALL_STAGES, STAGE_LABEL_KEYS, STAGE_COLORS, TEMP_CLASSES, getTemp, daysInStage } from './constants';

const emptyForm: LeadForm = {
  name: '',
  company: '',
  value: 0,
  stage: 'new',
  score: 50,
  interestedService: '',
  notes: '',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value || 0);

export default function PipelinePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const { data: leads = [], isLoading } = useQuery({ queryKey: ['leads'], queryFn: () => getLeads() });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: getServices });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['leads'] });

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => { toast.success(t('pipeline.newLead')); invalidate(); setIsModalOpen(false); },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLead(id, data),
    onSuccess: () => { toast.success(t('pipeline.formTitleEdit')); invalidate(); setIsModalOpen(false); },
    onError: (err: any) => toast.error(err.message),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => updateLead(id, { stage }),
    onSuccess: () => { toast.success(t('pipeline.moveToStage')); invalidate(); },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => { toast.success(t('common.delete')); invalidate(); setDeleteTarget(null); },
    onError: (err: any) => { toast.error(err.message); setDeleteTarget(null); },
  });

  const filteredLeads = (leads as any[]).filter((l) => {
    const matchesSearch = l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase());
    const matchesStage = !stageFilter || l.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const openCreate = () => { setEditingLead(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (lead: any) => {
    setEditingLead(lead);
    setForm({
      name: lead.name,
      company: lead.company || '',
      value: lead.value || 0,
      stage: lead.stage,
      score: lead.score ?? 50,
      interestedService: lead.interestedService?._id || lead.interestedService || '',
      notes: lead.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error(t('common.nameRequired')); return; }
    const payload = { ...form, interestedService: form.interestedService || undefined };
    if (editingLead) {
      updateMutation.mutate({ id: editingLead._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">{t('pipeline.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('pipeline.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-card/50"
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {t('pipeline.filters')}
          </Button>
          <Button size="sm" className="btn-primary" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t('pipeline.newLead')}
          </Button>
        </div>
      </div>

      {showFilters && (
        <PipelineFilters
          search={search}
          onSearchChange={setSearch}
          stageFilter={stageFilter}
          onStageChange={setStageFilter}
        />
      )}

      {isLoading ? (
        <div className="flex gap-6 overflow-x-auto pb-6">
          {BOARD_STAGES.map((s) => <Skeleton key={s} className="min-w-[300px] w-[300px] h-[500px]" />)}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin">
          {BOARD_STAGES.map((stage, colIdx) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage);
            const stageTotal = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0);

            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIdx * 0.06 }}
                className="min-w-[300px] w-[300px] shrink-0"
              >
                <div className={`rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm border-t-4 ${STAGE_COLORS[stage]} flex flex-col h-full shadow-lg shadow-black/20`}>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        {t(STAGE_LABEL_KEYS[stage])}
                      </h3>
                      <p className="text-sm font-mono font-bold text-primary">{formatCurrency(stageTotal)}</p>
                    </div>
                    <Badge variant="outline" className="bg-muted/50 border-border/50 text-[10px]">
                      {stageLeads.length}
                    </Badge>
                  </div>

                  <div className="p-3 space-y-3 min-h-[500px]">
                    {stageLeads.map((lead) => {
                      const temp = getTemp(lead.score ?? 50);
                      const days = daysInStage(lead.stageUpdatedAt || lead.createdAt);
                      return (
                        <motion.div
                          key={lead._id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openEdit(lead)}
                          className="rounded-xl bg-card border border-border/50 p-4 cursor-pointer hover:border-primary/50 transition-all group shadow-sm hover:shadow-primary/5"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-bold group-hover:text-primary transition-colors">{lead.name}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {lead.company || t('pipeline.noCompany')}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => openEdit(lead)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  {t('common.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                                    {t('pipeline.moveToStage')}
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    {ALL_STAGES.filter((s) => s !== lead.stage).map((s) => (
                                      <DropdownMenuItem key={s} onClick={() => moveMutation.mutate({ id: lead._id, stage: s })}>
                                        {t(STAGE_LABEL_KEYS[s])}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(lead)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {t('common.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-foreground">{formatCurrency(lead.value)}</span>
                              <Badge className={`text-[9px] font-bold px-2 py-0.5 border ${TEMP_CLASSES[temp]}`}>
                                {temp.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${lead.score ?? 50}%` }} />
                              </div>
                              <span className="text-[9px] font-mono text-muted-foreground">{lead.score ?? 50}</span>
                            </div>
                          </div>

                          {days > 7 && (
                            <div className="mt-3 flex items-center gap-1.5 text-[9px] text-red-400 font-bold uppercase tracking-wider">
                              <Clock className="h-3 w-3" />
                              {days} {t('pipeline.daysStuck')}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                    {stageLeads.length === 0 && (
                      <div className="h-32 border-2 border-dashed border-border/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground/30">
                        <ChevronRight className="w-6 h-6 rotate-90" />
                        <span className="text-[10px] font-bold uppercase">{t('pipeline.noActivity')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <LeadFormDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingLead={editingLead}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        services={services as any[]}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="modal-content sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('pipeline.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('common.confirmDeleteDesc', { name: deleteTarget?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteTarget._id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
