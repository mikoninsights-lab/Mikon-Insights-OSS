import { useState } from 'react';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [maxHoursCapacity, setMaxHoursCapacity] = useState(user?.maxHoursCapacity || 160);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast.error('El nombre de usuario es obligatorio');
      return;
    }
    if (!maxHoursCapacity || maxHoursCapacity <= 0) {
      toast.error('La capacidad debe ser mayor que 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({ username, maxHoursCapacity });
      toast.success('Perfil actualizado');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl">
      <div>
        <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-primary" />
          Mi Perfil
        </h1>
        <p className="text-muted-foreground text-sm">Gestiona tus datos de cuenta y capacidad operativa</p>
      </div>

      <Card className="tech-card">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" /> Email
              </Label>
              <Input value={user?.email || ''} disabled className="input-field opacity-60" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4" /> Rol
              </Label>
              <div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nombre de Usuario</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Capacidad Máxima (horas/mes)
            </Label>
            <Input
              type="number"
              min={1}
              value={maxHoursCapacity}
              onChange={(e) => setMaxHoursCapacity(Number(e.target.value))}
              className="input-field"
            />
            <p className="text-xs text-muted-foreground">
              Usada para calcular la alerta de capacidad en el dashboard.
            </p>
          </div>

          <div className="flex justify-end">
            <Button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
