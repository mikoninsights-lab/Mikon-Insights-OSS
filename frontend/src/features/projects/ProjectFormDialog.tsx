import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES, STATUSES } from './constants';

export interface ProjectForm {
  name: string;
  client: string;
  category: string;
  totalBudget: number;
  status: string;
}

interface ProjectFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingProject: { _id: string; name: string } | null;
  form: ProjectForm;
  onFormChange: (form: ProjectForm) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ProjectFormDialog({
  isOpen,
  onOpenChange,
  editingProject,
  form,
  onFormChange,
  onSubmit,
  isSubmitting,
}: ProjectFormDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="modal-content sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {editingProject ? t('projects.formTitleEdit') : t('projects.formTitleNew')}
          </DialogTitle>
          <DialogDescription>
            {t('projects.formDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('projects.fieldName')}</Label>
            <Input
              value={form.name}
              onChange={(e) => onFormChange({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('projects.fieldClient')}</Label>
            <Input
              value={form.client}
              onChange={(e) => onFormChange({ ...form, client: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('projects.fieldBudget')}</Label>
              <Input
                type="number"
                min={0}
                value={form.totalBudget}
                onChange={(e) => onFormChange({ ...form, totalBudget: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('projects.fieldStatus')}</Label>
              <Select
                value={form.status}
                onValueChange={(val) => onFormChange({ ...form, status: val })}
              >
                <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('projects.fieldCategory')}</Label>
            <Select
              value={form.category}
              onValueChange={(val) => onFormChange({ ...form, category: val })}
            >
              <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button className="btn-primary" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
