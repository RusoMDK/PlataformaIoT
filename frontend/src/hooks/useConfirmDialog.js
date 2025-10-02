import { useContext } from 'react';
import { ConfirmDialogContext } from '../providers/ConfirmDialogProvider';

/**
 * Hook para abrir confirmaciones:
 * const { confirm, confirmDelete } = useConfirmDialog();
 * const ok = await confirm({ title: '¿Seguro?', tone: 'warning' });
 * const okDel = await confirmDelete({ count: 3, entity: 'usuario' });
 */
export default function useConfirmDialog() {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) {
    throw new Error('useConfirmDialog debe usarse dentro de <ConfirmDialogProvider>');
  }
  return ctx;
}
