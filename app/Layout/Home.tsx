import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, Image, 
  TouchableOpacity, StatusBar, BackHandler, Modal, ScrollView 
} from 'react-native';
import { auth, db } from '../../Firebase/FirebaseConfig'; 
import { ref, onValue } from 'firebase/database';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';

export default function Home() {
  const router = useRouter();
  const [userData, setUserData] = useState<{firstName: string, lastName: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(true); // Modal active by default

  // 1. Back Button (Logout) Logic
  useEffect(() => {
    const backAction = () => {
      setLogoutModalVisible(true);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // 2. Data Fetching
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, 'users/' + user.uid);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData({ firstName: data.firstName || '', lastName: data.lastName || '' });
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setLogoutModalVisible(false);
    router.replace('/Layout/Login');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7B1FA2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* --- INFO MODAL (Lumabas pagbukas ng Home) --- */}
      <Modal transparent={true} visible={infoModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.card}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Image source={require('../../Image/Logo.png')} style={styles.logoModal} resizeMode="contain" />
              <Text style={styles.title}>What is HanaPatient?</Text>
              <Text style={styles.description}>
                HanaPatient is a patient contact management application developed to assist dental clinicians 
                in efficiently finding and managing patients according to specific clinical case requirements. 
                {'\n\n'}
                The application serves as a centralized platform where patient information can be organized, 
                stored, and accessed conveniently, reducing the time and effort required in manual patient searching.
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={() => setInfoModalVisible(false)}>
              <Text style={styles.buttonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- LOGOUT MODAL --- */}
      <Modal transparent={true} visible={logoutModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
            <TouchableOpacity style={styles.yesButton} onPress={handleLogout}>
              <Text style={styles.yesButtonText}>Yes, Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setLogoutModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.logoContainer}>
        <Image source={require('../../Image/Logo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.nameText}>{userData ? `${userData.firstName} ${userData.lastName}` : 'User'}</Text>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={() => router.push('/Layout/Dashboard')}>
        <Text style={styles.continueText}>Tap to Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 60 },
  logoContainer: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginTop: 50, elevation: 10 },
  logo: { width: 140, height: 140 },
  textContainer: { alignItems: 'center' },
  welcomeText: { fontSize: 28, color: '#4A148C' },
  nameText: { fontSize: 32, fontWeight: '800', color: '#7B1FA2', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  continueButton: { backgroundColor: '#7B1FA2', paddingVertical: 15, paddingHorizontal: 50, borderRadius: 30, marginBottom: 20 },
  continueText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  // Info Modal Styles
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  card: { width: '100%', maxHeight: '85%', backgroundColor: '#FFFFFF', borderRadius: 25, padding: 30, alignItems: 'center', elevation: 5 },
  logoModal: { width: 100, height: 100, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4A148C', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 16, color: '#333', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  button: { marginTop: 10, paddingVertical: 15 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#6A1B9A' },
  // Logout Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 300, backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  yesButton: { backgroundColor: '#FF3B30', padding: 10, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 10 },
  yesButtonText: { color: 'white', fontWeight: 'bold' },
  cancelButton: { padding: 10, width: '100%', alignItems: 'center' },
  cancelButtonText: { color: '#007AFF', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});