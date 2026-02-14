/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ SECURITY FIX: Disable source maps in production to prevent reverse engineering
  productionBrowserSourceMaps: false,

  // ✅ SECURITY FIX: Content Security Policy to prevent XSS attacks
  // Note: CSP only applied in production to avoid dev mode issues
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';

    // Log at build time to verify
    console.log('\n🔒 Security Headers Configuration:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   CSP Enabled: ${isProd ? 'YES ✅' : 'NO (dev mode)'}`);
    console.log(`   Production Mode: ${isProd ? 'YES' : 'NO'}\n`);

    return [
      {
        source: '/:path*',
        headers: [
          // Only apply strict CSP in production
          ...(isProd ? [{
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.devnet.solana.com https://api.mainnet-beta.solana.com https://solana-rpc.publicnode.com https://ethereum-rpc.publicnode.com https://base-rpc.publicnode.com https://arbitrum-one-rpc.publicnode.com https://quote-api.jup.ag https://price.jup.ag https://api.coingecko.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          }] : []),
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },

  sassOptions: {
    includePaths: ['./src/styles'],
  },
  serverExternalPackages: [
    '@solana/web3.js',
    '@solana/spl-token',
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-phantom',
    '@solana/wallet-adapter-solflare',
    '@solana/wallet-adapter-wallets',
    'ed25519-hd-key',
    'bip39',
    'bs58',
    'ethers',
  ],
  turbopack: {
    resolveAlias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
      util: 'util',
      process: 'process/browser',
    },
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        buffer: 'buffer',
        util: 'util',
        process: 'process/browser',
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }

    return config;
  },
};

export default nextConfig;
