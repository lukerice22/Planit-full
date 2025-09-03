import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

export default (): ExpoConfig => ({
  expo: {
    name: 'planit-app',
    slug: 'planit-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'planitapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      bundleIdentifier: 'com.yourcompany.planit',
      supportsTablet: true,
      config: {
        // now pulled from .env, not hardcoded
        googleMapsApiKey: process.env.IOS_MAPS_SDK_KEY,
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.yourcompany.planit',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-font',
      'expo-web-browser',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '841c4d47-cb0c-48e1-95c3-74b15695b95f',
      },
    },
  },
});