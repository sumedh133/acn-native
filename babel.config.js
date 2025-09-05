module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel", // Keep this if you're using NativeWind for Tailwind CSS
      "react-native-reanimated/plugin", // Add this for React Native Reanimated
    ],
  };
};
