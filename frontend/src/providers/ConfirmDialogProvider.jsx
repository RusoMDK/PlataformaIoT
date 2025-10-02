import { createContext, useCallback, useMemo, useState } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import DeleteConfirm from '../components/ui/DeleteConfirm';

export const ConfirmDialogContext = createContext(null);

/**
 * Proveedor para confirmaciones globales.
 *
 * Uso:
 * <ConfirmDialogProvider>
 *   <App />
 * </ConfirmDialogProvider>
 */
export function ConfirmDialogProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    type: 'generic', // 'generic' | 'delete'
    options: {},
    resolver: null,
  });

  const close = useCallback(() => {
    setState(s => ({ ...s, open: false, resolver: null, options: {} }));
  }, []);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setState({ open: true, type: 'generic', options, resolver: resolve });
    });
  }, []);

  const confirmDelete = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setState({ open: true, type: 'delete', options, resolver: resolve });
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    try {
      const res = state.options?.onConfirm?.();
      if (res instanceof Promise) await res;
      state.resolver?.(true);
      close();
    } catch {
      // si falla onConfirm, el modal queda abierto y no resolvemos
    }
  }, [state, close]);

  const handleCancel = useCallback(() => {
    state.resolver?.(false);
    close();
  }, [state, close]);

  const value = useMemo(() => ({ confirm, confirmDelete }), [confirm, confirmDelete]);

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}

      {state.type === 'generic' ? (
        <ConfirmDialog
          open={state.open}
          onClose={handleCancel}
          onConfirm={handleConfirm}
          {...state.options}
        />
      ) : (
        <DeleteConfirm
          open={state.open}
          onClose={handleCancel}
          onConfirm={handleConfirm}
          {...state.options}
        />
      )}
    </ConfirmDialogContext.Provider>
  );
}
