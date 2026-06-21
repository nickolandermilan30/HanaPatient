import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../../Firebase/FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

// Import ng mga screens
import Home from './Home'; 
import Customer from './Customer';
import Profile from './Profile';

export default function AdminHome() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Home'); // Default ay 'Home'

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, 'users/' + user.uid);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        setUserData(data);
        setLoading(false);
      });
    }
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#4A148C" style={{ flex: 1 }} />;
  }

  // Render function: I-render ang imported components
const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        // Dito natin pinapasa ang function
        return <Home setActiveTab={setActiveTab} />;
      case 'Customer':
        return <Customer />;
      case 'Profile':
        return <Profile />;
      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeTitle}>Admin Dashboard</Text>
          <Text style={styles.userName}>
            {userData ? `${userData.firstName} ${userData.middleName || ''} ${userData.lastName}` : 'Loading...'}
          </Text>
          <Text style={styles.userEmail}>{userData?.email}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Home')}>
          <Ionicons name="home" size={24} color={activeTab === 'Home' ? '#4A148C' : '#999'} />
          <Text style={{ color: activeTab === 'Home' ? '#4A148C' : '#999', fontSize: 12 }}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Customer')}>
          <Ionicons name="people" size={24} color={activeTab === 'Customer' ? '#4A148C' : '#999'} />
          <Text style={{ color: activeTab === 'Customer' ? '#4A148C' : '#999', fontSize: 12 }}>Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Profile')}>
          <Ionicons name="person" size={24} color={activeTab === 'Profile' ? '#4A148C' : '#999'} />
          <Text style={{ color: activeTab === 'Profile' ? '#4A148C' : '#999', fontSize: 12 }}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF' },
  header: { 
    backgroundColor: '#4A148C', 
    paddingHorizontal: 25, 
    paddingBottom: 25,
    paddingTop: 50,
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
  },
  welcomeTitle: { color: '#E1BEE7', fontSize: 14, fontWeight: '600' },
  userName: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  userEmail: { color: '#DDD', fontSize: 12, marginTop: 2 },
  content: { flex: 1, width: '100%' }, 
  navbar: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingVertical: 15, 
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    elevation: 10,
  },
  navItem: { alignItems: 'center' }
});