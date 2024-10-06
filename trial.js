import React, { useRef, useState } from 'react';
import { View, Text, Button, Alert, Image, StyleSheet } from 'react-native';
import { captureRef } from 'react-native-view-shot';

const CaptureViewExample = () => {
  const viewRef = useRef(); // Create a reference for the view
  const [imageUri, setImageUri] = useState(null); // State to store the captured image URI

  // Function to capture the view
  const captureView = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',    // Capture as a PNG image
        quality: 0.8,     // Image quality (0.0 to 1.0)
      });
      console.log('Captured image URI:', uri);
      setImageUri(uri); // Set the captured image URI to state
      Alert.alert('Success', 'View captured successfully!');
    } catch (error) {
      console.error('Failed to capture view:', error);
      Alert.alert('Error', 'Failed to capture view.');
    }
  };

  return (
    <View style={styles.container}>
      {/* View to be captured */}
      <View ref={viewRef} style={styles.captureView}>
        <Text style={styles.text}>This is a sample view to capture!</Text>
      </View>
      
      {/* Button to trigger capture */}
      <Button title="Capture View" onPress={captureView} />
      
      {/* Display the captured image if available */}
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  captureView: {
    padding: 20,
    backgroundColor: 'lightblue',
    borderRadius: 10,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 400, // Set desired width
    height: 200, // Set desired height
    marginTop: 20,
    borderRadius: 10,
    resizeMode:'contain'
  },
});

export default CaptureViewExample;
