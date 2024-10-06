import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet, Image } from 'react-native';
import { setDoc, doc } from 'firebase/firestore'; // Import setDoc and doc
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebaseConfig'; // Adjust the path as needed

const ProfileScreen = ({ navigation }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [officerName, setOfficerName] = useState(''); // Officer name will be set from auth
  const [loading, setLoading] = useState(true); // To show loading state

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, retrieve their display name
        setOfficerName(user.displayName || ''); // Set to displayName, fallback to empty string
      } else {
        // User is not signed in
        setOfficerName(''); // Reset officerName
      }
      setLoading(false); // Stop loading
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const handleAddPass = async () => {
    // Validate inputs
    if (!vehicleNumber || !mobileNumber) {
      Alert.alert("Validation Error", "Both fields are required.");
      return;
    }

    // Check if mobile number is exactly 10 digits
    if (mobileNumber.length !== 10 || isNaN(mobileNumber)) {
      Alert.alert("Validation Error", "Mobile number must be exactly 10 digits.");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid; // Get the user's UID

        // Create a reference to the user's document
        const docRef = doc(db, 'Profile', userId);

        // Set the document with the user's UID as the document ID
        await setDoc(docRef, {
          user_name: vehicleNumber, // Changed to user_name for clarity
          mobileNumber,
          officerName: officerName || 'Unknown Officer', // Ensure it's not empty; fallback to 'Unknown Officer'
        });

        Alert.alert("Success", "Profile data added successfully!");
        console.log("Document written with ID: ", userId); // Log the user ID
        navigation.navigate('Login'); // Navigate to Login after successful submission
      } else {
        Alert.alert("Error", "User is not signed in.");
      }
    } catch (e) {
      console.error("Error adding document: ", e);
      Alert.alert("Error", "Failed to add profile data.");
    }
  };

  if (loading) {
    return <Text>Loading...</Text>; // Show loading state
  }

  return (
    <View>
      <View style={styles.header}>
        <Image
          source={require('../assets/VahaanSahayaak.png')} // Adjust the path as needed
          style={styles.logo}
        />
        <Text style={styles.headerText}>Profile Form</Text>
      </View>
      <View style={styles.container}>
        {/* Profile Form */}
        <TextInput
          placeholder="User Name"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          style={styles.input}
        />
        <TextInput
          placeholder="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          style={styles.input}
          keyboardType="numeric" // Set keyboard type to numeric for mobile input
        />
        <View style={styles.buttonContainer}>
          <Button color="#42d5c6" title="Submit" onPress={handleAddPass} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'white',
    height: '100%'
  },
  header: {
    flexDirection: 'row', // Align logo and text horizontally
    alignItems: 'center', // Vertically center the logo and text
    paddingHorizontal: 15, // Added horizontal padding for some breathing space
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#42d5c6'
  },
  logo: {
    width: 60, // Slightly larger logo for better visibility
    height: 60,
    resizeMode: 'contain',
    marginRight: 15, // Space between the logo and the text
  },
  headerText: {
    fontSize: 26, // Increased font size for better readability
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 33 // Matching button color
  },
  input: {
    width: '85%', // Slightly wider input field for better usability
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15, // Added more space between input fields
    padding: 10, // Increased padding inside the input for better typing experience
    borderRadius: 8,
    backgroundColor: '#f9f9f9', // Light background to distinguish input fields
    shadowColor: '#000', // Subtle shadow to make input fields pop out
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, // Shadow effect for Android
  },
  buttonContainer: {
    marginVertical: 20, // Increased vertical space above and below the button
    width: '85%',
    borderRadius: 8,
    overflow: 'hidden', // To ensure the button fits nicely into the container
    shadowColor: '#000', // Subtle shadow for the button
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // Android shadow effect for the button
  },
});

export default ProfileScreen;
