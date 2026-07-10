import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ALL_STAGES, STAGE_LABELS } from './constants';

interface PipelineFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  stageFilter: string;
  onStageChange: (val: string) => void;
}

export function PipelineFilters({ search, onSearchChange, stageFilter, onStageChange }: PipelineFiltersProps) {
  return (
    <Card className="tech-card p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o empresa..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
        <Select value={stageFilter || 'all'} onValueChange={(val) => onStageChange(val === 'all' ? '' : val)}>
          <SelectTrigger className="w-full md:w-56 input-field">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Etapa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las etapas</SelectItem>
            {ALL_STAGES.map((stage) => (
              <SelectItem key={stage} value={stage}>{STAGE_LABELS[stage]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
