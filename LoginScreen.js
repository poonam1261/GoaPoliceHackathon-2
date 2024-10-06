// LoginScreen.js
import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import app from '../firebaseConfig'; // Adjust the path according to your project structure

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const auth = getAuth(app);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Successfully logged in
      const user = userCredential.user;
      Alert.alert('Login Successful'); // Use backticks for template literals
      navigation.navigate('Home'); // Navigate to your home screen after login
    } catch (error) {
      const errorMessage = error.message;
      Alert.alert('Login Failed', errorMessage); // Show error message to user
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.frontImageContainer}>
        <Image source={require('../assets/GoaPoliceLogo.jpg')} style={styles.frontImage} />
      </View>
      <View style={styles.customer}>
        <TouchableOpacity style={styles.buttonDesigner} onPress={() => console.log('Designer pressed')}>
          <Button color="#42d5c6" title="Officer Registration" />
        </TouchableOpacity>
      </View>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <View style={styles.buttonContainer}>
        <Button color="#42d5c6" title="Login" onPress={handleLogin} />
      </View> 
      <Text style={styles.textSmall}>Don't have an account?</Text>
      <View style={styles.registerButton}>
        <Button color="#42d5c6" title="Register" onPress={() => navigation.navigate('Register')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  frontImageContainer: {
    marginBottom: 20,
    borderRadius: 20,
    marginTop: 50,
    borderWidth: 4,
    borderColor: '#C9C4AA',
    overflow: 'hidden',
    elevation: 8,
    shadowOpacity: 0.3,
    shadowColor: 'black',
    shadowRadius: 12,
    width: 350,
    height: 210,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 10,
  },
  buttonDesigner: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    
    overflow:'hidden'
  },
  frontImage: {
    width: 350,
    height: 210,
    resizeMode: 'cover',
  },
  container: {
    flexGrow: 1, // Allows the ScrollView to grow and fill the space
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 5,
    borderRadius:10
  },
  buttonContainer: {
    marginVertical: 10,
    width: '80%',
   borderRadius:10,
    overflow:'hidden'
  },
  textSmall: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: 10,
    width: '80%',
    borderRadius:10,
    overflow:'hidden'
  },
});

export default LoginScreen;
