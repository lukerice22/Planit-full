import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import useLoadFonts from '../hooks/useLoadFonts';

export default function LandingScreen() {
  const fontsLoaded = useLoadFonts();
  const router = useRouter();

  // Animated values for pulsating dots
  const dotAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    // Start pulsating animation
    const animations = dotAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      )
    );
    Animated.stagger(200, animations).start();
  }, [dotAnims]);

  useEffect(() => {
    if (!fontsLoaded) return;
    const timeout = setTimeout(() => {
      router.replace('/home');
    }, 2000);
    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Planit</Text>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Pulsating loading dots */}
      <View style={styles.dotsContainer}>
        {dotAnims.map((anim, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.dot,
              { opacity: anim },
            ]}
          >
            •
          </Animated.Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    paddingHorizontal: 1,
    paddingVertical: 30,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 80,
    fontFamily: 'Pacifico',
    color: '#0047AB',
    textAlign: 'center',
    padding: 3,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    fontSize: 30,
    marginHorizontal: 4,
    letterSpacing: 6,
  },
});