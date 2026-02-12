'use client';

import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3CB043' },
    secondary: { main: '#7AE582' },
    background: {
      default: '#0d1117',
      paper: '#21262d',
    },
    text: {
      primary: '#f0f6fc',
      secondary: '#8b949e',
    },
    error: { main: '#f85149' },
    warning: { main: '#d29922' },
    success: { main: '#3fb950' },
    info: { main: '#58a6ff' },
    divider: '#30363d',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '14px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3CB043, #7AE582)',
          color: '#0d1117',
          fontWeight: 700,
          '&:hover': {
            background: 'linear-gradient(135deg, #2E9335, #6AD572)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #30363d',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#0d1117',
            borderRadius: 12,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#161b22',
          borderRadius: 16,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#161b22',
          borderTop: '1px solid #30363d',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#8b949e',
          '&.Mui-selected': { color: '#3CB043' },
        },
      },
    },
  },
});
