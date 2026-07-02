export const CATEGORIES = [
  'N1: Auditoría de Salud',
  'N2: Diagnóstico XAI',
  'N3: Brújula Predictiva',
  'N4: Módulo Anticipación',
  'N5: Partner Estratégico',
  'Mantenimiento',
];

export const STATUSES = ['Lead', 'In Progress', 'Completed', 'Cancelled'];

export const getCategoryBadge = (category: string) => {
  const colors: Record<string, string> = {
    'N1: Auditoría de Salud':  'bg-sky-500/20 text-sky-400 border-sky-500/30',
    'N2: Diagnóstico XAI':     'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'N3: Brújula Predictiva':  'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'N4: Módulo Anticipación': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    'N5: Partner Estratégico': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Mantenimiento':           'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

export const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    'Lead':        'bg-slate-500/20 text-slate-400 border-slate-500/30',
    'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Completed':   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Cancelled':   'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
};
