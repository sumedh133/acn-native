const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Extend asset and source extensions
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts
    .filter(ext => ext !== 'svg')
    .concat(['geojson']), // Add geojson support
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

module.exports = config;
