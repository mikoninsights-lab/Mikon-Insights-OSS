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
import { ALL_STAGES, STAGE_LABELS } from './constants';

export interface LeadForm {
  name: string;
  company: string;
  value: number;
  stage: string;
  score: number;
  interestedService: string;
  notes: string;
}

interface LeadFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingLead: { _id: string; name: string } | null;
  form: LeadForm;
  onFormChange: (form: LeadForm) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  services: { _id: string; name: string }[];
}

export function LeadFormDialog({
  isOpen,
  onOpenChange,
  editingLead,
  form,
  onFormChange,
  onSubmit,
  isSubmitting,
  services,
}: LeadFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="modal-content sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {editingLead ? 'Actualizar Lead' : 'Nuevo Lead'}
          </DialogTitle>
          <DialogDescription>Configura los datos del lead en el pipeline</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input
                value={form.company}
                onChange={(e) => onFormChange({ ...form, company: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor Estimado (€)</Label>
              <Input
                type="number"
                min={0}
                value={form.value}
                onChange={(e) => onFormChange({ ...form, value: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <Label>Etapa</Label>
              <Select value={form.stage} onValueChange={(val) => onFormChange({ ...form, stage: val })}>
                <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Puntuación (0-100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.score}
                onChange={(e) => onFormChange({ ...form, score: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <Label>Servicio de Interés</Label>
              <Select
                value={form.interestedService || 'none'}
                onValueChange={(val) => onFormChange({ ...form, interestedService: val === 'none' ? '' : val })}
              >
                <SelectTrigger className="input-field"><SelectValue placeholder="Ninguno" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  {services.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Input
              value={form.notes}
              onChange={(e) => onFormChange({ ...form, notes: e.target.value })}
              className="input-field"
              placeholder="Contexto del lead, próximos pasos..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="btn-primary" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
