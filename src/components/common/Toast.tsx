import { Snackbar, Alert } from '@mui/material';
import { useStore } from '@/store';

export function Toast() {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  const current = toasts[0];
  if (!current) return null;

  return (
    <Snackbar
      open
      autoHideDuration={4000}
      onClose={() => removeToast(current.id)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity={current.type}
        onClose={() => removeToast(current.id)}
        sx={{ width: '100%', borderRadius: 2 }}
      >
        {current.message}
      </Alert>
    </Snackbar>
  );
}
