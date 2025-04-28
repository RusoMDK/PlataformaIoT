// src/pages/user/tabs/PrivacidadTab.jsx
import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Dialog, DialogTrigger, DialogContent } from '../../../components/ui/Dialog';
import { Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function PrivacidadTab({ onDeleteAccount }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await onDeleteAccount(); // 🔥 Llama la función real que elimine cuenta
      toast.success('✅ Tu cuenta fue eliminada correctamente.');
      setOpenDialog(false);
    } catch (error) {
      console.error('❌ Error eliminando cuenta:', error);
      toast.error('Error al eliminar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Privacidad y Seguridad
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Aquí puedes gestionar la privacidad de tu cuenta. Si deseas eliminar tu cuenta
            permanentemente, puedes hacerlo abajo. Esta acción es irreversible.
          </p>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="lg" className="w-full mt-4">
                <Trash2 className="w-5 h-5 mr-2" />
                Eliminar cuenta permanentemente
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <h3 className="text-lg font-semibold mb-2">¿Estás seguro?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Esta acción eliminará tu cuenta y todos tus datos. No podrás recuperarlos.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setOpenDialog(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete} disabled={loading}>
                  {loading ? 'Eliminando...' : 'Sí, eliminar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
