import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions, ActivityIndicator, Image } from 'react-native';
import { COLORS } from '../../styles/theme';

const { width } = Dimensions.get('window');

const LoadingScreen: React.FC = () => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse and Scale animation for logo
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        })
      )
    ]).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {/* Background Graphic Blobs */}
      <View style={styles.blobContainer}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
      </View>

      <View style={styles.centerContainer}>
        {/* Logo and Ring Container */}
        <View style={styles.logoContainer}>
          {/* Animated Outer Ring */}
          <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]} />

          {/* Brand Main Symbol */}
          <Animated.View style={[styles.logoBox, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
            <Image source={require('../../../assets/ggp_logo.jpg')} style={styles.logoImg} />
          </Animated.View>
        </View>

        {/* Text Area */}
        <Animated.View style={[styles.textBlock, { opacity: opacityAnim }]}>
          <Text style={styles.brandName}>GGP</Text>
          <View style={styles.bar} />
          <Text style={styles.fullName}>Gorantla Grama Panchayati</Text>
        </Animated.View>
      </View>

      {/* Spinner */}
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.accent} />
        <Text style={styles.loadingText}>Initializing secure portal...</Text>
      </View>
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E294E', // Solid Space Indigo backdrop
    justifyContent: 'center',
    alignItems: 'center',
  },
  blobContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    opacity: 0.15,
  },
  blob1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#820263', // Royal Plum
    top: -50,
    left: -50,
  },
  blob2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFD400', // Gold
    bottom: -80,
    right: -80,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    width: 145,
    height: 145,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'transparent',
    borderStyle: 'dashed',
    borderTopColor: '#FFD400', // Gold
    borderBottomColor: '#FFD400', // Gold
  },
  logoBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
  },
  logoImg: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  textBlock: {
    marginTop: 28,
    alignItems: 'center',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD400', // Gold
    letterSpacing: 6,
    textAlign: 'center',
  },
  bar: {
    width: 40,
    height: 2,
    backgroundColor: '#D90368', // Berry Lipstick
    marginVertical: 12,
    borderRadius: 1,
  },
  fullName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EADEDA', // Dust Grey
    letterSpacing: 1.5,
    textAlign: 'center',
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#EADEDA', // Dust Grey
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
