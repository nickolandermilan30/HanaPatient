import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Platform, 
  StatusBar,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// Import Firebase - ayusin ang path depende kung nasaan ang folder mo
import { auth, db } from '../../Firebase/FirebaseConfig'; 
import { update, ref } from 'firebase/database';

export default function RegisterFillUp2() {
  const router = useRouter();
  const user = auth.currentUser;
  
  const [conditions, setConditions] = useState<Record<string, boolean>>({});
  const [othersText, setOthersText] = useState('');

  const medicalList: string[] = [
    "High Blood Pressure", "Low Blood Pressure", "Epilepsy/ Convulsions",
    "AIDS or HIV Infection", "Sexually Transmitted Disease", "Stomach Troubles/ Ulcers",
    "Fainting Seizure", "Rapid Weight Loss", "Radiation Therapy",
    "Joint Replacement / Implants", "Heart Surgery", "Thyroid Problem",
    "Heart Disease", "Heart Murmur", "Hepatitis / Liver Disease",
    "Rheumatic Fever", "Hay Fever / Allergies", "Respiratory Problems",
    "Hepatitis / Jaundice", "Tuberculosis", "Swollen ankles",
    "Kidney Disease", "Diabetes", "Chest Pain", "Stroke",
    "Cancer/ Tumors", "Anemia", "Angina", "Asthma",
    "Emphysema", "Bleeding Problems", "Blood Diseases",
    "Head Injuries", "Arthritis / Rheumatism"
  ];

  const toggleCondition = (item: string) => {
    setConditions(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleFinalSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "User session not found.");
      return;
    }

    try {
      // I-save ang mga napiling conditions at ang "Others" text sa Firebase
      await update(ref(db, 'users/' + user.uid), {
        medicalHistoryPart2: {
          conditions: conditions,
          others: othersText
        }
      });

      Alert.alert("Success", "Account created successfully!");
      // I-redirect ang user sa Home screen
      router.replace('/Layout/Home'); 
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F3E5F5' }}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medical History (Part 2)</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.questionText}>13. Do you have or have you had any of the following? (Check which apply)</Text>
          
          {medicalList.map((item) => (
            <TouchableOpacity key={item} style={styles.checkboxItem} onPress={() => toggleCondition(item)}>
              <Ionicons 
                name={conditions[item] ? "checkbox" : "square-outline"} 
                size={24} 
                color="#7B1FA2" 
              />
              <Text style={styles.checkText}>{item}</Text>
            </TouchableOpacity>
          ))}

          <TextInput 
            style={styles.input} 
            placeholder="Others (Please specify)" 
            value={othersText}
            onChangeText={setOthersText}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleFinalSubmit}>
          <Text style={styles.submitText}>Submit to Create Account</Text>
        </TouchableOpacity>
        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 30, 
    paddingBottom: 20, 
    backgroundColor: '#BA68C8', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30, 
    marginBottom: 20,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 20) + 10 : 50 
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  card: { backgroundColor: '#FFF', marginHorizontal: 20, padding: 20, borderRadius: 20, elevation: 3, marginBottom: 20 },
  questionText: { fontSize: 16, fontWeight: 'bold', color: '#4A148C', marginBottom: 15 },
  checkboxItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  checkText: { marginLeft: 10, color: '#333', fontSize: 15 },
  input: { borderBottomWidth: 1, borderColor: '#BA68C8', marginTop: 15, padding: 5 },
  submitButton: { backgroundColor: '#7B1FA2', margin: 20, padding: 20, borderRadius: 20, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});