import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { auth } from '../../../Firebase/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function TE() {
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
          onPress={() => router.push({ pathname: '/Layout/Apply/TEA', params: { language } })}
        >
          <Text style={styles.topApplyText}>{isTagalog ? 'Mag-apply' : 'Apply'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBox}>
          <View style={styles.imageCircle}>
            <Image source={require('../../../Image/extraction.png')} style={styles.headerImage} />
          </View>
          <Text style={styles.title}>
            {isTagalog ? 'Pagbunot ng Ngipin' : 'Tooth Extraction'}
          </Text>
          <Text style={styles.subTitle}>(Bunot)</Text>
          
          <View style={styles.userContainer}>
            <Text style={styles.userLabel}>
              {isTagalog ? 'Naka-log in bilang:' : 'Logged in as:'}
            </Text>
            <Text style={styles.userEmail}>{userEmail || (isTagalog ? 'Walang naka-log in na user' : 'No user logged in')}</Text>
          </View>
        </View>

        {/* Indication */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{isTagalog ? 'Indikasyon (Indication):' : 'Indication:'}</Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Malubhang Pagkabulok ng Ngipin: ' : '• Severe Tooth Decay: '}
            </Text>
            {isTagalog 
              ? 'Malawak na pagkabulok o sira na nag-iiwan ng napakaliit na malusog na istruktura ng ngipin upang suportahan ang pasta o korona.' 
              : 'Extensive decay or caries that leaves too little healthy tooth structure to support a filling or crown.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Advanced Periodontal Disease: ' : '• Advanced Periodontal Disease: '}
            </Text>
            {isTagalog 
              ? 'Matinding pagkawala ng buto at pagkasira ng tissue na nagiging sanhi ng labis na paggalaw ng ngipin.' 
              : 'Severe bone loss and tissue destruction that makes a tooth excessively mobile.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Trauma: ' : '• Trauma: '}
            </Text>
            {isTagalog 
              ? 'Mga hindi na maisasaayos na bali sa korona-ugat o patayong bali sa ugat.' 
              : 'Irreparable crown-root fractures or vertical root fractures.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Impacted o Masikip na Ngipin: ' : '• Impacted or Crowded Tooth: '}
            </Text>
            {isTagalog 
              ? 'Mga wisdom teeth na bahagyang sumulpot o naka-impact.' 
              : 'Wisdom teeth that are partially erupted or impacted.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Patuloy na Impeksyon: ' : '• Persistent Infection: '}
            </Text>
            {isTagalog 
              ? 'Mga ngiping may malalim na problema sa pulpa o periapical pathology.' 
              : 'Teeth with deep pulpal or periapical pathology.'}
          </Text>
        </View>
        
        {/* Contraindication */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{isTagalog ? 'Kontraindikasyon (Contraindication):' : 'Contraindication:'}</Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Hindi Kontroladong Kondisyong Medikal: ' : '• Uncontrolled Medical Conditions: '}
            </Text>
            {isTagalog ? 'Diabetes, leukemia, malubhang sakit sa puso.' : 'Diabetes, leukemia, severe heart disease.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Malubhang Altapresyon: ' : '• Severe Hypertension: '}
            </Text>
            {isTagalog ? 'Presyon ng dugo na higit sa 180/110 mmHg.' : 'Blood pressure above 180/110 mmHg.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Mga Karamdaman sa Pagdurugo: ' : '• Bleeding Disorders: '}
            </Text>
            {isTagalog ? 'Mga kondisyong nangangailangan ng anticoagulant therapy.' : 'Conditions requiring anticoagulant therapy.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Mahinang Immune System at Bagong Radiation: ' : '• Immunosuppression & Recent Radiation: '}
            </Text>
            {isTagalog ? 'Mataas na panganib ng mabagal na paggaling.' : 'High risk of delayed healing.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Pagbubuntis: ' : '• Pregnancy: '}
            </Text>
            {isTagalog ? 'Kadalasan ay iniiwasan sa una at ikatlong trimester.' : 'Generally avoided in first and third trimesters.'}
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
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, elevation: 3 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  text: { fontSize: 14, color: '#000', marginBottom: 8, lineHeight: 20 },
  boldText: { fontWeight: 'bold', color: '#000' }
});