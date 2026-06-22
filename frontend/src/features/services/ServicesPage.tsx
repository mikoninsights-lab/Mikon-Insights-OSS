import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Clock,
  DollarSign,
  CheckCircle,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getServices, createService, updateService, deleteService } from '@/lib/api';

const CATEGORIES = [
  'N1: Auditoría de Salud',
  'N2: Diagnóstico XAI',
  'N3: Brújula Predictiva',
  'N4: Módulo Anticipación',
  'N5: Partner Estratégico',
  'PersonaCraft',
  'CultureCraft',
  'SourceCraft',
  'Workshop',
  'Inmersión',
  'Mantenimiento'
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const getCategoryBadge = (category: string) => {
  const colors: Record<string, string> = {
    'N1: Auditoría de Salud': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    'N2: Diagnóstico XAI': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'N3: Brújula Predictiva': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'N4: Módulo Anticipación': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    'N5: Partner Estratégico': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'PersonaCraft': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'CultureCraft': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'SourceCraft': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Workshop': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    'Inmersión': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Mantenimiento': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

function ServiceCard({ service, onEdit, onDelete }: any) {
  return (
    <Card className="tech-card-hover group border-border/40 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-heading font-bold text-lg mb-1 group-hover:text-primary transition-colors">{service.name}</h3>
            <Badge variant="outline" className={getCategoryBadge(service.category)}>
              {service.category}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(service)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(service)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-xs text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
          {service.description || 'Sin descripción detallada.'}
        </p>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Precio Base</p>
              <p className="font-mono font-bold text-sm">{formatCurrency(service.basePrice)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Desarrollo</p>
              <p className="font-mono font-bold text-sm">{service.developmentCostHours || 0}h</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  {service.isScalable ? 'Escalable' : 'Activo'}
                </span>
            </div>
            {service.basePrice > 5000 && (
                <Badge className="bg-primary/10 text-primary border-none text-[9px] font-bold">ALTO VALOR</Badge>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

const emptyForm = { name: '', description: '', category: CATEGORIES[0], basePrice: 0, developmentCostHours: 0 };

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['services'] });

  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => { toast.success('Servicio creado'); invalidate(); setIsModalOpen(false); },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateService(id, data),
    onSuccess: () => { toast.success('Servicio actualizado'); invalidate(); setIsModalOpen(false); },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => { toast.success('Servicio eliminado'); invalidate(); setDeleteTarget(null); },
    onError: (err: any) => { toast.error(err.message); setDeleteTarget(null); },
  });

  const filteredServices = services.filter((s: any) => !categoryFilter || s.category === categoryFilter);

  const groupedServices = filteredServices.reduce((acc: any, service: any) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {});

  const openCreate = () => { setEditingService(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (service: any) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description || '',
      category: service.category,
      basePrice: service.basePrice,
      developmentCostHours: service.developmentCostHours || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (editingService) {
      updateMutation.mutate({ id: editingService._id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Catálogo de Servicios
          </h1>
          <p className="text-muted-foreground text-sm">Arquitectura de Anticipación y Módulos MicroSaaS de Mikon Insights</p>
        </div>
        <Button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      <Card className="tech-card p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <p className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap">Filtrar Catálogo:</p>
            <Select value={categoryFilter || 'all'} onValueChange={(val) => setCategoryFilter(val === 'all' ? '' : val)}>
                <SelectTrigger className="w-full md:w-64 input-field">
                    <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : Object.keys(groupedServices).length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Sin servicios todavía</p>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedServices).map(([category, catServices]: [string, any]) => (
              <div key={category} className="space-y-4">
                  <div className="flex items-center gap-4">
                      <h2 className="font-heading font-bold text-xl">{category}</h2>
                      <div className="h-px flex-1 bg-border/40" />
                      <Badge variant="secondary" className="font-mono">{catServices.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {catServices.map((service: any) => (
                          <ServiceCard
                              key={service._id}
                              service={service}
                              onEdit={openEdit}
                              onDelete={(s: any) => setDeleteTarget(s)}
                          />
                      ))}
                  </div>
              </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="modal-content sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio Estratégico'}
            </DialogTitle>
            <DialogDescription>Configura los parámetros del servicio en el catálogo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label>Nombre del Servicio</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Diagnóstico XAI"
                />
             </div>
             <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field"
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Precio Base (€)</Label>
                  <Input
                    type="number"
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horas de Desarrollo</Label>
                  <Input
                    type="number"
                    value={form.developmentCostHours}
                    onChange={(e) => setForm({ ...form, developmentCostHours: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
             </div>
             <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                  <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Servicio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="modal-content sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar servicio?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará "{deleteTarget?.name}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteTarget._id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
