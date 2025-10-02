// src/hooks/useDeviceAcks.js
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getDashboardSocket } from '../lib/socketDashboard';

export function useDeviceAcks(deviceId) {
  const socketRef = useRef(getDashboardSocket());

  useEffect(() => {
    const s = socketRef.current;
    const onDesiredAck = p => {
      if (p.deviceId !== deviceId) return;
      const keys = Object.keys(p.applied || {});
      toast.success(`✅ Desired aplicado${keys.length ? `: ${keys.join(', ')}` : ''}`);
    };
    const onCommandAck = p => {
      if (p.deviceId !== deviceId) return;
      toast[(p.ok !== false) ? 'success' : 'error'](`${p.ok !== false ? '✅' : '❌'} Command ${p.cmd || ''} ${p.ok !== false ? 'OK' : 'falló'}`);
    };
    s.on('device:desired:ack', onDesiredAck);
    s.on('device:command:ack', onCommandAck);
    return () => {
      s.off('device:desired:ack', onDesiredAck);
      s.off('device:command:ack', onCommandAck);
    };
  }, [deviceId]);
}
