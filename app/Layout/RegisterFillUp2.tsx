import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  Platform, StatusBar, Alert, BackHandler, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '../../Firebase/FirebaseConfig'; 
import { update, ref } from 'firebase/database';

export default function RegisterFillUp2() {
  const router = useRouter();
  const user = auth.currentUser;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [conditions, setConditions] = useState<Record<string, boolean>>({});
  const [othersText, setOthersText] = useState('');

  useEffect(() => {
    const backAction = () => {
      setModalVisible(true);
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const medicalList: string[] = [
    "High Blood Pressure", "Low Blood Pressure", "Epilepsy Convulsions",
    "AIDS or HIV Infection", "Sexually Transmitted Disease", "Stomach Troubles Ulcers",
    "Fainting Seizure", "Rapid Weight Loss", "Radiation Therapy",
    "Joint Replacement Implants", "Heart Surgery", "Thyroid Problem",
    "Heart Disease", "Heart Murmur", "Hepatitis Liver Disease",
    "Rheumatic Fever", "Hay Fever Allergies", "Respiratory Problems",
    "Hepatitis Jaundice", "Tuberculosis", "Swollen ankles",
    "Kidney Disease", "Diabetes", "Chest Pain", "Stroke",
    "Cancer Tumors", "Anemia", "Angina", "Asthma",
    "Emphysema", "Bleeding Problems", "Blood Diseases",
    "Head Injuries", "Arthritis Rheumatism", "None"
  ];

  const toggleCondition = (item: string) => {
    if (item === "None") {
      // Kung pinili ang "None", i-reset lahat at i-true lang ang None
      const resetState: Record<string, boolean> = {};
      medicalList.forEach(cond => { resetState[cond] = cond === "None" ? !conditions["None"] : false; });
      setConditions(resetState);
    } else {
      // Kung ibang item, i-toggle ito at siguraduhing false ang "None"
      setConditions(prev => ({ 
        ...prev, 
        [item]: !prev[item],
        "None": false 
      }));
    }
  };

  const handleFinalSubmit = async () => {
    if (!user) return;

    try {
      const selectedConditions: Record<string, boolean> = {};
      Object.keys(conditions).forEach(key => {
        if (conditions[key] === true) {
          const safeKey = key.replace(/[/#.$[\]]/g, "_");
          selectedConditions[safeKey] = true;
        }
      });

      await update(ref(db, 'users/' + user.uid), {
        medicalHistoryPart2: {
          conditions: selectedConditions,
          others: othersText
        }
      });
      Alert.alert("Success", "Account created successfully!");
      router.replace('/Layout/Home'); 
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F3E5F5' }}>
      <StatusBar barStyle="light-content" />

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="alert-circle" size={50} color="#D32F2F" />
            <Text style={styles.modalTitle}>Incomplete Record</Text>
            <Text style={styles.modalText}>
              Mahalaga ang medical history para sa iyong serbisyo. Hindi namin mapoproseso ang iyong request kung hindi mo ito itatapos.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Continue Filling Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medical History</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.questionText}>13. Do you have or have you had any of the following? (Check which apply)</Text>
          
          {medicalList.map((item) => (
            <TouchableOpacity key={item} style={styles.checkboxItem} onPress={() => toggleCondition(item)}>
              <Ionicons 
                name={conditions[item] ? "checkbox" : "square-outline"} 
                size={24} 
                color={conditions[item] ? "#7B1FA2" : "#999"} 
              />
              <Text style={[styles.checkText, conditions[item] && {fontWeight: 'bold', color: '#7B1FA2'}]}>{item}</Text>
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
    paddingHorizontal: 30, paddingBottom: 20, backgroundColor: '#BA68C8', 
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 20,
    paddingTop: Platform.OS === "android" ? 40 : 50, marginTop: -20
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  card: { backgroundColor: '#FFF', marginHorizontal: 20, padding: 20, borderRadius: 20, elevation: 3, marginBottom: 20 },
  questionText: { fontSize: 16, fontWeight: 'bold', color: '#4A148C', marginBottom: 15 },
  checkboxItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  checkText: { marginLeft: 10, color: '#333', fontSize: 15 },
  input: { borderBottomWidth: 1, borderColor: '#BA68C8', marginTop: 15, padding: 5 },
  submitButton: { backgroundColor: '#7B1FA2', margin: 20, padding: 20, borderRadius: 20, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', padding: 30, borderRadius: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A148C', marginVertical: 15 },
  modalText: { textAlign: 'center', color: '#666', marginBottom: 20, lineHeight: 22 },
  modalButton: { backgroundColor: '#4A148C', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 15 },
  modalButtonText: { color: '#FFF', fontWeight: 'bold' }
});