// QRCodeGenerator.js
import React, { useRef } from 'react';
import { View, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';

const QRCodeGenerator = ({ qrValue }) => {
  const qrRef = useRef(); // Create a ref for the QR code view

  const generateQRCodeImage = async () => {
    try {
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
      });
      return uri; // Return the URI of the generated QR code image
    } catch (error) {
      console.error('Error capturing QR Code:', error);
      Alert.alert('Error', 'Failed to capture QR Code.');
      return null; // Return null on error
    }
  };

  return (
    <View ref={qrRef}>
      <QRCode
        value={qrValue}
        size={80}
        backgroundColor="white"
        color="black"
      />
    </View>
  );
};

export default QRCodeGenerator;
