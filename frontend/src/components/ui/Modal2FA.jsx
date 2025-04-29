// src/components/modals/Modal2FA.jsx
import { X, Lock, ClipboardCopy } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Modal2FA({
  isOpen,
  onClose,
  qrUrl,
  secretManual,
  otpCode,
  setOtpCode,
  onConfirm,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(secretManual)
      .then(() => {
        setCopied(true);
        toast.success('Código copiado al portapapeles');
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        toast.error('No se pudo copiar');
      });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full animate-fadeIn scale-95">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Configura tu autenticador
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* QR */}
        <div className="flex justify-center mb-4">
          <img src={qrUrl} alt="QR Code" className="w-40 h-40" />
        </div>

        {/* Código manual */}
        {secretManual && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">¿No puedes escanear?</p>
            <div className="mt-2 flex items-center justify-center gap-2 relative">
              <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded select-all">
                {secretManual}
              </span>

              <button
                onClick={handleCopy}
                className="text-gray-600 dark:text-gray-300 hover:text-primary transition relative"
                title="Copiar código"
              >
                <ClipboardCopy size={20} />
              </button>

              {/* Badge de copiado */}
              {copied && (
                <div className="absolute -top-6 right-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full animate-fadeIn">
                  ¡Copiado!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input de código */}
        <Input
          label="Código de verificación"
          placeholder="Ingresa el código OTP"
          value={otpCode}
          onChange={e => setOtpCode(e.target.value)}
        />

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            <Lock className="w-4 h-4 mr-2" />
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}
