import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// I-import ang auth at db mula sa iyong config
import { auth, db } from '../../Firebase/FirebaseConfig'; 
import { update, ref } from 'firebase/database';

export default function RegisterFillUp() {
  const router = useRouter();
  const user = auth.currentUser; // Kukunin ang kasalukuyang naka-log in na user
  
  const [formData, setFormData] = useState<any>({
    health: null, medicalTreatment: null, medicalTreatmentDetail: '',
    seriousIllness: null, seriousIllnessDetail: '', hospitalized: null, 
    hospitalizedDetail: '', medication: null, medicationDetail: '',
    smoking: null, drugs: null,
    allergies: { 
      'Local Anesthetic': false, 'Penicillin': false, 'Antibiotics': false, 
      'Latex': false, 'Sulfa Drugs': false, 'Aspirin': false, 'Others': false 
    },
    othersDetail: '',
    womenInfo: { pregnant: null, nursing: null, birthControl: null },
    bloodType: null
  });

  const toggleAllergy = (key: string) => {
    setFormData((prev: any) => ({
      ...prev,
      allergies: { ...prev.allergies, [key]: !prev.allergies[key] }
    }));
  };

  const handleSaveMedicalHistory = async () => {
    if (!user) {
      Alert.alert("Error", "No user found. Please register first.");
      return;
    }

    try {
      // I-update ang record sa Firebase Database sa ilalim ng user UID
      await update(ref(db, 'users/' + user.uid), {
        medicalHistory: formData
      });

      Alert.alert("Success", "Medical history saved!");
      router.push('/Layout/RegisterFillUp2'); // Sunod na step
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const renderYesNo = (key: string, label: string, detailKey?: string) => (
    <View style={styles.card}>
      <Text style={styles.questionText}>{label}</Text>
      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.option, formData[key] === true && styles.selectedYes]} 
          onPress={() => setFormData({...formData, [key]: true})}
        >
          <Text style={[styles.optText, formData[key] === true && {color: '#FFF'}]}>YES</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.option, formData[key] === false && styles.selectedNo]} 
          onPress={() => setFormData({...formData, [key]: false})}
        >
          <Text style={[styles.optText, formData[key] === false && {color: '#FFF'}]}>NO</Text>
        </TouchableOpacity>
      </View>
      {formData[key] === true && detailKey && (
        <TextInput 
          style={styles.input} 
          placeholder="Please specify..." 
          onChangeText={(v) => setFormData({...formData, [detailKey]: v})} 
        />
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F3E5F5' }}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medical History</Text>
          <Text style={styles.subHeader}>Please fill out the form honestly</Text>
        </View>

        {renderYesNo('health', '1. Are you in good health?', '')}
        {renderYesNo('medicalTreatment', '2. Are you under medical treatment?', 'medicalTreatmentDetail')}
        {renderYesNo('seriousIllness', '3. Have you ever had serious illnesses or surgical operation?', 'seriousIllnessDetail')}
        {renderYesNo('hospitalized', '4. Have you ever been hospitalized?', 'hospitalizedDetail')}
        {renderYesNo('medication', '5. Are you taking any prescription/non-prescription medication?', 'medicationDetail')}
        {renderYesNo('smoking', '6. Do you smoke?')}
        {renderYesNo('drugs', '7. Do you use alcohol, cocaine, or other dangerous drugs?')}

        <View style={styles.card}>
          <Text style={styles.questionText}>8. Are you allergic to any of the following:</Text>
          {Object.keys(formData.allergies).map((item) => (
            <TouchableOpacity key={item} style={styles.checkboxItem} onPress={() => toggleAllergy(item)}>
              <Ionicons name={formData.allergies[item] ? "checkbox" : "square-outline"} size={24} color="#7B1FA2" />
              <Text style={styles.checkText}>{item}</Text>
            </TouchableOpacity>
          ))}
          {formData.allergies['Others'] && (
            <TextInput 
              style={styles.input} 
              placeholder="Please specify others..." 
              onChangeText={(v) => setFormData({...formData, othersDetail: v})} 
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>9. For women only:</Text>
          {/* Note: Inayos ko ang pag-handle ng nested state */}
          <TouchableOpacity onPress={() => setFormData({...formData, womenInfo: {...formData.womenInfo, pregnant: !formData.womenInfo.pregnant}})}>
            <Text>Pregnant: {formData.womenInfo.pregnant ? 'Yes' : 'No'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSaveMedicalHistory}>
          <Text style={styles.submitText}>Save & Next</Text>
        </TouchableOpacity>
        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Panatilihin ang iyong existing styles)
  header: { paddingHorizontal: 30, paddingBottom: 20, backgroundColor: '#BA68C8', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 10, paddingTop: 50 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  subHeader: { color: '#E1BEE7' },
  card: { backgroundColor: '#FFF', marginHorizontal: 20, padding: 20, borderRadius: 20, marginBottom: 15, elevation: 3 },
  questionText: { fontSize: 16, fontWeight: '600', color: '#4A148C', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  option: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center' },
  selectedYes: { backgroundColor: '#66BB6A' },
  selectedNo: { backgroundColor: '#EF5350' },
  optText: { fontWeight: 'bold' },
  input: { borderBottomWidth: 1, borderBottomColor: '#BA68C8', marginTop: 10, paddingVertical: 5 },
  checkboxItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  checkText: { marginLeft: 10, color: '#333' },
  submitButton: { backgroundColor: '#7B1FA2', margin: 20, padding: 20, borderRadius: 20, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});