// src/widgets/thing/ControlSwitch.jsx
import { useState } from 'react';
import { setDesired } from '@/api/deviceActions.api';
import Switch from '@/components/ui/Switch';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function ControlSwitch({
  deviceId,
  label = 'Interruptor',
  desiredKey = 'pumpOn',
  initial = false,
}) {
  const [value, setValue] = useState(!!initial);
  const [loading, setLoading] = useState(false);

  async function handleToggle(next) {
    try {
      setLoading(true);
      setValue(next);
      await setDesired(deviceId, { [desiredKey]: next });
      toast.success(`${label}: ${next ? 'ON' : 'OFF'}`);
    } catch (e) {
      setValue(!next);
      toast.error('No se pudo enviar desired');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-white/70 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {value ? 'Encendido' : 'Apagado'}
          </p>
        </div>
        <Switch
          checked={value}
          disabled={loading}
          onChange={handleToggle}
          aria-label={label}
        />
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={loading}
          onClick={() => handleToggle(true)}
        >
          Encender
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => handleToggle(false)}
        >
          Apagar
        </Button>
      </div>
    </div>
  );
}
