import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerImageView}>
          <Image style={styles.headImage} source={require('../assets/VahaanSahayaak.png')} />
        </View>
        <Text style={styles.headerText}>Vahan Sahayyak</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <TouchableOpacity style={[styles.button, styles.scanButton]} onPress={() => navigation.navigate('ScanQR')}>
          <View style={styles.iconContainer}>
            <Image source={require('../assets/ScanQR2.png')} style={styles.icon} />
          </View>
          <Text style={styles.buttonText}>SCAN QR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.generateButton]} onPress={() => navigation.navigate('GenerateQR')}>
          <View style={styles.iconContainer}>
            <Image source={require('../assets/GeneratePass2.png')} style={styles.icon} />
          </View>
          <Text style={styles.buttonText}>GENERATE PASS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.historyButton]} onPress={() => navigation.navigate('PassHistory')}>
          <View style={styles.iconContainer}>
            <Image source={require('../assets/PassHistory.png')} style={styles.icon} />
          </View>
          <Text style={styles.buttonText}>PASS HISTORY</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Image source={require('../assets/GoaPoliceLogo.png')} style={styles.footerLogo} />
        <Text style={styles.footerText}>© App Policy | Contact Us | Feedback | Help | Site Map | All rights reserved |</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerImageView: {
    marginRight: 0,
  },
  headImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginRight: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#42d5c6',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#C9C4AA',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 30,
    alignSelf:'center'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    elevation: 10,
    padding: 20,
    marginVertical: 15,
    width: '90%',
    justifyContent: 'flex-start',
    margin: 20,
  },
  scanButton: {
    backgroundColor: '#4CAF50',  // Green color for scan
  },
  generateButton: {
    backgroundColor: '#2196F3',  // Blue color for generate pass
  },
  historyButton: {
    backgroundColor: '#FF9800',  // Orange color for pass history
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',  // Set button text color to white
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#42d5c6',
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#C9C4AA',
  },
  footerLogo: {
    width: 50,
    height: 50,
    marginLeft: 10,
    marginRight: 20,
  },
  footerText: {
    color: 'black',
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
});

export default HomeScreen;
