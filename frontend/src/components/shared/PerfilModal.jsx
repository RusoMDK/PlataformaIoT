import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function PerfilModal({ open, onClose, nombre, correo, onLogout }) {
  return (
    <Modal open={open} onOpenChange={onClose} title="👤 Perfil">
      <div className="space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Nombre:</span> {nombre}
        </p>
        <p>
          <span className="font-semibold">Correo:</span> {correo}
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={onClose} variant="secondary">
          Cerrar
        </Button>
        <Button onClick={onLogout} variant="destructive">
          Cerrar sesión
        </Button>
      </div>
    </Modal>
  );
}
