// src/widgets/thing/ThingCard.jsx
import { useState, useMemo } from 'react';
import { useDeviceLive } from '@/hooks/useDeviceLive';
import { useDeviceAcks } from '@/hooks/useDeviceAcks';
import { sendDesired, sendCommand } from '@/api/deviceActions.api';
import MetricChart from '@/components/ui/MetricChart';

export default function ThingCard({ deviceId, name, tempSensorId }) {
  const { online, metrics, lastSeen } = useDeviceLive(deviceId);
  useDeviceAcks(deviceId);
  const [busy, setBusy] = useState(false);

  const lightOn = useMemo(() => typeof metrics.lightOn === 'boolean' ? metrics.lightOn : false, [metrics]);

  async function toggleLight(next) {
    try {
      setBusy(true);
      await sendDesired(deviceId, { lightOn: next }, `desired-lightOn-${deviceId}`);
    } finally {
      setBusy(false);
    }
  }
  async function setLightDuration(seconds) {
    try {
      setBusy(true);
      await sendDesired(deviceId, { lightDuration: seconds }, `desired-lightDuration-${deviceId}-${seconds}`);
    } finally {
      setBusy(false);
    }
  }
  async function reboot() {
    try {
      setBusy(true);
      await sendCommand(deviceId, 'reboot', {}, `cmd-reboot-${deviceId}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{name || deviceId}</h3>
        <span className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border
          ${online ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
          <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-600' : 'bg-red-600'}`} />
          {online ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="text-xs text-gray-500 mt-1">Último evento: {lastSeen}</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
        {Object.entries(metrics).map(([k, v]) => (
          <div key={k} className="rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-500">{k}</div>
            <div className="text-xl font-semibold">{String(v)}</div>
          </div>
        ))}
      </div>

      <hr className="my-4" />

      <div className="flex flex-wrap items-center gap-2">
        <button disabled={busy} onClick={() => toggleLight(true)}  className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          {lightOn ? '💡 Encendida' : '💡 Encender'}
        </button>
        <button disabled={busy} onClick={() => toggleLight(false)} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          💤 Apagar
        </button>

        <span className="ml-2 text-sm text-gray-600">Duración (s):</span>
        {[60, 300, 900].map(s => (
          <button key={s} disabled={busy} onClick={() => setLightDuration(s)}
            className="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm">
            {s}
          </button>
        ))}

        <div className="ml-auto" />
        <button disabled={busy} onClick={reboot} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          🔄 Reboot
        </button>
      </div>

      {tempSensorId && (
        <div className="mt-4">
          <MetricChart sensorId={tempSensorId} label="Temperatura" rangeMinutes={180} bucket="5m" />
        </div>
      )}
    </div>
  );
}
