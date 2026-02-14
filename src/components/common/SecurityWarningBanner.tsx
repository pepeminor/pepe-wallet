'use client';

import { useState } from 'react';
import { Alert, AlertTitle, Box, Button, IconButton, Collapse } from '@mui/material';
import { Warning, Close, Extension } from '@mui/icons-material';

/**
 * Security Warning Banner - Warns users about browser extensions
 *
 * Shows on first visit and can be dismissed, but reappears on new session
 */
export function SecurityWarningBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('security_warning_dismissed') === 'true';
  });

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('security_warning_dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <Collapse in={!dismissed}>
      <Alert
        severity="warning"
        icon={<Warning />}
        sx={{
          mb: 2,
          borderLeft: 4,
          borderColor: 'warning.main',
          '& .MuiAlert-message': { width: '100%' },
        }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleDismiss}
          >
            <Close fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Extension fontSize="small" />
          Security Warning: Browser Extensions
        </AlertTitle>

        <Box sx={{ mt: 1 }}>
          <Box component="ul" sx={{ pl: 2, mb: 1, '& li': { mb: 0.5 } }}>
            <li>
              <strong>Browser extensions can access your private keys!</strong>
            </li>
            <li>
              We recommend <strong>removing all extensions</strong> or using{' '}
              <strong>incognito mode</strong> when accessing your wallet.
            </li>
            <li>
              Only install extensions from <strong>verified sources</strong>.
            </li>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                window.open('chrome://extensions', '_blank');
              }}
              sx={{ textTransform: 'none' }}
            >
              View Extensions
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleDismiss}
              sx={{ textTransform: 'none' }}
            >
              I Understand
            </Button>
          </Box>
        </Box>
      </Alert>
    </Collapse>
  );
}
