import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, ActivityIndicator } from 'react-native';

function SplashScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(1)).current; // Create a new animated value for scaling

  useEffect(() => {
    // Start the scaling animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulate a network request or some async task
    const timeout = setTimeout(() => {
      navigation.navigate('Login'); // Navigate to the Login screen after the delay
    }, 1500); // 1.5 seconds delay

    return () => clearTimeout(timeout); // Cleanup the timeout on component unmount
  }, [navigation, scaleAnim]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GOA POLICE</Text>
      <Animated.Image
        source={require('../assets/GoaPoliceLogo.png')}
        style={[styles.logo, { transform: [{ scale: scaleAnim }] }]} // Apply scaling animation
      />
      {/* Progress Bar */}
      <ActivityIndicator size="large" color="#42d5c6" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically and horizontally
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20, // Spacing between title and logo
  },
  logo: {
    width: 150, // Adjusted logo size for better visibility
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20, // Add margin below the logo for spacing
  },
  loader: {
    marginTop: 20, // Space above the progress bar
  },
});

export default SplashScreen;
