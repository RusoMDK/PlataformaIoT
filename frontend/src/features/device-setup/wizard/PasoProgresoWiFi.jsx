// src/components/wizard/PasoProgresoWiFi.jsx
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import socket from '../../utils/socket';

const cliLogs = [
  '📦 [arduino-cli] arduino-cli lib install "PubSubClient"',
  ' Already installed PubSubClient@2.8.0',
  '',
  '📦 [arduino-cli] arduino-cli compile --fqbn esp32:esp32:esp32 /sketches/wifi_provision',
  ' Sketch uses 986006 bytes (75%) of program storage space.',
  'Global variables use 46960 bytes (14%) of dynamic memory.',
  '',
  '📦 [arduino-cli] arduino-cli upload -p /dev/tty.usbserial-0001 --fqbn esp32:esp32:esp32 /sketches/wifi_provision',
  ' esptool.py v4.8.1',
  'Serial port /dev/tty.usbserial-0001',
  'Connecting..........',
  'Uploading stub... Running stub...',
  'Changing baud rate to 921600',
  'Configuring flash size...',
  'Writing at 0x00010000... (100 %)',
  'Hash of data verified.',
  '',
  '✅ Sketch compilado y subido correctamente',
  '✅ Firmware flasheado con configuración dinámica',
  '✅ Puerto liberado automáticamente: /dev/tty.usbserial-0001',
];

export default function PasoProgresoWiFi({ formData, setFormData, onComplete }) {
  const [status, setStatus] = useState('pending');
  const [displayed, setDisplayed] = useState(['']);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const typingRef = useRef(null);
  const canvasRef = useRef(null);

  // — Socket handlers —
  useEffect(() => {
    const onSuccess = ({ ip }) => {
      setStatus('success');
      setFormData(prev => ({ ...prev, ip }));
      toast.success(`✅ ¡Listo! La placa está en línea (${ip})`);
      // Damos un tick para que React aplique setFormData antes de avanzar
      setTimeout(() => onComplete(true), 0);
    };
    const onError = ({ motivo }) => {
      setStatus('error');
      toast.error(`❌ Algo salió mal: ${motivo}`);
      onComplete(false);
    };
    socket.on('wifi-configurada', onSuccess);
    socket.on('wifi-config-error', onError);
    return () => {
      socket.off('wifi-configurada', onSuccess);
      socket.off('wifi-config-error', onError);
    };
  }, [formData.uid, setFormData, onComplete]);

  // — Partículas estilo “sketch” —
  useEffect(() => {
    if (status !== 'pending') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = (canvas.width = 200);
    const H = (canvas.height = 200);
    const baseHue = 100;
    const particles = Array.from({ length: 120 }).map(() => ({
      x: W / 2,
      y: H / 2,
      angle: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
      r: 0.5 + Math.random() * 1.5,
      light: 70 + Math.random() * 20,
    }));
    let run = true;
    function draw() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.angle += 0.001;
        p.light += (Math.random() - 0.5) * 0.5;
        p.light = Math.max(60, Math.min(90, p.light));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${baseHue},20%,${p.light}%)`;
        ctx.fill();
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
          p.x = W / 2;
          p.y = H / 2;
        }
      });
      requestAnimationFrame(draw);
    }
    draw();
    return () => {
      run = false;
    };
  }, [status]);

  // — Efecto “maquina de escribir” (60 ms/caracter) —
  useEffect(() => {
    if (status !== 'pending' || lineIndex >= cliLogs.length) return;
    typingRef.current = setTimeout(() => {
      const line = cliLogs[lineIndex];
      if (charIndex < line.length) {
        setDisplayed(disp => {
          const nd = [...disp];
          nd[lineIndex] = (nd[lineIndex] || '') + line[charIndex];
          return nd;
        });
        setCharIndex(ci => ci + 1);
      } else {
        setDisplayed(disp => [...disp, '']);
        setLineIndex(li => li + 1);
        setCharIndex(0);
      }
    }, 60);
    return () => clearTimeout(typingRef.current);
  }, [charIndex, lineIndex, status]);

  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      {status === 'pending' && (
        <>
          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold text-gray-800 dark:text-gray-100"
          >
            💻 El agente está trabajando en tu firmware…
          </motion.h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ten paciencia, esto tomará menos de un minuto.
          </p>
        </>
      )}

      {status === 'pending' && (
        <canvas
          ref={canvasRef}
          className="rounded-full"
          style={{
            width: 200,
            height: 200,
            backgroundColor: 'var(--surface)',
          }}
        />
      )}

      <div
        className="w-full max-w-lg bg-[var(--surface)] text-[var(--text)] font-mono text-sm p-4 rounded-lg overflow-y-auto hide-scrollbar"
        style={{ maxHeight: '40vh' }}
      >
        {status === 'pending' && (
          <>
            {displayed.map((ln, i) => (
              <div key={i}>{ln}</div>
            ))}
            {lineIndex < cliLogs.length && <span className="animate-pulse">█</span>}
          </>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-4 text-center text-green-600 text-lg font-semibold"
          >
            🎉 ¡Conexión establecida! IP: <strong>{formData.ip}</strong>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-4 text-center text-red-500 text-lg font-semibold"
          >
            🚨 No fue posible conectar la red. Por favor, inténtalo de nuevo.
          </motion.div>
        )}
      </div>
    </div>
  );
}
