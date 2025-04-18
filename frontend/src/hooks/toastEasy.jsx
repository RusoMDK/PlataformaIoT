import { toast } from './use-toast';
import i18next from 'i18next';

export const toastEasy = (type, customMessage) => {
  const templates = {
    success: {
      title: 'carola',
      description: customMessage || 'DP',
      variant: 'success',
    },
    error: {
      title: i18next.t('toaster.error.title'),
      description: customMessage || i18next.t('toaster.error.description'),
      variant: 'destructive',
    },
  };

  toast(templates[type]);
};
