import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  CreditCard,
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
import { getExpenses, createExpense, updateExpense, deleteExpense } from '@/lib/api';

const CATEGORIES = ['Seguridad Social', 'Tecnología', 'Nóminas', 'Servicios', 'Marketing', 'Otros'];
const FREQUENCIES = ['Mensual', 'Trimestral', 'Anual', 'Puntual'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value || 0);
};

const getCategoryBadge = (category: string) => {
  const colors: Record<string, string> = {
    'Seguridad Social': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Tecnología': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Nóminas': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Servicios': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Marketing': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Otros': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

const emptyForm = {
  concept: '',
  category: CATEGORIES[0],
  frequency: 'Mensual',
  amount: 0,
  dueDate: new Date().toISOString().slice(0, 10),
};

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  });
  const expenses = data?.expenses || [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['expenses'] });

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => { toast.success('Gasto creado'); invalidate(); setIsModalOpen(false); },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateExpense(id, data),
    onSuccess: () => { toast.success('Gasto actualizado'); invalidate(); setIsModalOpen(false); },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => { toast.success('Gasto eliminado'); invalidate(); setDeleteTarget(null); },
    onError: (err: any) => { toast.error(err.message); setDeleteTarget(null); },
  });

  const filteredExpenses = expenses.filter((e: any) => !categoryFilter || e.category === categoryFilter);
  const totalAmount = filteredExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);

  const openCreate = () => { setEditingExpense(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (expense: any) => {
    setEditingExpense(expense);
    setForm({
      concept: expense.concept,
      category: expense.category,
      frequency: expense.frequency,
      amount: expense.amount,
      dueDate: expense.dueDate?.slice(0, 10) || emptyForm.dueDate,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.concept.trim()) {
      toast.error('El concepto es obligatorio');
      return;
    }
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense._id, data: form });
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
            <CreditCard className="w-8 h-8 text-secondary" />
            Gastos Fijos
          </h1>
          <p className="text-muted-foreground text-sm">Gestiona la estructura de costes operativos de Mikon Insights</p>
        </div>
        <Button onClick={openCreate} className="btn-secondary">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Gasto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="tech-card border-secondary/20 bg-secondary/5 p-6 md:col-span-1">
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total (Filtrado)</p>
          <p className="text-4xl font-heading font-bold text-secondary">{formatCurrency(totalAmount)}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Estructura de costes optimizada
          </div>
        </Card>

        <Card className="tech-card p-4 md:col-span-2 flex items-center">
          <div className="w-full">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3 ml-1">Filtrar por Categoría</p>
            <Select value={categoryFilter || 'all'} onValueChange={(val) => setCategoryFilter(val === 'all' ? '' : val)}>
              <SelectTrigger className="w-full input-field h-12">
                <Filter className="w-4 h-4 mr-2 text-secondary" />
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <Card className="tech-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="table-header">Concepto</TableHead>
                <TableHead className="table-header">Categoría</TableHead>
                <TableHead className="table-header">Frecuencia</TableHead>
                <TableHead className="table-header text-right">Importe</TableHead>
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
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Sin gastos todavía
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense: any) => (
                  <TableRow key={expense._id} className="table-row">
                    <TableCell className="font-medium">{expense.concept}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryBadge(expense.category)}>
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{expense.frequency}</TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(expense)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(expense)}
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
              {editingExpense ? 'Actualizar Gasto' : 'Nuevo Gasto'}
            </DialogTitle>
            <DialogDescription>Configura los parámetros del gasto fijo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Concepto</Label>
              <Input
                value={form.concept}
                onChange={(e) => setForm({ ...form, concept: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Importe (€)</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <Label>Vencimiento</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                  <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frecuencia</Label>
                <Select value={form.frequency} onValueChange={(val) => setForm({ ...form, frequency: val })}>
                  <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button className="btn-secondary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="modal-content sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar gasto?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará "{deleteTarget?.concept}".
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
