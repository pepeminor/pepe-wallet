import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { Lock } from '@mui/icons-material';

interface SetPasswordFormProps {
  onPasswordSet: (password: string) => void;
}

export function SetPasswordForm({ onPasswordSet }: SetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    onPasswordSet(password);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Lock color="primary" />
        <Typography variant="h6">Set Password</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary">
        This password encrypts your private key locally.
      </Typography>

      <TextField
        fullWidth
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />

      <TextField
        fullWidth
        type="password"
        label="Confirm Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Button
        fullWidth
        variant="contained"
        onClick={handleSubmit}
        disabled={!password || !confirm}
        size="large"
      >
        Continue
      </Button>
    </Box>
  );
}
