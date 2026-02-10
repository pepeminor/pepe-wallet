import { Box, Typography } from '@mui/material';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 3,
        py: 6,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          mb: 1,
          background: 'linear-gradient(135deg, #7b61ff, #00d4aa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Solana Wallet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Your gateway to Web3
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 400 }}>{children}</Box>
    </Box>
  );
}
