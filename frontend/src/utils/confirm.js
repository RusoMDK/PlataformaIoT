import { toast } from 'sonner';

/**
 * Devuelve una Promise<boolean>
 *  await confirm("¿Eliminar dispositivo?");
 */
export function confirm(message) {
  return new Promise(resolve => {
    toast(message, {
      action: {
        label: 'Sí',
        onClick: () => resolve(true),
      },
      cancel: {
        label: 'No',
        onClick: () => resolve(false),
      },
      duration: Infinity,
    });
  });
}
