import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function NotificacionesModal({ open, onClose, notificaciones = [] }) {
  return (
    <Modal open={open} onOpenChange={onClose} title="🔔 Notificaciones">
      {notificaciones.length === 0 ? (
        <p className="text-sm text-gray-500">No tienes notificaciones nuevas.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {notificaciones.map((n, idx) => (
            <li key={idx} className="text-sm bg-gray-100 px-3 py-2 rounded shadow-sm">
              {n.mensaje}
            </li>
          ))}
        </ul>
      )}

      <div className="text-right mt-4">
        <Button onClick={onClose} variant="primary">
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}
