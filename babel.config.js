/* eslint-env node */

/**
 * This file only exists to satisfy Jest's babel integration. Parcel manages
 * this automatically.
 */
module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ['@babel/preset-env', { targets: ['current node'] }],
      '@babel/preset-react',
    ],
  };
};
