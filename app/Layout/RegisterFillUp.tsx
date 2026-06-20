import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, BackHandler, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '../../Firebase/FirebaseConfig'; 
import { update, ref } from 'firebase/database';

export default function RegisterFillUp() {
  const router = useRouter();
  const user = auth.currentUser;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<any>({
    health: null, medicalTreatment: null, medicalTreatmentDetail: '',
    seriousIllness: null, seriousIllnessDetail: '', hospitalized: null, 
    hospitalizedDetail: '', medication: null, medicationDetail: '',
    smoking: null, drugs: null,
    allergies: { 
      'Local Anesthetic': false, 'Penicillin': false, 'Antibiotics': false, 
      'Latex': false, 'Sulfa Drugs': false, 'Aspirin': false, 'Others': false, 'None': false 
    },
    othersDetail: '',
    womenInfo: { pregnant: null },
    bloodType: null
  });

  useEffect(() => {
    const backAction = () => {
      setModalVisible(true);
      return true; 
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const handleAllergyToggle = (item: string) => {
    const currentAllergies = { ...formData.allergies };

    if (item === 'None') {
      // Kung pinili ang 'None', i-reset lahat sa false at i-true lang ang 'None'
      const resetAllergies = Object.keys(currentAllergies).reduce((acc: any, key) => {
        acc[key] = key === 'None' ? !currentAllergies['None'] : false;
        return acc;
      }, {});
      setFormData({...formData, allergies: resetAllergies});
    } else {
      // Kung ibang allergy, i-toggle ito at siguraduhing false ang 'None'
      currentAllergies[item] = !currentAllergies[item];
      currentAllergies['None'] = false; 
      setFormData({...formData, allergies: currentAllergies});
    }
  };

  const handleSaveMedicalHistory = async () => {
    if (!user) return;
    try {
      await update(ref(db, 'users/' + user.uid), { medicalHistory: formData });
      router.push('/Layout/RegisterFillUp2');
    } catch (error: any) {
      console.error(error);
    }
  };

  const renderYesNo = (key: string, label: string, detailKey?: string, isNested?: boolean, parentKey?: string) => {
    const val = isNested ? formData[parentKey!][key] : formData[key];
    const setVal = (value: boolean) => {
      if (isNested) setFormData({...formData, [parentKey!]: {...formData[parentKey!], [key]: value}});
      else setFormData({...formData, [key]: value});
    };

    return (
      <View style={styles.card}>
        <Text style={styles.questionText}>{label}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.option, val === true && styles.selectedYes]} onPress={() => setVal(true)}>
            <Text style={[styles.optText, val === true && {color: '#FFF'}]}>YES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.option, val === false && styles.selectedNo]} onPress={() => setVal(false)}>
            <Text style={[styles.optText, val === false && {color: '#FFF'}]}>NO</Text>
          </TouchableOpacity>
        </View>
        {val === true && detailKey && (
          <TextInput style={styles.input} placeholder="Please specify..." onChangeText={(v) => setFormData({...formData, [detailKey]: v})} />
        )}
      </View>
    );
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medical History</Text>
          <Text style={styles.subHeader}>Please fill out the form honestly</Text>
        </View>

        {renderYesNo('health', '1. Are you in good health?')}
        {renderYesNo('medicalTreatment', '2. Are you under medical treatment?', 'medicalTreatmentDetail')}
        {renderYesNo('seriousIllness', '3. Have you ever had serious illnesses or surgical operation?', 'seriousIllnessDetail')}
        {renderYesNo('hospitalized', '4. Have you ever been hospitalized?', 'hospitalizedDetail')}
        {renderYesNo('medication', '5. Are you taking any prescription/non-prescription medication?', 'medicationDetail')}
        {renderYesNo('smoking', '6. Do you smoke?')}
        {renderYesNo('drugs', '7. Do you use alcohol, cocaine, or other dangerous drugs?')}

        <Text style={styles.sectionTitle}>8. For women only:</Text>
        {renderYesNo('pregnant', 'Are you pregnant?', '', true, 'womenInfo')}

        <View style={styles.card}>
          <Text style={styles.questionText}>9. Are you allergic to any of the following:</Text>
          {Object.keys(formData.allergies).map((item) => (
            <TouchableOpacity key={item} style={styles.checkboxItem} onPress={() => handleAllergyToggle(item)}>
              <Ionicons name={formData.allergies[item] ? "checkbox" : "square-outline"} size={24} color={formData.allergies[item] ? "#7B1FA2" : "#999"} />
              <Text style={[styles.checkText, formData.allergies[item] && {fontWeight: 'bold', color: '#7B1FA2'}]}>{item}</Text>
            </TouchableOpacity>
          ))}
          {formData.allergies['Others'] && (
            <TextInput style={styles.input} placeholder="Specify other allergies..." onChangeText={(v) => setFormData({...formData, othersDetail: v})} />
          )}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSaveMedicalHistory}>
          <Text style={styles.submitText}>Save & Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 30, paddingBottom: 20, backgroundColor: '#BA68C8', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 10, paddingTop: 50 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  subHeader: { color: '#E1BEE7' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A148C', marginHorizontal: 20, marginBottom: 10 },
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
  submitText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', padding: 30, borderRadius: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A148C', marginVertical: 15 },
  modalText: { textAlign: 'center', color: '#666', marginBottom: 20, lineHeight: 22 },
  modalButton: { backgroundColor: '#4A148C', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 15 },
  modalButtonText: { color: '#FFF', fontWeight: 'bold' }
});