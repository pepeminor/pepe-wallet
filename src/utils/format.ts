import BigNumber from 'bignumber.js';

// Configure BigNumber for financial calculations
BigNumber.config({ DECIMAL_PLACES: 20, ROUNDING_MODE: BigNumber.ROUND_DOWN });

export function formatAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatBalance(balance: number, decimals = 4): string {
  if (balance === 0) return '0';
  const bn = new BigNumber(balance);
  if (bn.lt(0.0001)) return '<0.0001';
  return bn.toFormat(decimals, BigNumber.ROUND_DOWN, {
    groupSize: 3,
    groupSeparator: ',',
    decimalSeparator: '.',
  }).replace(/\.?0+$/, '');
}

export function formatUsd(value: number): string {
  const bn = new BigNumber(value);
  if (bn.isZero()) return '$0.00';
  if (bn.lt(0.01)) return '<$0.01';
  return '$' + bn.toFormat(2, BigNumber.ROUND_HALF_UP, {
    groupSize: 3,
    groupSeparator: ',',
    decimalSeparator: '.',
  });
}

/**
 * Calculate USD value: balance * price using BigNumber for precision
 */
export function calcUsdValue(uiBalance: number, priceUsd: number): number {
  return new BigNumber(uiBalance).times(priceUsd).toNumber();
}

export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
