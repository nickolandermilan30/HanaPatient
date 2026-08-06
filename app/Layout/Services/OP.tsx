import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { auth } from '../../../Firebase/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function OP() {
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
          onPress={() => router.push({ pathname: '/Layout/Apply/OPA', params: { language } })}
        >
          <Text style={styles.topApplyText}>{isTagalog ? 'Mag-apply' : 'Apply'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBox}>
          <View style={styles.imageCircle}>
            <Image source={require('../../../Image/prophylaxis.png')} style={styles.headerImage} />
          </View>
          <Text style={styles.title}>{isTagalog ? 'Paglilinis ng Ngipin' : 'Oral Prophylaxis'}</Text>
          <Text style={styles.subTitle}>(Linis)</Text>
          
          <View style={styles.userContainer}>
            <Text style={styles.userLabel}>{isTagalog ? 'Naka-log in bilang:' : 'Logged in as:'}</Text>
            <Text style={styles.userEmail}>{userEmail || (isTagalog ? 'Walang naka-log in na user' : 'No user logged in')}</Text>
          </View>
        </View>

        {/* Teeth Images Section */}
        <View style={styles.teethImagesContainer}>
          <Image source={require('../../../assets/Teeth/Slight.png')} style={styles.teethImage} />
          <Image source={require('../../../assets/Teeth/Moderate.png')} style={styles.teethImage} />
          <Image source={require('../../../assets/Teeth/Severe.png')} style={styles.teethImage} />
        </View>

        {/* Indication */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{isTagalog ? 'Indikasyon:' : 'Indication:'}</Text>
          <Text style={styles.text}>
            {isTagalog 
              ? 'Ang oral prophylaxis ay inirerekomenda para sa mga taong may plaque, tartar, o mantsa sa kanilang mga ngipin. Nakatutulong din ito sa mga may namamaga na gilagid o mabahong hininga. Ang regular na oral prophylaxis ay tumutulong na mapanatiling malinis at malusog ang mga ngipin at gilagid, at nag-iwas sa mga problema tulad ng pagkabulok ng ngipin at sakit sa gilagid.'
              : 'Oral prophylaxis is recommended for people who have plaque, tartar, or stains on their teeth. It is also helpful for those with swollen gums or bad breath. Regular oral prophylaxis helps keep the teeth and gums clean and healthy and prevents dental problems such as cavities and gum disease.'}
          </Text>
        </View>
        
        {/* Contraindication */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{isTagalog ? 'Kontraindikasyon:' : 'Contraindication:'}</Text>
          <Text style={styles.text}>
            {isTagalog 
              ? 'Maaaring ipagpaliban ang oral prophylaxis sa mga pasyenteng may ilang kondisyong medikal, tulad ng hindi kontroladong sakit sa puso, malalang impeksyon sa paghinga, o matinding impeksyon sa bibig, hanggang sa maayos na mamahala ang kanilang kondisyon. Maaari rin itong i-delay sa mga pasyenteng nangangailangan ng espesyal na clearance sa medisina bago sumailalim sa pagpapagamot sa ngipin.'
              : 'Oral prophylaxis may be postponed in patients with certain medical conditions, such as uncontrolled heart disease, severe respiratory infections, or acute oral infections, until their condition is properly managed. It may also be delayed in patients who require special medical clearance or preventive measures before undergoing dental treatment.'}
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
  title: { fontSize: 28, fontWeight: 'bold', color: '#4A148C' },
  subTitle: { fontSize: 18, color: '#4A148C', marginBottom: 10 },
  userContainer: { width: '100%', padding: 15, backgroundColor: '#FFF', borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#E1BEE7' },
  userLabel: { fontSize: 12, color: '#4A148C', fontWeight: '600' },
  userEmail: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  teethImagesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  teethImage: { width: '32%', height: 80, borderRadius: 10 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, elevation: 3 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  text: { fontSize: 14, color: '#000', marginBottom: 8, lineHeight: 20 }
});