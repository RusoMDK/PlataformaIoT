import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  X
} from 'lucide-react';

/**
 * ConfirmDialog — Modal de confirmación genérico y reutilizable
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onConfirm: () => (void|Promise<void>)  // si retorna promesa, se muestra loading
 * - title?: string
 * - description?: string|ReactNode
 * - confirmText?: string   (default: 'Confirmar')
 * - cancelText?: string    (default: 'Cancelar')
 * - tone?: 'danger'|'primary'|'warning'|'neutral'  (default: 'danger')
 * - icon?: 'trash'|'warning'|'info'|'success'      (default: según tone)
 * - items?: string[]        // opcional: lista de elementos a mostrar (scrollable)
 * - requireText?: string    // si se setea, debes escribir exactamente este texto para habilitar “Confirmar”
 * - requireCheckLabel?: string // si se setea, aparece un checkbox que debes marcar para habilitar “Confirmar”
 * - autoCloseOnConfirm?: boolean (default true)
 * - allowCloseOnBackdrop?: boolean (default true)
 * - allowCloseOnEsc?: boolean (default true)
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  description = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  tone = 'danger',
  icon,
  items = [],
  requireText,
  requireCheckLabel,
  autoCloseOnConfirm = true,
  allowCloseOnBackdrop = true,
  allowCloseOnEsc = true,
}) {
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setBusy(false);
      setTyped('');
      setChecked(false);
    }
  }, [open]);

  const palette = useMemo(() => {
    if (tone === 'danger') {
      return {
        ring: 'ring-red-200 dark:ring-red-900/30',
        iconWrap: 'bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300',
        title: 'text-red-800 dark:text-red-200',
        confirm:
          'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-400 disabled:opacity-60',
      };
    }
    if (tone === 'warning') {
      return {
        ring: 'ring-orange-200 dark:ring-orange-900/30',
        iconWrap: 'bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300',
        title: 'text-orange-800 dark:text-orange-200',
        confirm:
          'bg-orange-600 hover:bg-orange-700 text-white focus-visible:ring-orange-400 disabled:opacity-60',
      };
    }
    if (tone === 'primary') {
      return {
        ring: 'ring-primary/30',
        iconWrap: 'bg-primary/15 text-primary',
        title: 'text-gray-900 dark:text-gray-100',
        confirm:
          'bg-primary hover:bg-primary-hover text-white focus-visible:ring-primary/40 disabled:opacity-60',
      };
    }
    return {
      ring: 'ring-black/10 dark:ring-white/10',
      iconWrap: 'bg-black/5 text-gray-700 dark:bg-white/10 dark:text-gray-200',
      title: 'text-gray-900 dark:text-gray-100',
      confirm:
        'bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-white/90 dark:text-gray-900 disabled:opacity-60',
    };
  }, [tone]);

  const IconCmp = useMemo(() => {
    if (icon) {
      if (icon === 'trash') return Trash2;
      if (icon === 'warning') return AlertTriangle;
      if (icon === 'info') return Info;
      if (icon === 'success') return CheckCircle2;
    }
    if (tone === 'danger') return Trash2;
    if (tone === 'warning') return AlertTriangle;
    if (tone === 'primary') return Info;
    return Info;
  }, [tone, icon]);

  const canConfirm = useMemo(() => {
    let ok = !busy;
    if (requireCheckLabel) ok = ok && checked;
    if (requireText != null && requireText !== '') ok = ok && typed.trim() === String(requireText);
    return ok;
  }, [busy, checked, typed, requireText, requireCheckLabel]);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    try {
      setBusy(true);
      const res = onConfirm?.();
      if (res instanceof Promise) await res;
      if (autoCloseOnConfirm) onClose?.();
    } catch (e) {
      // si el onConfirm lanza error, mantenemos abierto y soltamos busy=false
      console.error('ConfirmDialog onConfirm error:', e);
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (busy) return;
    onClose?.();
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1000]"
        onClose={allowCloseOnEsc ? handleClose : () => {}}
        initialFocus={cancelRef}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-120"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={allowCloseOnBackdrop ? handleClose : undefined}
            aria-hidden="true"
          />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="transition-all ease-out duration-150"
              enterFrom="opacity-0 translate-y-3 scale-[0.98]"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="transition-all ease-in duration-120"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-3 scale-[0.98]"
            >
              <Dialog.Panel
                className={`w-full max-w-lg rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-[#0b0f1a] shadow-2xl ring-1 ${palette.ring}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 grid place-items-center rounded-lg ${palette.iconWrap}`}>
                      <IconCmp className="w-[18px] h-[18px]" />
                    </div>
                    <Dialog.Title className={`text-[15px] font-semibold ${palette.title}`}>
                      {title}
                    </Dialog.Title>
                  </div>

                  <button
                    onClick={handleClose}
                    disabled={busy}
                    className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition disabled:opacity-60"
                    aria-label="Cerrar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-4 py-3 space-y-3">
                  {description ? (
                    <Dialog.Description className="text-sm text-gray-700 dark:text-gray-300">
                      {description}
                    </Dialog.Description>
                  ) : null}

                  {!!items?.length && (
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-light-border dark:border-dark-border bg-black/5 dark:bg-white/5 p-2 text-xs text-gray-600 dark:text-gray-300">
                      <ul className="list-disc pl-5 space-y-1">
                        {items.map((it, i) => <li key={i} className="truncate">{it}</li>)}
                      </ul>
                    </div>
                  )}

                  {requireText != null && requireText !== '' && (
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        Escribe <span className="font-mono font-semibold">{requireText}</span> para confirmar:
                      </label>
                      <input
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        placeholder={requireText}
                        className="w-full rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-white/[0.06] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  )}

                  {requireCheckLabel && (
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 select-none">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                      />
                      {requireCheckLabel}
                    </label>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-light-border dark:border-dark-border">
                  <button
                    ref={cancelRef}
                    onClick={handleClose}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white dark:bg-[#0b0f1a]
                               border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/10 transition disabled:opacity-60"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${palette.confirm}`}
                  >
                    {busy && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z"></path>
                      </svg>
                    )}
                    {confirmText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
