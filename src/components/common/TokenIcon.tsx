import { Avatar } from '@mui/material';
import { Token as TokenIconMui } from '@mui/icons-material';

interface TokenIconProps {
  icon?: string;
  symbol: string;
  size?: number;
}

export function TokenIcon({ icon, symbol, size = 36 }: TokenIconProps) {
  if (icon) {
    return (
      <Avatar
        src={icon}
        alt={symbol}
        sx={{ width: size, height: size }}
      >
        {symbol.charAt(0)}
      </Avatar>
    );
  }

  return (
    <Avatar sx={{ width: size, height: size, bgcolor: 'primary.main' }}>
      <TokenIconMui sx={{ fontSize: size * 0.6 }} />
    </Avatar>
  );
}
