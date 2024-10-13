import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Assuming your Firebase configuration is in this file

const PassList = () => {
  const [passList, setPassList] = useState([]);

  useEffect(() => {
    const fetchPassData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Pass'));
        const passArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPassList(passArray); // Set the pass data to state
      } catch (error) {
        console.error('Error fetching documents: ', error);
      }
    };

    fetchPassData(); // Fetch data on component mount
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {passList.length > 0 ? (
          passList.map((pass) => (
            <View key={pass.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Mobile Number: </Text>
                <Text style={styles.value}>{pass.mobileNumber || 'N/A'}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Car Number: </Text>
                <Text style={styles.value}>{pass.carNumber || 'N/A'}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Violation: </Text>
                <Text style={styles.value}>{pass.violation || 'N/A'}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Date of Issue: </Text>
                <Text style={styles.value}>
                  {new Date(pass.dateOfIssue).toLocaleDateString() || 'N/A'}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Time of Issue: </Text>
                <Text style={styles.value}>{pass.timeOfIssue || 'N/A'}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Issued By: </Text>
                <Text style={styles.value}>{pass.issuedBy || 'N/A'}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Location: </Text>
                <Text style={styles.value}>{pass.address || 'N/A'}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Valid Until: </Text>
                <Text style={styles.value}>
                  {new Date(pass.validUntil).toLocaleString() || 'N/A'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text>No passes found</Text>
        )}
      </ScrollView>

      {/* Footer Component */}
      <View style={styles.footer}>
      <Image source={require('../assets/GoaPoliceLogo.png')} style={styles.footerLogo} />
        <Text style={styles.footerText}>Powered by Goa Police ©</Text>
      </View>
    </View>
  );
};

export default PassList;

const styles = StyleSheet.create({
    footerLogo: {
        width: 50,
        height: 50,
        marginLeft: 10,
        marginRight: 20,
      },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Add padding to ensure content doesn't overlap the footer
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    marginBottom: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#42d5c6',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection:'row'
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
