import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Lock, CheckCircle, Cancel } from '@mui/icons-material';
import { validatePassword, getPasswordStrengthInfo } from '@/utils/passwordValidator';

interface SetPasswordFormProps {
  onPasswordSet: (password: string) => void;
}

export function SetPasswordForm({ onPasswordSet }: SetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [showRequirements, setShowRequirements] = useState(false);

  const validation = password ? validatePassword(password) : null;
  const strengthInfo = validation ? getPasswordStrengthInfo(validation.strength) : null;

  const handleSubmit = () => {
    if (!validation || !validation.valid) {
      setError('Please meet all password requirements');
      setShowRequirements(true);
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

      <Alert severity="warning" sx={{ alignItems: 'center' }}>
        This password encrypts your private keys. Choose a strong password to protect your funds.
      </Alert>

      <TextField
        fullWidth
        type="password"
        label="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setShowRequirements(true);
        }}
        onFocus={() => setShowRequirements(true)}
        autoComplete="new-password"
      />

      {/* Password Strength Indicator */}
      {password && strengthInfo && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Password Strength
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: strengthInfo.color, fontWeight: 600 }}
            >
              {strengthInfo.label}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={
              validation!.strength === 'weak'
                ? 33
                : validation!.strength === 'medium'
                ? 66
                : 100
            }
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                bgcolor: strengthInfo.color,
                borderRadius: 3,
              },
            }}
          />
        </Box>
      )}

      {/* Password Requirements */}
      {showRequirements && password && validation && validation.errors.length > 0 && (
        <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
            Password Requirements:
          </Typography>
          <List dense disablePadding>
            {validation.errors.map((err, i) => (
              <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Cancel fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={err}
                  primaryTypographyProps={{
                    variant: 'caption',
                    color: 'error',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Show success checkmark when valid */}
      {password && validation && validation.valid && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle fontSize="small" color="success" />
          <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
            Password meets all requirements
          </Typography>
        </Box>
      )}

      <TextField
        fullWidth
        type="password"
        label="Confirm Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
        error={confirm.length > 0 && password !== confirm}
        helperText={
          confirm.length > 0 && password !== confirm ? 'Passwords do not match' : ''
        }
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Button
        fullWidth
        variant="contained"
        onClick={handleSubmit}
        disabled={!password || !confirm || !validation || !validation.valid}
        size="large"
      >
        Continue
      </Button>
    </Box>
  );
}
