import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Assuming your Firebase configuration is in this file
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const PassList = () => {
  const [passList, setPassList] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [issuedBy, setIssuedBy] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const docRef = doc(db, 'Profile', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setIssuedBy(docSnap.data().user_name); // Correctly set issuedBy here
        } else {
          console.log('No such document!');
          setIssuedBy('Unknown'); // Set default value if user name not found
        }
      } else {
        console.log('No user is currently signed in.');
        setIssuedBy('Unknown'); // Set default value if no user is signed in
      }
    };

    fetchUserName(); // Fetch the user's issuedBy value on component mount
  }, []);

  useEffect(() => {
    // Run this useEffect when issuedBy is updated
    const fetchPassData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Pass'));
        console.log('Fetched documents:', querySnapshot.docs.map(doc => doc.data())); // Log all the fetched documents
        
        const passArray = querySnapshot.docs
          .map((doc) => {
            const passId = doc.id; // Document ID (e.g., dateOfIssue_TimeOfIssue_issuedBy)
            const parts = passId.split('_'); // Split by `_`
            const issuedByUser = parts[2]; // Extract the `issuedBy` part (assuming this is always the 3rd part)
    
            // Return only the documents where issuedBy matches the current user's name
            if (issuedBy === issuedByUser) {
              return {
                id: doc.id,
                ...doc.data(),
              };
            }
            return null; // Return null for passes that don't match
          })
          .filter((pass) => pass !== null) // Remove the null entries
          .sort((a, b) => {
            const dateA = new Date(`${a.dateOfIssue} ${a.timeOfIssue}`);
            const dateB = new Date(`${b.dateOfIssue} ${b.timeOfIssue}`);
            return dateB - dateA; // Sort in descending order (latest first)
          });
    
        console.log('Filtered and sorted passes:', passArray); // Log the filtered and sorted data
    
        setPassList(passArray); // Set the sorted pass data to state
      } catch (error) {
        console.error('Error fetching documents:', error); // Log the full error message
        setError('Network error, please try again later.');
      } finally {
        setLoading(false); // Turn off loading
      }
    };
    
    

    if (issuedBy) {
      fetchPassData(); // Fetch data only when issuedBy is set
    }
  }, [issuedBy]); // Add issuedBy as a dependency

  if (loading) {
    // Show progress bar while loading data
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#42d5c6" />
        <Text>Loading Passes...</Text>
      </View>
    );
  }

  if (error) {
    // Show error message if network error occurs
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

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
          <View style={styles.noPass}>
            <Text style={styles.noPassText}>No passes found</Text>
          </View>
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
  noPassText: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPass: {
    textAlign: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLogo: {
    width: 50,
    height: 50,
    marginLeft: 10,
    marginRight: 20,
  },
  container: {
    flex: 1,
    marginTop: 15,
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
    flexDirection: 'row',
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
