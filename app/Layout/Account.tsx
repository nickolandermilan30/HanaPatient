import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  ActivityIndicator, ScrollView, Platform, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../Firebase/FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import { useRouter } from 'expo-router';

const Account = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showMedical1, setShowMedical1] = useState(false);
  const [showMedical2, setShowMedical2] = useState(false);
  const [showAllergies, setShowAllergies] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const userRef = ref(db, 'users/' + user.uid);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setUserData(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4A148C" /></View>;

  const med = userData?.medicalHistory || {};
  const med2 = userData?.medicalHistoryPart2 || {};
  const allergies = med?.allergies || {};

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userData?.firstName?.[0]}{userData?.lastName?.[0]}</Text>
          </View>
          <Text style={styles.userName}>{userData?.firstName} {userData?.middleName} {userData?.lastName}</Text>
        </View>

        <Text style={styles.sectionHeader}>Personal Information</Text>
        <View style={styles.card}>
          <InfoItem label="Email" value={userData?.email} icon="mail-outline" />
          <InfoItem label="Age" value={userData?.age} icon="calendar-outline" />
          <InfoItem label="Contact" value={userData?.contact} icon="call-outline" />
          <InfoItem label="Address" value={userData?.address} icon="location-outline" />
        </View>

        <DropdownSection title="Medical Record" isOpen={showMedical1} onToggle={() => setShowMedical1(!showMedical1)}>
          <InfoItem label="In good health?" value={med.health ? "Yes" : "No"} icon="heart-outline" />
          <InfoItem label="Under treatment?" value={med.medicalTreatment ? "Yes" : "No"} icon="bandage-outline" />
          <InfoItem label="Serious Illness" value={med.seriousIllness ? "Yes" : "No"} icon="medkit-outline" />
          <InfoItem label="Hospitalized?" value={med.hospitalized ? "Yes" : "No"} icon="bed-outline" />
          <InfoItem label="Taking medication?" value={med.medication ? "Yes" : "No"} icon="flask-outline" />
          <InfoItem label="Smoking" value={med.smoking ? "Yes" : "No"} icon="flame-outline" />
        </DropdownSection>

        <DropdownSection title="Conditions" isOpen={showMedical2} onToggle={() => setShowMedical2(!showMedical2)}>
          {med2.conditions && Object.keys(med2.conditions).length > 0 ? (
            Object.entries(med2.conditions).map(([key, val]: any) => (
              val && <Text key={key} style={styles.bulletText}>• {key.replace(/_/g, ' ')}</Text>
            ))
          ) : <Text style={styles.noneText}>None</Text>}
          <View style={styles.divider} />
          <Text style={styles.label}>Others:</Text>
          <Text style={styles.valueText}>{med2.others || "None"}</Text>
        </DropdownSection>

        <DropdownSection title="Allergies" isOpen={showAllergies} onToggle={() => setShowAllergies(!showAllergies)}>
          {Object.values(allergies).includes(true) ? (
            Object.entries(allergies).map(([key, val]: any) => (
              val === true && <Text key={key} style={styles.bulletText}>• {key}</Text>
            ))
          ) : <Text style={styles.noneText}>None</Text>}
          {med.othersDetail ? (
            <View style={{marginTop: 10}}>
              <Text style={styles.label}>Other Allergies Details:</Text>
              <Text style={styles.valueText}>{med.othersDetail}</Text>
            </View>
          ) : null}
        </DropdownSection>
      </ScrollView>
    </View>
  );
};

const DropdownSection = ({ title, isOpen, onToggle, children }: any) => (
  <View style={styles.dropdownWrapper}>
    <TouchableOpacity style={styles.dropdownHeader} onPress={onToggle}>
      <Text style={styles.dropdownTitle}>{title}</Text>
      <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#FFF" />
    </TouchableOpacity>
    {isOpen && <View style={styles.dropdownContent}>{children}</View>}
  </View>
);

const InfoItem = ({ label, value, icon }: any) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={22} color="#7B1FA2" />
    <View style={styles.infoTextContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, 
    paddingBottom: 20, backgroundColor: '#E1BEE7', borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 20 : 20 
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  scrollContent: { padding: 20 },
  profileCard: { alignItems: 'center', marginBottom: 25, backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 3 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E1BEE7', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#4A148C' },
  userName: { fontSize: 20, fontWeight: 'bold', marginTop: 10, color: '#333' },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#4A148C', marginBottom: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 20, elevation: 2 },
  dropdownWrapper: { marginBottom: 15 },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#E1BEE7', padding: 18, borderRadius: 15, elevation: 2 },
  dropdownTitle: { color: '#000000', fontWeight: 'bold', fontSize: 16 },
  dropdownContent: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginTop: 5, borderWidth: 1, borderColor: '#EDE7F6' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  infoTextContainer: { marginLeft: 15 },
  label: { fontSize: 12, color: '#888', textTransform: 'uppercase' },
  value: { fontSize: 15, fontWeight: '600', color: '#333' },
  valueText: { fontSize: 15, fontWeight: '600', color: '#4A148C', marginTop: 2 },
  bulletText: { fontSize: 15, color: '#333', marginVertical: 3, fontWeight: '500' },
  noneText: { fontSize: 14, fontStyle: 'italic', color: '#AAA' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default Account;