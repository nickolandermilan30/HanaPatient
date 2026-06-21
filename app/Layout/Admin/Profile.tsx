import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, SafeAreaView } from 'react-native';
import { auth, db } from '../../../Firebase/FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, 'users/' + user.uid);
      onValue(userRef, (snapshot) => {
        setUserData(snapshot.val());
        setLoading(false);
      });
    }
  }, []);

  const handleLogout = async () => {
    setModalVisible(false);
    await signOut(auth);
    router.replace('/Layout/Login');
  };

  if (loading) return <ActivityIndicator size="large" color="#4A148C" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={50} color="#FFF" />
        </View>
        <Text style={styles.name}>{`${userData?.firstName} ${userData?.lastName}`}</Text>
        <Text style={styles.role}>{userData?.role?.toUpperCase() || 'USER'}</Text>
      </View>

      {/* Details Container */}
      <View style={styles.detailsContainer}>
        <DetailRow icon="email" label="Email" value={userData?.email} />
        <DetailRow icon="phone" label="Contact" value={userData?.contact} />
        <DetailRow icon="map-marker" label="Address" value={userData?.address} />
        <DetailRow icon="briefcase" label="Occupation" value={userData?.occupation} />
        <DetailRow icon="cake" label="Age" value={userData?.age} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Logout Confirmation Modal */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="alert-circle" size={50} color="#D32F2F" />
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleLogout}>
                <Text style={styles.confirmBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const DetailRow = ({ icon, label, value }: any) => (
  <View style={styles.row}>
    <MaterialCommunityIcons name={icon} size={22} color="#4A148C" />
    <View style={styles.rowText}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF', padding: 20 },
  profileCard: { alignItems: 'center', marginVertical: 10 },
  avatarContainer: { backgroundColor: '#4A148C', padding: 20, borderRadius: 50, marginBottom: 10, elevation: 5 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#4A148C' },
  role: { color: '#6A1B9A', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
  detailsContainer: { backgroundColor: '#FFF', padding: 25, borderRadius: 25, elevation: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  rowText: { marginLeft: 15 },
  label: { fontSize: 12, color: '#999', textTransform: 'uppercase' },
  value: { fontSize: 16, color: '#333', fontWeight: '600' },
  logoutButton: { flexDirection: 'row', backgroundColor: '#D32F2F', padding: 15, borderRadius: 15, marginTop: 30, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#FFF', marginLeft: 10, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '80%', backgroundColor: '#FFF', borderRadius: 25, padding: 30, alignItems: 'center', elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 15, color: '#333' },
  modalText: { color: '#666', marginBottom: 20, textAlign: 'center' },
  modalButtonContainer: { flexDirection: 'row', gap: 15 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10, backgroundColor: '#EEE' },
  cancelBtnText: { color: '#333', fontWeight: 'bold' },
  confirmBtn: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10, backgroundColor: '#D32F2F' },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold' }
});