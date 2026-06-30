import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/api';

const CATEGORIES = [
  'N1: Auditoría de Salud',
  'N2: Diagnóstico XAI',
  'N3: Brújula Predictiva',
  'N4: Módulo Anticipación',
  'N5: Partner Estratégico',
  'Mantenimiento'
];

const STATUSES = ['Lead', 'In Progress', 'Completed', 'Cancelled'];

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
    'Mantenimiento': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    'Lead': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Completed': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
};

const emptyForm = { name: '', client: '', category: CATEGORIES[0], totalBudget: 0, status: 'Lead' };

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });
  const projects = data?.projects || [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['projects'] });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => { toast.success('Proyecto creado'); invalidate(); setIsModalOpen(false); },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProject(id, data),
    onSuccess: () => { toast.success('Proyecto actualizado'); invalidate(); setIsModalOpen(false); },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => { toast.success('Proyecto eliminado'); invalidate(); setDeleteTarget(null); },
    onError: (err: any) => { toast.error(err.message); setDeleteTarget(null); },
  });

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.client?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openCreate = () => { setEditingProject(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (project: any) => {
    setEditingProject(project);
    setForm({
      name: project.name,
      client: project.client || '',
      category: project.category,
      totalBudget: project.totalBudget || 0,
      status: project.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (editingProject) {
      updateMutation.mutate({ id: editingProject._id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" />
            Proyectos
          </h1>
          <p className="text-muted-foreground text-sm">Gestiona la cartera de operaciones estratégicas de Mikon</p>
        </div>
        <Button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <Card className="tech-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente o proyecto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          <Select value={categoryFilter || 'all'} onValueChange={(val) => setCategoryFilter(val === 'all' ? '' : val)}>
            <SelectTrigger className="w-full md:w-56 input-field">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter || 'all'} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
            <SelectTrigger className="w-full md:w-44 input-field">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="tech-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="table-header">Proyecto / Cliente</TableHead>
                <TableHead className="table-header">Categoría</TableHead>
                <TableHead className="table-header">Estado</TableHead>
                <TableHead className="table-header text-right">Presupuesto</TableHead>
                <TableHead className="table-header w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Sin proyectos todavía
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project: any) => (
                  <TableRow key={project._id} className="table-row">
                    <TableCell>
                      <div>
                        <p className="font-bold text-foreground">{project.name}</p>
                        <p className="text-xs text-muted-foreground italic">{project.client}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryBadge(project.category)}>
                        {project.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {formatCurrency(project.totalBudget)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(project)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(project)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="modal-content sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editingProject ? 'Actualizar Operación' : 'Nueva Operación'}
            </DialogTitle>
            <DialogDescription>
              Configura los parámetros del proyecto estratégico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre del Proyecto</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Input
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Presupuesto (€)</Label>
                <Input
                  type="number"
                  value={form.totalBudget}
                  onChange={(e) => setForm({ ...form, totalBudget: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
                  <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="modal-content sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar proyecto?</DialogTitle>
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
