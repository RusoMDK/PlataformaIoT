// src/hooks/useDeviceLive.js
import { useEffect, useMemo, useRef, useState } from 'react';
import { getDashboardSocket } from '../lib/socketDashboard';

export function useDeviceLive(deviceId) {
  const [online, setOnline] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [lastTs, setLastTs] = useState(null);
  const socketRef = useRef(getDashboardSocket());

  useEffect(() => {
    const s = socketRef.current;
    const onState = p => { if (p.deviceId === deviceId) { setOnline(!!p.online); setLastTs(p.ts || Date.now()); } };
    const onTelemetry = p => { if (p.deviceId === deviceId) { setMetrics(prev => ({ ...prev, ...(p.metrics || {}) })); setLastTs(p.ts || Date.now()); } };
    const onHeartbeat = p => { if (p.deviceId === deviceId) { setLastTs(p.ts || Date.now()); } };

    s.on('device:state', onState);
    s.on('device:telemetry', onTelemetry);
    s.on('device:heartbeat', onHeartbeat);
    return () => {
      s.off('device:state', onState);
      s.off('device:telemetry', onTelemetry);
      s.off('device:heartbeat', onHeartbeat);
    };
  }, [deviceId]);

  const lastSeen = useMemo(() => (lastTs ? new Date(lastTs).toLocaleString() : '—'), [lastTs]);
  return { online, metrics, lastTs, lastSeen };
}
