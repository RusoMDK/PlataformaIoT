// src/pages/user/tabs/SeguridadTab.jsx
import { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { ShieldCheck, KeyRound, Shield, QrCode, Lock, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { generar2FA, activar2FA, desactivar2FA, reset2FA } from '../../../api/2fa.api';
import Modal2FA from '../../../components/ui/Modal2FA';
import { useProfile } from '../../../hooks/useProfile';
import ModalConfirmacion from '../../../components/ui/ModalConfirmacion'; // 👈 nuevo modal que vamos a hacer

export default function SeguridadTab({ onChangePassword }) {
  const { profile, refreshProfile } = useProfile();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);

  const [qrUrl, setQrUrl] = useState(null);
  const [secretManual, setSecretManual] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading2fa, setLoading2fa] = useState(false);

  const [showModalDesactivar, setShowModalDesactivar] = useState(false);
  const [showModalReset, setShowModalReset] = useState(false);

  const is2faEnabled = profile?.is2FAEnabled;

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !repeatPassword) {
      return toast.warning('Completa todos los campos');
    }
    if (newPassword.length < 6) {
      return toast.warning('La nueva contraseña debe tener al menos 6 caracteres');
    }
    if (newPassword !== repeatPassword) {
      return toast.error('Las contraseñas nuevas no coinciden');
    }
    try {
      setLoadingPass(true);
      await onChangePassword(currentPassword, newPassword);
      toast.success('✅ Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setRepeatPassword('');
    } catch (error) {
      console.error(error);
      toast.error('Error actualizando contraseña');
    } finally {
      setLoadingPass(false);
    }
  };

  const handleGenerar2FA = async () => {
    try {
      setLoading2fa(true);
      const { qr, secret } = await generar2FA();
      setQrUrl(qr);
      setSecretManual(secret);
      toast.success('✅ Escanea el QR o usa el código manual');
    } catch (error) {
      console.error(error);
      toast.error('❌ Error generando el QR');
    } finally {
      setLoading2fa(false);
    }
  };

  const handleActivar2FA = async () => {
    if (!otpCode) {
      return toast.warning('Introduce el código de autenticación');
    }
    try {
      setLoading2fa(true);
      await activar2FA(otpCode);
      await refreshProfile();
      toast.success('✅ 2FA activado correctamente');
      setQrUrl(null);
      setOtpCode('');
    } catch (error) {
      console.error(error);
      toast.error('Código inválido o expirado');
    } finally {
      setLoading2fa(false);
    }
  };

  const confirmarDesactivar2FA = async () => {
    try {
      setLoading2fa(true);
      await desactivar2FA();
      await refreshProfile();
      toast.success('✅ 2FA desactivado correctamente');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo desactivar 2FA');
    } finally {
      setLoading2fa(false);
      setShowModalDesactivar(false);
    }
  };

  const confirmarReset2FA = async () => {
    try {
      setLoading2fa(true);
      await reset2FA();
      await refreshProfile();
      toast.success('✅ 2FA reestablecido correctamente');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo reestablecer 2FA');
    } finally {
      setLoading2fa(false);
      setShowModalReset(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cambio de contraseña */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Cambio de contraseña
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Actual"
              type="password"
              placeholder="••••••"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
            <Input
              label="Nueva"
              type="password"
              placeholder="••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <Input
              label="Repetir nueva"
              type="password"
              placeholder="••••••"
              value={repeatPassword}
              onChange={e => setRepeatPassword(e.target.value)}
            />
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={loadingPass}
            className="w-full sm:w-auto mt-4"
          >
            {loadingPass ? 'Guardando...' : 'Actualizar Contraseña'}
          </Button>
        </CardContent>
      </Card>

      {/* Activación de 2FA */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Autenticación en dos pasos (2FA)
          </h2>

          {is2faEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <ShieldCheck className="w-5 h-5" />
                2FA activo en tu cuenta
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="destructive"
                  onClick={() => setShowModalDesactivar(true)}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" /> Desactivar 2FA
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowModalReset(true)}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> ¿Perdiste tu autenticador?
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleGenerar2FA} disabled={loading2fa} className="w-full sm:w-auto">
              {loading2fa ? (
                'Generando...'
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" /> Activar 2FA
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Modal de escaneo QR */}
      <Modal2FA
        isOpen={!!qrUrl}
        onClose={() => {
          setQrUrl(null);
          setOtpCode('');
          setSecretManual('');
        }}
        qrUrl={qrUrl}
        secretManual={secretManual}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        onConfirm={handleActivar2FA}
      />

      {/* Modal Confirmar desactivación 2FA */}
      <ModalConfirmacion
        isOpen={showModalDesactivar}
        onClose={() => setShowModalDesactivar(false)}
        onConfirm={confirmarDesactivar2FA}
        title="¿Desactivar 2FA?"
        description="Esto eliminará la autenticación en dos pasos de tu cuenta. ¿Deseas continuar?"
        confirmText="Desactivar"
      />

      {/* Modal Confirmar reset 2FA */}
      <ModalConfirmacion
        isOpen={showModalReset}
        onClose={() => setShowModalReset(false)}
        onConfirm={confirmarReset2FA}
        title="¿Reestablecer 2FA?"
        description="Esto eliminará tu autenticador actual para que puedas configurarlo de nuevo."
        confirmText="Reestablecer"
      />
    </div>
  );
}
