import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Find the existing CSS rule
    const oneOf = config.module.rules.find(rule => typeof rule === 'object' && rule.oneOf);

    if (oneOf) {
      // Insert our custom rule at the beginning to handle ?inline and ?raw
      oneOf.oneOf.unshift(
        {
          test: /\.css$/,
          resourceQuery: /inline/,
          type: 'asset/source',
        },
        {
          test: /\.css$/,
          resourceQuery: /raw/,
          type: 'asset/source',
        }
      );
    }

    return config;
  },
  turbopack: {
    rules: {
      '*.html': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
};

export default withNextIntl(nextConfig);
