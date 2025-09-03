// src/hooks/useLoadFonts.ts
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export default function useLoadFonts() {
  const [fontsLoaded] = useFonts({
  Pacifico: require('../assets/fonts/Pacifico/Pacifico-Regular.ttf'),
});


  useEffect(() => {
    async function hideSplash() {
      if (fontsLoaded) await SplashScreen.hideAsync();
    }
    hideSplash();
  }, [fontsLoaded]);

  return fontsLoaded;
}