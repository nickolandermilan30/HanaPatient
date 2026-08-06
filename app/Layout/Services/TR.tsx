import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { auth } from '../../../Firebase/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function TR() {
  const router = useRouter();
  const { language } = useLocalSearchParams(); // Nasasalo ang wika galing sa Dashboard
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
          onPress={() => router.push({ pathname: '/Layout/Apply/TRA', params: { language } })}
        >
          <Text style={styles.topApplyText}>
            {isTagalog ? 'Mag-apply' : 'Apply'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBox}>
          <View style={styles.imageCircle}>
            <Image source={require('../../../Image/restoration.png')} style={styles.headerImage} />
          </View>
          <Text style={styles.title}>
            {isTagalog ? 'Pagpapanumbalik ng Ngipin' : 'Tooth Restoration'}
          </Text>
          <Text style={styles.subTitle}>(Pasta)</Text>
          
          <View style={styles.userContainer}>
            <Text style={styles.userLabel}>
              {isTagalog ? 'Naka-log in bilang:' : 'Logged in as:'}
            </Text>
            <Text style={styles.userEmail}>{userEmail || (isTagalog ? 'Walang user na naka-log in' : 'No user logged in')}</Text>
          </View>
        </View>

        {/* Indication */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>
            {isTagalog ? 'Indikasyon (Kailan kailangan):' : 'Indication:'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Pagkabulok ng ngipin (cavities): ' : '• Dental caries (cavities): '}
            </Text>
            {isTagalog ? 'na nagdulot ng pagkawala ng istruktura ng ngipin.' : 'that have caused loss of tooth structure.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Nabali, napunit, o bitak na mga ngipin ' : '• Fractured, chipped, or cracked teeth '}
            </Text>
            {isTagalog ? 'na nangangailangan ng pagkukumpuni.' : 'requiring repair.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Mga pudpod na ngipin ' : '• Worn teeth '}
            </Text>
            {isTagalog ? 'dahil sa pag-aagnas, pagkiskis, o pagkasira.' : 'due to attrition, abrasion, or erosion.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• May depektong pasta ' : '• Defective or failing restorations '}
            </Text>
            {isTagalog ? 'na kailangang palitan.' : 'that need replacement.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Pagbabago ng kulay ng ngipin o hindi normal na hugis ' : '• Tooth discoloration or shape abnormalities '}
            </Text>
            {isTagalog ? 'na nangangailangan ng pagpapaganda.' : 'requiring esthetic improvement.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Pagkawala ng bahagi ng ngipin ' : '• Loss of tooth structure '}
            </Text>
            {isTagalog ? 'mula sa aksidente o depekto sa pag-unlad.' : 'from trauma or developmental defects.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Mga ngiping sumailalim sa root canal ' : '• Endodontically treated teeth '}
            </Text>
            {isTagalog ? 'na nangangailangan ng pasta upang maibalik ang lakas at gamit nito.' : 'that need restoration to regain strength and function.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Upang maibalik ang tamang paggana at kagat, ' : '• To restore proper function and occlusion, '}
            </Text>
            {isTagalog ? 'at mapabuti ang bisa sa pagnguya.' : 'improving chewing efficiency and comfort.'}
          </Text>
        </View>
        
        {/* Contraindication */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>
            {isTagalog ? 'Kontraindikasyon (Kailan hindi pwede):' : 'Contraindication:'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Matinding pagkasira ng ngipin ' : '• Extensive tooth destruction '}
            </Text>
            {isTagalog ? 'na hindi na kayang suportahan ng simpleng pasta.' : 'that cannot adequately support a restoration.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Malubhang sakit sa gilagid ' : '• Severe periodontal (gum) disease '}
            </Text>
            {isTagalog ? 'na may malalang pag-uga ng ngipin.' : 'with significant tooth mobility.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Hindi nagamot na impeksyon o nana sa ngipin ' : '• Untreated dental infection or abscess '}
            </Text>
            {isTagalog ? 'na kailangang unahing lutasin.' : 'requiring management first.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Patayong bitak sa ugat ng ngipin ' : '• Vertical root fracture '}
            </Text>
            {isTagalog ? 'o istrukturang hindi na maisasalba.' : 'or non-restorable tooth structure.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Mahinang paglilinis sa ngipin at kawalan ng kooperasyon ' : '• Poor oral hygiene and lack of patient cooperation '}
            </Text>
            {isTagalog ? 'na maaaring makasira sa resulta ng pasta.' : 'that may compromise the restoration.'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.boldText}>
              {isTagalog ? '• Kulang na natitirang istruktura ng ngipin ' : '• Insufficient remaining tooth structure '}
            </Text>
            {isTagalog ? 'para sa tamang kapit at suporta.' : 'for proper retention and support.'}
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
  title: { fontSize: 28, fontWeight: 'bold', color: '#4A148C', textAlign: 'center' },
  subTitle: { fontSize: 18, color: '#4A148C', marginBottom: 10 },
  userContainer: { width: '100%', padding: 15, backgroundColor: '#FFF', borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#E1BEE7' },
  userLabel: { fontSize: 12, color: '#4A148C', fontWeight: '600' },
  userEmail: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, elevation: 3 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  text: { fontSize: 14, color: '#000', marginBottom: 8, lineHeight: 20 },
  boldText: { fontWeight: 'bold', color: '#000' }
});