import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  Animated,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner'; // Importing BarCodeScanner from expo-barcode-scanner
import CryptoJS from 'crypto-js';
import moment from 'moment';
import 'react-native-get-random-values';

const generateSecretKey = () => {
  const date = moment().format('YYYY-MM-DD'); // Format date as YYYY-MM-DD
  return 'hey-you'; // Example secret key
};

const verifyHMACSignature = (data, secretKey, hmacSignature) => {
  const computedSignature = CryptoJS.HmacSHA256(
    JSON.stringify(data),
    secretKey,
  ).toString();
  return computedSignature === hmacSignature;
};

const decryptData = (encryptedData, secretKey, salt) => {
  try {
    // Generate the salted key using the provided salt
    const saltedKey = CryptoJS.SHA256(secretKey + salt).toString();

    const bytes = CryptoJS.AES.decrypt(encryptedData, saltedKey, {
      format: CryptoJS.format.OpenSSL, // Explicitly using OpenSSL format
    });
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    console.log('Decrypted Data:', decrypted); // Debugging: log decrypted data
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error); // Debugging: log any decryption errors
    throw new Error('Decryption failed');
  }
};

const AppPro = () => {
  const [scanned, setScanned] = useState(false);
  const [passStatus, setPassStatus] = useState('');
  const [qrData, setQrData] = useState({});

  // Animation state for the scanning line
  const moveAnim = useRef(new Animated.Value(0)).current;

  const handleBarCodeScanned = ({ type, data }) => {
    if (!scanned) {
      setScanned(true);
      try {
        const parsedQR = JSON.parse(data); // Parse the scanned QR code data
        const { encryptedQRData, hmacSignature, salt } = parsedQR;

        const secretKey = generateSecretKey();

        // Decrypt the data
        const decryptedData = decryptData(encryptedQRData, secretKey, salt);

        const parsedQrData =
          typeof decryptedData === 'string'
            ? JSON.parse(decryptedData)
            : decryptedData;

        // Verify the HMAC signature
        const isSignatureValid = verifyHMACSignature(
          decryptedData,
          secretKey,
          hmacSignature,
        );

        if (!isSignatureValid) {
          Alert.alert('Invalid QR Code', 'The QR code has been tampered with.');
          setPassStatus('Invalid QR Code');
          return;
        }

        // Check pass expiry
        const validUntil = moment(parsedQrData.validUntil);
        const currentTime = moment();
        let isValid = true;

        // Check if the pass is expired
        if (currentTime.isAfter(validUntil)) {
          isValid = false;
        }

        if (isValid) {
          setPassStatus('Valid Pass');
        } else {
          setPassStatus('Expired Pass');
        }

        setQrData(parsedQrData);
        console.log('data:', qrData);
      } catch (error) {
        Alert.alert('Invalid QR Code', 'The QR code is not valid.');
        console.log('Error:', error);
        setPassStatus('Invalid Pass');
        setScanned(true);
      }
    }
  };

  // Function to reset the scanner for another scan
  const resetScanner = () => {
    setScanned(false);
    setPassStatus('');
    setQrData({});
    startAnimation();
  };

  // Animation logic to move the line up and down
  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: 1,
          duration: 2000, // Time for the line to move across the screen
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 0,
          duration: 2000, // Time for the line to reset back
          useNativeDriver: true,
        }),
      ]),
    ).start(); // Start the animation
  };

  useEffect(() => {
    startAnimation(); // Start the animation when the component mounts
  }, []);

  const translateY = moveAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0, 150], // Adjust for how far the line should move
  });

  useEffect(() => {
    console.log('Updated qrData:', qrData); // This should show the latest state
  }, [qrData]);

  return (
    <View style={styles.container}>
      {!scanned ? (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        >
          <View style={styles.overlayTop} />
          <View style={styles.overlayBottom} />
          <View style={styles.overlayLeft} />
          <View style={styles.overlayRight} />
          <View style={styles.scanArea}>
            {/* Scanning Line Animation */}
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY }] }, // Apply translation animation
              ]}
            />
            <Text style={styles.scanText}>Scan QR Code</Text>
          </View>
        </BarCodeScanner>
      ) : (
        <View
          style={[
            styles.card,
            passStatus === 'Valid Pass'
              ? styles.validCard
              : styles.invalidCard,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              passStatus === 'Valid Pass'
                ? styles.validText
                : styles.invalidText,
            ]}
          >
            {passStatus}
          </Text>

          {/* Conditional rendering based on pass validity */}
          <View style={styles.cardRow}>
            <Text style={styles.label}>Mobile Number: </Text>
            <Text style={styles.value}>{qrData?.mobileNumber || 'N/A'}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Car Number: </Text>
            <Text style={styles.value}>{qrData?.carNumber || 'N/A'}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Violation: </Text>
            <Text style={styles.value}>{qrData?.violation || 'N/A'}</Text>
          </View>
          <View style={styles.cardRow}>
          <Text style={styles.label}>Location: </Text>
            <Text style={styles.value}>{qrData?.address || 'N/A'}</Text>
          </View>
          

          {/* Display the "Issued By" field */}
          <View style={styles.cardRow}>
            <Text style={styles.label}>Issued By: </Text>
            <Text style={styles.value}>{qrData?.issuedBy || 'N/A'}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.label}>Valid Until: </Text>
            <Text style={styles.value}> 
              {qrData?.validUntil
                ? moment(qrData.validUntil).format('YYYY-MM-DD HH:mm:ss')
                : 'N/A'}
            </Text>
          </View>

          <Button title="Scan Again" onPress={resetScanner} />
        </View>
      )}
    </View>
  );
};

export default AppPro;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  scanArea: {
    width: '80%',
    height: '40%',
    borderColor: '#fff',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    left: 39,
    top: 232,
  },
  scanLine: {
    width: '90%',
    height: 2,
    backgroundColor: 'red',
    position: 'absolute',
  },
  scanText: {
    color: '#fee5e5',
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent blur effect
    zIndex: 0,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent blur effect
    zIndex: 0,
  },
  overlayLeft: {
    position: 'absolute',
    top: '30%',
    bottom: '30%',
    left: 0,
    width: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent blur effect
    zIndex: 0,
  },
  overlayRight: {
    position: 'absolute',
    top: '30%',
    bottom: '30%',
    right: 0,
    width: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent blur effect
    zIndex: 0,
  },
  card: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  validCard: {
    backgroundColor: 'lightgreen',
  },
  invalidCard: {
    backgroundColor: 'lightcoral',
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 10,
  },
  validText: {
    color: 'green',
  },
  invalidText: {
    color: 'red',
  },
});
