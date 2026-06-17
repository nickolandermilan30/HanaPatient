import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { auth } from '../../../Firebase/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TR() {
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
        <TouchableOpacity style={styles.topApplyButton}>
          <Text style={styles.topApplyText}>Apply</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBox}>
          <View style={styles.imageCircle}>
            <Image source={require('../../../Image/restoration.png')} style={styles.headerImage} />
          </View>
          <Text style={styles.title}>Tooth Restoration</Text>
          <Text style={styles.subTitle}>(Pasta)</Text>
          
          <View style={styles.userContainer}>
            <Text style={styles.userLabel}>Logged in as:</Text>
            <Text style={styles.userEmail}>{userEmail || 'No user logged in'}</Text>
          </View>
        </View>

        {/* Indication */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Indication:</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Dental caries (cavities): </Text>that have caused loss of tooth structure.</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Fractured, chipped, or cracked teeth </Text>requiring repair.</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Worn teeth </Text>due to attrition, abrasion, or erosion.</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Defective or failing restorations </Text>that need replacement.</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Tooth discoloration or shape abnormalities </Text>requiring esthetic improvement.</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Loss of tooth structure </Text>from trauma or developmental defects.</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Endodontically treated teeth </Text>that need restoration to regain strength and function.</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• To restore proper function and occlusion, </Text>improving chewing efficiency and comfort.</Text>
        </View>
        
        {/* Contraindication */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Contraindication:</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Extensive tooth destruction </Text>that cannot adequately support a restoration.</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Severe periodontal (gum) disease </Text>with significant tooth mobility.</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Untreated dental infection or abscess </Text>requiring management first.</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Vertical root fracture </Text>or non-restorable tooth structure.</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Poor oral hygiene and lack of patient cooperation </Text>that may compromise the restoration.</Text>
          <Text style={styles.text}><Text style={styles.boldText}>• Insufficient remaining tooth structure </Text>for proper retention and support.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 10 },
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