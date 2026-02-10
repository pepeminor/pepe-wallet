import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme } from '@/theme/muiTheme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={darkTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
