import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, BackHandler, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../../Firebase/FirebaseConfig';
import { signOut } from 'firebase/auth'; // Import signOut
import { ref, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

import Home from './Home'; 
import Customer from './Customer';
import Profile from './Profile';

export default function AdminHome() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [modalVisible, setModalVisible] = useState(false); // State para sa Modal

  useEffect(() => {
    // BackHandler para sa Android back button
    const backAction = () => {
      setModalVisible(true);
      return true; // Pinipigilan ang default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Fetch user data
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, 'users/' + user.uid);
      onValue(userRef, (snapshot) => {
        setUserData(snapshot.val());
        setLoading(false);
      });
    }

    return () => backHandler.remove();
  }, []);

  const handleLogout = async () => {
    setModalVisible(false);
    await signOut(auth);
    router.replace('/Layout/Login');
  };

  if (loading) return <ActivityIndicator size="large" color="#4A148C" style={{ flex: 1 }} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'Home': return <Home setActiveTab={setActiveTab} />;
      case 'Customer': return <Customer />;
      case 'Profile': return <Profile />;
      default: return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeTitle}>Admin Dashboard</Text>
          <Text style={styles.userName}>{userData ? `${userData.firstName} ${userData.lastName}` : '...'}</Text>
          <Text style={styles.userEmail}>{userData?.email}</Text>
        </View>
      </View>

      <View style={styles.content}>{renderContent()}</View>

      {/* Logout Confirmation Modal */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={{color: '#4A148C'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirm} onPress={handleLogout}>
                <Text style={{color: '#FFF'}}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.navbar}>
        {/* Navbar Items */}
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Home')}><Ionicons name="home" size={24} color={activeTab === 'Home' ? '#4A148C' : '#999'} /><Text style={{fontSize: 10, color: activeTab === 'Home' ? '#4A148C' : '#999'}}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Customer')}><Ionicons name="people" size={24} color={activeTab === 'Customer' ? '#4A148C' : '#999'} /><Text style={{fontSize: 10, color: activeTab === 'Customer' ? '#4A148C' : '#999'}}>Customer</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Profile')}><Ionicons name="person" size={24} color={activeTab === 'Profile' ? '#4A148C' : '#999'} /><Text style={{fontSize: 10, color: activeTab === 'Profile' ? '#4A148C' : '#999'}}>Profile</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF' },
  header: { backgroundColor: '#4A148C', padding: 25, paddingTop: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  welcomeTitle: { color: '#E1BEE7', fontSize: 14 },
  userName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  userEmail: { color: '#DDD', fontSize: 12 },
  content: { flex: 1 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: 300, padding: 25, backgroundColor: 'white', borderRadius: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalText: { marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 10 },
  btnCancel: { padding: 10, paddingHorizontal: 20, borderRadius: 10, backgroundColor: '#EEE' },
  btnConfirm: { padding: 10, paddingHorizontal: 20, borderRadius: 10, backgroundColor: '#D32F2F' },
  navbar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  navItem: { alignItems: 'center' }
});