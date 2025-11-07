import Mapbox from '@rnmapbox/maps';
import Constants from 'expo-constants';

/**
 * Initialize Mapbox with access token
 * Should be called before rendering any Mapbox components
 */
export const initializeMapbox = () => {
  const accessToken = 
    Constants.expoConfig?.extra?.MAPBOX_PUBLIC_ACCESS_TOKEN ||
    process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    'pk.eyJ1IjoibWFoaW40MDM0OTQiLCJhIjoiY21oOHVmcGdkMTI5MzJrcGNuYnoxaHBsMyJ9.3sa5Hc68pdOuycQMJIieqg';

  Mapbox.setAccessToken(accessToken);
};

