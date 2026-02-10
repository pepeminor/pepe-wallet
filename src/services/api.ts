import axios from 'axios';

export const jupiterApi = axios.create({
  baseURL: 'https://quote-api.jup.ag',
  timeout: 30_000,
});

export const coingeckoApi = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
  timeout: 10_000,
});
