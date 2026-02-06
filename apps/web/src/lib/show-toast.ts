import { toast } from 'sonner';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

type ToastOptions = {
  message: string;
  type?: ToastType;
};

export const showToast = ({ message, type }: ToastOptions) => {
  if (type && toast[type]) {
    if (type === 'error') {
      toast.error(message, {
        position: 'top-center',
        style: {
          '--normal-bg':
            'color-mix(in oklab, var(--destructive) 10%, var(--background))',
          '--normal-text': 'var(--destructive)',
          '--normal-border':
            'color-mix(in oklab, var(--destructive) 30%, var(--background))',
        } as React.CSSProperties,
      });
    } else if (type === 'success') {
      toast.success(message, {
        position: 'top-center',
        style: {
          '--normal-bg':
            'color-mix(in oklab, var(--success) 10%, var(--background))',
          '--normal-text': 'var(--success)',
          '--normal-border':
            'color-mix(in oklab, var(--success) 30%, var(--background))',
        } as React.CSSProperties,
      });
    } else {
      toast[type](message, { position: 'top-center' });
    }
  } else {
    toast(message, { position: 'top-center' });
  }
};
