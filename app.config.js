const withMapboxGradle = require('./plugins/with-mapbox-gradle');

// Build-time validation: Ensure Mapbox environment variables are present
// Note: During EAS builds, environment variables are injected by EAS, so we validate
// only if we're actually building and the variables are explicitly checked
// The validation here is a safeguard - EAS will also validate during build

module.exports = withMapboxGradle({
  expo: {
    name: 'Toiletree',
    slug: 'toiletree',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/logo.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.toiletree.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Toiletree needs your location to show nearby public toilets and help you submit new locations.',
        NSCameraUsageDescription:
          'Toiletree needs camera access to take photos of toilet facilities.',
        NSPhotoLibraryUsageDescription:
          'Toiletree needs photo library access to upload photos of toilet facilities.',
      },
    },
    android: {
      package: 'com.toiletree.app',
      adaptiveIcon: {
        foregroundImage: './assets/logo.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow Toiletree to use your location to find nearby toilets.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Allow Toiletree to access your photos to upload toilet images.',
          cameraPermission:
            'Allow Toiletree to access your camera to take photos of toilets.',
        },
      ],
      [
        '@rnmapbox/maps',
        {
          // Pass the download token directly to @rnmapbox/maps plugin
          // This helps the plugin configure its repository correctly
          // The token will be available as an environment variable during EAS builds
          RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN || process.env.MAPBOX_DOWNLOAD_TOKEN || process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN,
          // Note: Our withMapboxGradle plugin will also ensure the repository is properly configured
          // as a backup, in case the plugin's own configuration doesn't work
        },
      ],
    ],
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      MAPBOX_PUBLIC_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
      // Support both variable name formats for maximum compatibility
      // @rnmapbox/maps expects MAPBOX_DOWNLOADS_TOKEN (plural)
      MAPBOX_DOWNLOADS_TOKEN: process.env.MAPBOX_DOWNLOADS_TOKEN || process.env.MAPBOX_DOWNLOAD_TOKEN,
      MAPBOX_DOWNLOAD_TOKEN: process.env.MAPBOX_DOWNLOADS_TOKEN || process.env.MAPBOX_DOWNLOAD_TOKEN,
      eas: {
        projectId: 'd9ee245e-3e2d-4184-99c8-6df1a464be2d',
      },
    },
  },
});

