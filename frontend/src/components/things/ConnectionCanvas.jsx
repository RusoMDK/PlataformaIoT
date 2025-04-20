// src/components/things/ConnectionCanvas.jsx
import { useEffect, useRef } from 'react';

export default function ConnectionCanvas({ conexiones = [] }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🔌 Dibujar cada conexión como una línea
    conexiones.forEach(con => {
      const { from, to, color = '#3B82F6' } = con;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }, [conexiones]);

  return (
    <div className="relative w-full h-96 border rounded-xl bg-white dark:bg-dark-surface overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="absolute top-0 left-0 pointer-events-none"
      />
      <div className="absolute inset-0 grid place-items-center text-gray-400 dark:text-gray-600 text-sm">
        Aquí se visualizarán las conexiones entre sensores y pines
      </div>
    </div>
  );
}
