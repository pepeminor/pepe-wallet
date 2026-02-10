import { ThemeProvider } from './ThemeProvider';
import { SolanaWalletProvider } from './SolanaWalletProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SolanaWalletProvider>{children}</SolanaWalletProvider>
    </ThemeProvider>
  );
}
