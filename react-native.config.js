module.exports = {
    dependencies: {
        'react-native-iap': {
            platforms: {
                android: null, // Disable auto-linking for Android
                ios: {}, // Keep auto-linking for iOS
            },
        },
    },
};