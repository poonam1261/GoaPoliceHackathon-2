import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { Picker } from '@react-native-picker/picker';
import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import * as Location from 'expo-location';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import * as SMS from 'expo-sms';
import { captureRef } from 'react-native-view-shot'; // Import captureRef from react-native-view-shot
import * as Sharing from 'expo-sharing'; 
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import NetInfo from '@react-native-community/netinfo';  // Import NetInfo for network check


const App = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [qrValue, setQrValue] = useState(null);
  const [validUntil, setValidUntil] = useState(null);
  const [selectedViolations, setSelectedViolations] = useState([]); // Updated
  const [location, setLocation] = useState(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [issuedBy, setIssuedBy] = useState('');
  const qrRef = useRef(); // Create a ref for the QR code view
  const [qrCodeUri, setQrCodeUri] = useState(null); 
  const [address, setAddress] = useState(null);
  const [officerName, setOfficerName] = useState('unknown');
  const [generateBtn, setGenerateBtn] = useState(false);
  const [validUntilDate,setValidUntilDate] = useState('');
  const [validUntilTime,setValidUntilTime] = useState('');
  const [isConnected, setIsConnected] = useState(false); // Add state to track network status


  const violationOptions = [
    'No license',
    'Expired vehicle reg',
    'No valid insurance',
    'No PUC',
    'Overloading of passengers',
    'Illegal modifications',
    'Nil',
  ];

  const currentDate = new Date();

  
  const uploadImageToFirebase = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob(); // Create a blob from the image URI
  
    // Create a reference to the location where the image will be stored
    const storage = getStorage();
    const storageRef = ref(storage, `qrCodes/${Date.now()}.png`);
  
    // Upload the blob to Firebase Storage
    try {
      await uploadBytes(storageRef, blob);
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL; // Return the download URL
    } catch (error) {
      console.error('Error uploading image: ', error);
      Alert.alert('Error', 'Failed to upload image to Firebase Storage.');
      return null;
    }
  };
  

  const fetchUserName = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const docRef = doc(db, 'Profile', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setIssuedBy(docSnap.data().user_name);
        setOfficerName(issuedBy);
      } else {
        console.log("No such document!");
        setIssuedBy('Unknown'); // Set default value if user name not found
      }
    } else {
      console.log("No user is currently signed in.");
      setIssuedBy('Unknown'); // Set default value if no user is signed in
    }
    
  };
 // Import expo-sharing

 const captureQR = async () => {
  
    try {
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 0.8, // Adjust quality as needed
      });

      setQrCodeUri(uri);
      Alert.alert('Success', 'QR code Captured Successfuly!');

      const qrCodeURL = await uploadImageToFirebase(uri);
      if (qrCodeURL) {
        await sendSMS(qrCodeURL); // Send SMS with the download URL
      }
      // Return the URI of the captured QR code
    } catch (error) {
      console.error('Error capturing QR code:', error);
      Alert.alert('Error', 'Failed to capture QR code.');
    }

  
};



  
  // Format the date to a readable format
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });

  
  
  
  const checkInternetConnection = async () => {
    const netInfo = await NetInfo.fetch();
    const hasInternetConnection = netInfo.isConnected && netInfo.isInternetReachable;
    setIsConnected(hasInternetConnection); // Update state based on network status
  };


  useEffect(() => {
    checkInternetConnection();
    if (isConnected) {
      requestLocationPermission();
      fetchUserName();
    }
  }, [isConnected]);

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;
      setLocation({ latitude, longitude });

      const place = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place.length > 0) {
        const formattedAddress = `${place[0].name}, ${place[0].city}, ${place[0].region}`;
        setAddress(formattedAddress);
      } else {
        setAddress('Unknown Location');
      }
    } catch (error) {
      console.error('Error fetching location: ', error);
      setLocation(null);
    }
  };

  const generatePass = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      Alert.alert('Error', 'Mobile Number must be 10 digits long');
      return;
    }

    const now = new Date();
    const expirationTime = new Date(now.getTime() + 4 * 60 * 60 * 1000); 

    setValidUntilDate(expirationTime.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }));

    setValidUntilTime(expirationTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    }));

    const dateOfIssue = now.toISOString();

    const qrData = JSON.stringify({
      mobileNumber,
      carNumber: carNumber.toUpperCase(),
      violations: selectedViolations,
      validUntil: expirationTime.toISOString(),
      dateOfIssue: dateOfIssue,
      issuedBy: issuedBy || null,
      address: address || 'Unknown Location',
    });

    const secretKey = 'hey-you';
    const generateHMACSignature = (data, secretKey) => {
      return CryptoJS.HmacSHA256(JSON.stringify(data), secretKey).toString();
    };
    const generateSalt = () => {
      return CryptoJS.lib.WordArray.random(16).toString(); 
    };
    const encryptData = (data, secretKey) => {
      const salt = generateSalt();
      const saltedKey = CryptoJS.SHA256(secretKey + salt).toString(); 
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        saltedKey,
      ).toString();
      return { encryptedData: encrypted, salt };
    };

    const { encryptedData, salt } = encryptData(qrData, secretKey);
    const hmacSignature = generateHMACSignature(qrData, secretKey);
    const finalQRData = {
      encryptedQRData: encryptedData,
      hmacSignature,
      salt,
    };

    setQrValue(JSON.stringify(finalQRData));
    setValidUntil(moment(expirationTime));
    setIsGenerated(true);

    if (isConnected) {
      try {
        await storePassInformation(dateOfIssue, formattedDate, expirationTime);
        setGenerateBtn(true);  
      } catch (error) {
        Alert.alert('Error', 'Failed to store pass information.');
      }
    } else {
      console.log('Pass generated offline.');
    }
  };


const storePassInformation = async (dateOfIssue, timeOfIssue, validUntil) => {
  if (!mobileNumber || !carNumber || !validUntil) {
    Alert.alert('Error', 'Pass information is incomplete');
    return;
  }

  // Create a timestamp for the pass
  const passData = {
    mobileNumber,
    carNumber,
    dateOfIssue,
    timeOfIssue,
    violations: selectedViolations || 'nil',
    issuedBy: issuedBy || 'unknown',
    validUntil,
    address: address || null,
    timestamp: new Date() // Store the current date and time
  };

  try {
    // Store pass information with a unique document ID
    const docRef = doc(db, 'Pass', `${dateOfIssue}_${timeOfIssue}_${issuedBy}`);
    await setDoc(docRef, passData);

    console.log('Success', 'Pass information stored successfully!');
  } catch (error) {
    console.error('Error storing pass information:', error);
    Alert.alert('Error', 'Failed to store pass information.');
  }
};  

  const resetFields = () => {
    setMobileNumber('');
    setCarNumber('');
    setSelectedViolations([]);
    setQrValue(null);
    setValidUntil(null);
    setIsGenerated(false);
    setIssuedBy(''); 
  };

  const sendSMS = async (qrCodeURL) => {
    if (!mobileNumber) {
      Alert.alert('Error', 'Mobile number is required to send SMS.');
      return;
    }
  
    // Ensure validUntil is set
    if (!validUntil) {
      Alert.alert('Error', 'Valid until time is not set.');
      return;
    }
  
    const formattedNumber = `+91${mobileNumber}`;
  
    const passMessage = `
      Pass : ${qrCodeURL} 
    `;
  
    const { result } = await SMS.sendSMSAsync(
      [formattedNumber],
      passMessage
    );
  
    if (result === 'sent') {
      console.log('SMS sent successfully!');
    } else {
      console.log('Failed to send SMS.');
    }
    console.log(validUntil)
  };
   
  const toggleViolation = (violation) => {
    if (selectedViolations.includes(violation)) {
      setSelectedViolations(selectedViolations.filter(v => v !== violation));
    } else {
      setSelectedViolations([...selectedViolations, violation]);
    }
  };
  
  

  return (
    <View style={styles.container}>
    <ScrollView>
        
        <View style={styles.header}>
          {/* <TouchableOpacity>
            <Icon name="menu" size={30} color="#fff" />
          </TouchableOpacity> */}
          <Image
            source={require('../assets/GoaPoliceLogo.png')} // Update with the path to your logo
            style={styles.logo}
          />
          <Text style={styles.headerText}>Goa Police Pass Issuing System</Text>
        </View>

        {/* Body Content */}
       
        <View style={styles.content}>
          <Text style={styles.label}>Mobile Number:</Text>
          <TextInput
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            placeholder="Enter mobile number"
            style={styles.input}
            editable={!isGenerated}
          />

          <Text style={styles.label}>Car Number:</Text>
          <TextInput
            value={carNumber}
            onChangeText={setCarNumber}
            placeholder="Enter car number"
            style={styles.input}
            editable={!isGenerated}
          />

         
         
        <Text Text style={styles.label}>Violations:</Text>
            {violationOptions.map((violation, index) => (
             <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
             <Checkbox
               status={selectedViolations.includes(violation) ? 'checked' : 'unchecked'}
               onPress={() => toggleViolation(violation)}
               disabled = {generateBtn}
             />
             <Text>{violation}</Text>
           </View>
           
            ))}
          <View style={styles.buttons}>
          <View style={styles.generateButton}>
          <Button
            title="Generate Pass"
            onPress={() => {
              generatePass();
              
            }}
            color="#57d4e5"
            disabled={isGenerated}
/>
            </View>
            {generateBtn && (
              <Button 
              title="Reset" 
              onPress={() => {
                resetFields();
                setGenerateBtn(false);
              }} 
              color="#ff6347" 
            />
            )}
          </View>

          {qrValue && (
            <View style={styles.qrSection} ref={qrRef}>
              <View style={styles.detailHead}>
                <Text style={styles.passDetail}>Pass Details</Text>
              </View>
              <View style={styles.detailBody}>
                <View>
                  <Text style={styles.genText}>
                    <Text style={{fontWeight: 'bold'}}>Car Number:</Text>{' '}
                    {carNumber.toUpperCase()}
                  </Text>
                  <Text style={styles.genText}>
                    <Text style={{fontWeight: 'bold'}}>Date of issue:</Text>{' '}
                    {formattedDate}
                  </Text>
                  <Text style={styles.genText}>
                    <Text style={{fontWeight: 'bold'}}>Time:</Text>{' '}
                    {formattedTime}
                  </Text>
                  <Text style={styles.genText}>
                  <Text style={{ fontWeight: 'bold' }}>Violation:</Text>{' '}
                  {selectedViolations && selectedViolations.length > 0 ? (
                    selectedViolations.map((violation, index) => (
                      <Text key={index}>{'\n'}{violation}</Text>
                    ))
                  ) : (
                    'None'
                  )}
                </Text>





                  <Text style={styles.genText}>
                    <Text style={{fontWeight: 'bold'}}>Issued by:</Text>{' '}
                    {issuedBy}
                  </Text>
                  {address && (
                    
                  <Text style={styles.genText}>
                    <Text style={{ fontWeight: 'bold' ,flexWrap: 'wrap' }}>Location:</Text> {address}
                  </Text>
                )}

                </View>
                <View style={styles.qrView}> 
                  <QRCode
                  
                    value={qrValue}
                    size={80}
                    backgroundColor="white"
                    color="black"
                  />
                </View>
              </View>

              <Text style={styles.validText}>
              <Text  style={{fontWeight: 'bold'}}>Valid until:</Text>{' '}
              {validUntilDate}, {validUntilTime}
              </Text>
            </View>
          )}
        </View>
        
        

 </ScrollView>
          {generateBtn && (
            <View style={styles.sendPass}>
            <Button title="Send Pass" onPress={captureQR} color="#57d4e5"/>
            </View>
          )}
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Goa Police ©</Text>
        </View>
               
   
     
      
      </View>
  );
};

const styles = StyleSheet.create({
  
  qrView:{
    position:'absolute',
    right:10,
    top:30
    },

  buttons:{
    marginTop: 20,
     flex: 1,
      gap: 5,
      
  },
  resetButton:{
    borderRadius:10,
    overflow:'hidden'
  },

   generateButton:{
 borderRadius:10,
    overflow:'hidden'
  },
  sendPass:{
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
   borderRadius:10,
    overflow:'hidden',
     
  },
  captureQR:{
    margin:20,
    width:400,
    height:200,
    resizeMode:'contain'
    
  },
  genText: {
    color: '#333',
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  logo: {
    width: 80, // Adjust as necessary
    height: 80, // Adjust as necessary
    marginRight: 10,
    resizeMode:'cover'
  },
  header: {
    height: 140,
    backgroundColor: '#42c5d6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    color: '#222',
  },
  detailHead: {
    flex: 1,
    maxHeight: 50,
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  detailBody: {
    padding: 15,
    gap: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  detailB: {
    marginHorizontal: 20,
  },
  passDetail: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 30,
  },
  qrSection: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 30,
    marginBottom: 50,
    paddingBottom: 15,
  },
  validText: {
    fontSize: 16,
    color: '#222',
    marginLeft:10
  },
  footer: {
    height: 50,
    backgroundColor: '#42c5d6',
    justifyContent: 'center',
    
    alignItems:'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default App;
