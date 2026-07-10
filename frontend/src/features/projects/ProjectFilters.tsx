import { useTranslation } from 'react-i18next';
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
import { CATEGORIES, STATUSES } from './constants';

interface ProjectFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  categoryFilter: string;
  onCategoryChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
}

export function ProjectFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
}: ProjectFiltersProps) {
  const { t } = useTranslation();
  return (
    <Card className="tech-card p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('projects.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
        <Select
          value={categoryFilter || 'all'}
          onValueChange={(val) => onCategoryChange(val === 'all' ? '' : val)}
        >
          <SelectTrigger className="w-full md:w-56 input-field">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder={t('projects.colCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('projects.allCategories')}</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter || 'all'}
          onValueChange={(val) => onStatusChange(val === 'all' ? '' : val)}
        >
          <SelectTrigger className="w-full md:w-44 input-field">
            <SelectValue placeholder={t('projects.colStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('projects.allStatuses')}</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
