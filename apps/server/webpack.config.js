const { composePlugins, withNx } = require("@nx/webpack");

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // ADR-0002 Note: express is now in package.json dependencies
  // Webpack externalizes it, but it will be found in node_modules at runtime
  // This is the default behavior - don't override externals
  return config;
});
