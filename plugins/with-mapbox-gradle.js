const { withGradleProperties } = require('@expo/config-plugins');

/**
 * Expo config plugin to inject MAPBOX_DOWNLOAD_TOKEN into gradle.properties
 * This ensures the token is available during EAS builds
 */
const withMapboxGradle = (config) => {
  return withGradleProperties(config, (config) => {
    // Get the token from environment variable or config extra
    const mapboxToken =
      process.env.MAPBOX_DOWNLOAD_TOKEN ||
      process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
      config.extra?.MAPBOX_PUBLIC_ACCESS_TOKEN ||
      'pk.eyJ1IjoibWFoaW40MDM0OTQiLCJhIjoiY21oOHVmcGdkMTI5MzJrcGNuYnoxaHBsMyJ9.3sa5Hc68pdOuycQMJIieqg';

    // Add MAPBOX_DOWNLOAD_TOKEN to gradle.properties
    config.modResults.push({
      type: 'property',
      key: 'MAPBOX_DOWNLOAD_TOKEN',
      value: mapboxToken,
    });

    return config;
  });
};

module.exports = withMapboxGradle;

