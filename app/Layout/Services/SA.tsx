import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { auth } from '../../../Firebase/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SA() {
  const router = useRouter();
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
         onPress={() => router.push('/Layout/Apply/SAA')}
       >
         <Text style={styles.topApplyText}>Apply</Text>
       </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBox}>
          <View style={styles.imageCircle}>
            <Image source={require('../../../Image/sealant.png')} style={styles.headerImage} />
          </View>
          <Text style={styles.title}>Tooth Sealants</Text>
          <Text style={styles.subTitle}>(Proteksyon sa hukay ng ngipin)</Text>
          
          <View style={styles.userContainer}>
            <Text style={styles.userLabel}>Logged in as:</Text>
            <Text style={styles.userEmail}>{userEmail || 'No user logged in'}</Text>
          </View>
        </View>

        {/* Sealants Image Section */}
        <View style={styles.singleImageContainer}>
          <Image source={require('../../../assets/Teeth/Broken.png')} style={styles.singleImage} resizeMode="contain" />
        </View>

        {/* Indication */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Indication:</Text>
          <Text style={styles.text}>
            Tooth sealants are indicated for children, adolescents, and adults who are at risk of developing cavities, especially on the chewing surfaces of the back teeth. 
            They are recommended for teeth with deep pits and grooves where food and bacteria can easily accumulate, helping to prevent tooth decay and maintain good oral health.
          </Text>
        </View>
        
        {/* Contraindication */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Contraindication:</Text>
          <Text style={styles.text}>
            Tooth sealants are contraindicated for teeth that already have cavities or existing restorations on the chewing surface. 
            They may also not be recommended for teeth with shallow pits and grooves that can be easily cleaned through regular brushing and good oral hygiene practices.
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
  singleImage: { width: '100%', height: 150 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, elevation: 3 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  text: { fontSize: 14, color: '#000', marginBottom: 8, lineHeight: 20 }
});