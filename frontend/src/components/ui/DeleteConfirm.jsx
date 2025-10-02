import ConfirmDialog from './ConfirmDialog';

/**
 * DeleteConfirm — wrapper listo para eliminaciones
 *
 * Props:
 * - open, onClose, onConfirm (mismos que ConfirmDialog)
 * - entity?: string  -> nombre de la entidad en singular (ej: 'usuario', 'proyecto')
 * - count?: number   -> cantidad a eliminar
 * - items?: string[] -> lista con nombres/ids a mostrar
 * - requireText?: string | boolean -> si true usa 'ELIMINAR' por defecto; si string, usa ese texto
 * - requireCheck?: boolean -> si true muestra checkbox 'Entiendo las consecuencias'
 */
export default function DeleteConfirm({
  open,
  onClose,
  onConfirm,
  entity = 'elemento',
  count = 1,
  items = [],
  requireText = false,
  requireCheck = true,
}) {
  const plural = count === 1 ? entity : `${entity}${entity.endsWith('s') ? 'es' : 's'}`;

  const description = (
    <div className="space-y-2">
      <p>
        Vas a eliminar <strong>{count}</strong> {plural}.
      </p>
      <p className="text-red-600 dark:text-red-300 font-medium">
        Esta acción es permanente y no se puede deshacer.
      </p>
    </div>
  );

  const requireTextValue = requireText === true ? 'ELIMINAR' : (typeof requireText === 'string' ? requireText : '');

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Eliminar ${plural}`}
      description={description}
      items={items}
      tone="danger"
      icon="trash"
      confirmText="Eliminar"
      cancelText="Cancelar"
      requireText={requireTextValue}
      requireCheckLabel={requireCheck ? 'Entiendo las consecuencias' : undefined}
      autoCloseOnConfirm
    />
  );
}
