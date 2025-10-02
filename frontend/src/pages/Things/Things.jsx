import { useEffect, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { getCsrfToken } from '@/api/auth.api';
import ThingCard from '@/widgets/thing/ThingCard';

export default function Things() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const csrf = await getCsrfToken();
      const { data } = await axiosInstance.get('/dispositivos', {
        headers: { 'x-csrf-token': csrf }, withCredentials: true
      });
      setDevices(Array.isArray(data) ? data : []);
    } catch {
      setDevices([]);
    } finally { setLoading(false); }
  })(); }, []);

  if (loading) return <div className="p-4">Cargando...</div>;
  if (!devices.length) return <div className="p-4">No tienes dispositivos aún.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {devices.map(d => (
        <ThingCard key={d.uid} deviceId={d.uid} name={d.nombre} />
      ))}
    </div>
  );
}
