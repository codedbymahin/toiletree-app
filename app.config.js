const withMapboxGradle = require('./plugins/with-mapbox-gradle');

module.exports = withMapboxGradle({
  expo: {
    name: 'Toiletree',
    slug: 'toiletree',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
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
        foregroundImage: './assets/adaptive-icon.png',
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
          RNMapboxMapsDownloadToken: process.env.MAPBOX_PUBLIC_ACCESS_TOKEN || process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFoaW40MDM0OTQiLCJhIjoiY21oOHVmcGdkMTI5MzJrcGNuYnoxaHBsMyJ9.3sa5Hc68pdOuycQMJIieqg',
        },
      ],
    ],
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      MAPBOX_PUBLIC_ACCESS_TOKEN: process.env.MAPBOX_PUBLIC_ACCESS_TOKEN || process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFoaW40MDM0OTQiLCJhIjoiY21oOHVmcGdkMTI5MzJrcGNuYnoxaHBsMyJ9.3sa5Hc68pdOuycQMJIieqg',
      eas: {
        projectId: 'd9ee245e-3e2d-4184-99c8-6df1a464be2d',
      },
    },
  },
});

