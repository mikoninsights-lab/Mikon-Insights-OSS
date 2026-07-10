export type Stage = 'new' | 'nurturing' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type Temp = 'hot' | 'warm' | 'cold';

export const STAGE_LABELS: Record<Stage, string> = {
  new: 'Nuevo Lead',
  nurturing: 'Nutriendo',
  contacted: 'Contactado',
  proposal: 'Propuesta',
  negotiation: 'Negociación',
  won: 'Ganado',
  lost: 'Perdido',
};

export const STAGE_COLORS: Record<Stage, string> = {
  new: 'border-t-primary',
  nurturing: 'border-t-sky-400',
  contacted: 'border-t-amber-400',
  proposal: 'border-t-orange-400',
  negotiation: 'border-t-red-500',
  won: 'border-t-emerald-500',
  lost: 'border-t-muted-foreground',
};

// "Lost" isn't shown as a board column (keeps the active pipeline focused)
// but remains a reachable stage from the card menu and the lead form.
export const BOARD_STAGES: Stage[] = ['new', 'nurturing', 'contacted', 'proposal', 'negotiation', 'won'];
export const ALL_STAGES: Stage[] = [...BOARD_STAGES, 'lost'];

export const getTemp = (score: number): Temp => {
  if (score >= 75) return 'hot';
  if (score >= 50) return 'warm';
  return 'cold';
};

export const TEMP_CLASSES: Record<Temp, string> = {
  hot: 'bg-red-500/20 text-red-400 border-red-500/30',
  warm: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export const daysInStage = (stageUpdatedAt: string) => {
  const diff = Date.now() - new Date(stageUpdatedAt).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
};
