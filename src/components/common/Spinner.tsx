import { Box, CircularProgress, Typography } from '@mui/material';

interface SpinnerProps {
  message?: string;
  size?: number;
}

export function Spinner({ message, size = 40 }: SpinnerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 4,
      }}
    >
      <CircularProgress size={size} sx={{ color: 'primary.main' }} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}
