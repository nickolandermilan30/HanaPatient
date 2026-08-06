import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { auth } from '../../../Firebase/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function FPD() {
  const router = useRouter();
  const { language } = useLocalSearchParams();
  const isTagalog = language === 'filipino';
  
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Row */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4A148C" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.topApplyButton} 
          onPress={() => router.push({ pathname: '/Layout/Apply/FPDA', params: { language } })}
        >
          <Text style={styles.topApplyText}>
            {isTagalog ? 'Mag-apply' : 'Apply'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBox}>
          <View style={styles.imageCircle}>
            <Image source={require('../../../Image/fixed_denture.png')} style={styles.headerImage} />
          </View>
          <Text style={styles.title}>
            {isTagalog ? 'Fixed Partial Denture' : 'Fixed Partial Denture'}
          </Text>
          <Text style={styles.subTitle}>
            {isTagalog ? '(Nakapirming Pustiso / Fixed Bridge)' : '(Fixed Bridge)'}
          </Text>
          
          <View style={styles.userContainer}>
            <Text style={styles.userLabel}>
              {isTagalog ? 'Naka-log in bilang:' : 'Logged in as:'}
            </Text>
            <Text style={styles.userEmail}>{userEmail || (isTagalog ? 'Walang naka-log in na user' : 'No user logged in')}</Text>
          </View>
        </View>

        {/* Image Section (Single Image) */}
        <View style={styles.singleImageContainer}>
          <Image source={require('../../../assets/Teeth/FPD_Bridge.png')} style={styles.singleImage} resizeMode="contain" />
        </View>

        {/* Indication */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>
            {isTagalog ? 'Indikasyon (Kailan ginagamit):' : 'Indication:'}
          </Text>
          <Text style={styles.text}>
            {isTagalog ? '• Maikling espasyo ng mga nawalang ngipin (Short span edentulous arches)' : '• Short span edentulous arches'}
          </Text>
          <Text style={styles.text}>
            {isTagalog ? '• May mga natitirang matitibay na ngipin para sa suporta' : '• Presence of sound teeth for support'}
          </Text>
          <Text style={styles.text}>
            {isTagalog ? '• Mga kaso ng pagbaba ng buto (ridge resorption) kung saan hindi matatag o kumakapit ang RPD' : '• Cases with ridge resorption where RPD cannot be stable or retentive'}
          </Text>
          <Text style={styles.text}>
            {isTagalog ? '• Gusto o kagustuhan ng pasyente' : "• Patient's preference"}
          </Text>
          <Text style={styles.text}>
            {isTagalog ? '• Mga pasyenteng may kapansanan sa pag-iisip o hirap mag-alaga ng naaalis na pustiso' : "• Mentally compromised or handicapped patients who can not maintain the removable prosthesis"}
          </Text>
        </View>
        
        {/* Contraindication */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>
            {isTagalog ? 'Kontra-indikasyon (Kailan hindi dapat gamitin):' : 'Contraindication:'}
          </Text>
          <Text style={styles.text}>
            {isTagalog ? '• Malaking kawalan ng buto tulad ng mula sa aksidente o trauma' : '• Large amount of bone loss as in trauma.'}
          </Text>
          <Text style={styles.text}>
            {isTagalog ? '• Batang pasyente na malalaki pa ang pulp chamber' : '• Young patients with large pulp chambers'}
          </Text>
          <Text style={styles.text}>
            {isTagalog ? '• Mahihinang ngiping pagtatapunan o pagkakapitan (Abutments)' : '• Periodontally compromised abutments'}
          </Text>
          <Text style={styles.text}>
            {isTagalog ? '• Mahabang espasyo ng mga nawalang ngipin' : '• Large span edentulous arches'}
          </Text>
          <Text style={styles.text}>
            {isTagalog ? '• Mga espasyo ng nawalang ngipin sa magkabilang panig (Bilateral edentulous spaces)' : '• Bilateral edentulous spaces'}
          </Text>
          <Text style={styles.text}>
            {isTagalog ? '• Likas na deformed o hindi maayos ang hugis ng mga ngipin' : '• Congenitally malformed teeth'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  backButton: { padding: 5 },
  topApplyButton: { backgroundColor: '#4A148C', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  topApplyText: { color: '#FFF', fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingTop: 0 },
  headerBox: { alignItems: 'center', marginBottom: 20 },
  imageCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E1BEE7', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 3, borderColor: '#4A148C' },
  headerImage: { width: 80, height: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4A148C', textAlign: 'center' },
  subTitle: { fontSize: 16, color: '#4A148C', marginBottom: 10 },
  userContainer: { width: '100%', padding: 15, backgroundColor: '#FFF', borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#E1BEE7' },
  userLabel: { fontSize: 12, color: '#4A148C', fontWeight: '600' },
  userEmail: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  singleImageContainer: { marginBottom: 15, alignItems: 'center' },
  singleImage: { width: '100%', height: 200 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, elevation: 3 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  text: { fontSize: 14, color: '#000', marginBottom: 8, lineHeight: 20 },
  boldText: { fontWeight: 'bold' }
});