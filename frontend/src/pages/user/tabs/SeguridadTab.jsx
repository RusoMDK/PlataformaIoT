import { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { ShieldCheck, KeyRound, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const getPasswordStrength = password => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

export default function SeguridadTab({ onChangePassword }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const passwordStrength = getPasswordStrength(newPassword);

  const handleUpdatePassword = async () => {
    try {
      setLoading(true);
      await onChangePassword(currentPassword, newPassword);
      toast.success('✅ Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setRepeatPassword('');
      setConfirmOpen(false);
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      toast.error('Error al actualizar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !repeatPassword) {
      toast.warning('Completa todos los campos');
      return;
    }

    if (newPassword.length < 8) {
      toast.warning('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== repeatPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    setConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Seguridad de la cuenta
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm mb-1 block text-gray-600 dark:text-gray-300">
                Contraseña actual
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm mb-1 block text-gray-600 dark:text-gray-300">
                Nueva contraseña
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              {/* Indicador de fuerza */}
              {newPassword && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Seguridad:{' '}
                  <span
                    className={
                      passwordStrength < 3
                        ? 'text-red-500'
                        : passwordStrength === 3
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }
                  >
                    {passwordStrength < 3 ? 'Débil' : passwordStrength === 3 ? 'Media' : 'Fuerte'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm mb-1 block text-gray-600 dark:text-gray-300">
                Confirmar nueva
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={repeatPassword}
                onChange={e => setRepeatPassword(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto mt-6">
            {loading ? (
              'Guardando...'
            ) : (
              <>
                <KeyRound className="w-4 h-4 mr-1" />
                Actualizar contraseña
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Modal Confirmación */}
      <Transition show={confirmOpen} as={Fragment}>
        <Dialog
          onClose={() => setConfirmOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <Dialog.Panel className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Confirmar cambio
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro que quieres actualizar tu contraseña? Esta acción cerrará tu sesión
              actual en otros dispositivos.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdatePassword} loading={loading}>
                Confirmar
              </Button>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>
    </div>
  );
}
