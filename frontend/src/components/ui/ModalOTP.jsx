// src/components/modals/ModalOTP.jsx
import { X, Lock } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export default function ModalOTP({ isOpen, onClose, otpCode, setOtpCode, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full animate-fadeIn scale-95">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Verificar Código 2FA
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <Input
          label="Código de verificación"
          placeholder="Ingresa tu código 2FA"
          value={otpCode}
          onChange={e => setOtpCode(e.target.value)}
        />

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            <Lock className="w-4 h-4 mr-2" /> Verificar
          </Button>
        </div>
      </div>
    </div>
  );
}
