import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Briefcase, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useEfficiencyScore } from '@/hooks/useEfficiencyScore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/api';
import { ProjectFilters } from './ProjectFilters';
import { ProjectFormDialog, type ProjectForm } from './ProjectFormDialog';
import { CATEGORIES, getCategoryBadge, getStatusBadge } from './constants';

const emptyForm: ProjectForm = {
  name: '',
  client: '',
  category: CATEGORIES[0],
  totalBudget: 0,
  status: 'Lead',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(value || 0);

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const { data, isLoading } = useQuery({ queryKey: ['projects'], queryFn: getProjects });
  const projects = data?.projects || [];

  const avgBudget  = projects.length > 0 ? projects.reduce((acc: number, p: any) => acc + (p.totalBudget || 0), 0) / projects.length : 0;
  const avgModules = projects.length > 0 ? projects.reduce((acc: number, p: any) => acc + (p.linkedServiceIds?.length || 0), 0) / projects.length : 0;
  const avgHours   = projects.length > 0 ? projects.reduce((acc: number, p: any) => acc + (p.actualHours || p.estimatedHours || 0), 0) / projects.length : 0;
  const portfolioEfficiency = useEfficiencyScore(avgBudget, avgModules, avgHours);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['projects'] });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => { toast.success('Proyecto creado'); invalidate(); setIsModalOpen(false); },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectForm }) => updateProject(id, data),
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
    const matchesStatus   = !statusFilter   || p.status   === statusFilter;
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
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (form.totalBudget < 0) { toast.error('El presupuesto no puede ser negativo'); return; }
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
          <p className="text-muted-foreground text-sm">
            Gestiona la cartera de operaciones estratégicas de Mikon Insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          {projects.length > 0 && (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1">
              Eficiencia Media: {portfolioEfficiency}%
            </Badge>
          )}
          <Button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

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
                      <p className="font-bold text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground italic">{project.client}</p>
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
                            <Edit className="w-4 h-4 mr-2" />Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(project)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />Eliminar
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

      <ProjectFormDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingProject={editingProject}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

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
