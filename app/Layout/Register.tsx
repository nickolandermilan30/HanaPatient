import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../../Firebase/FirebaseConfig'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', middleName: '', sex: '', age: '',
    dob: new Date(), address: '', contact: '', email: '', occupation: '',
    password: '', confirmPassword: ''
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleInputChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dob: selectedDate });
    }
  };

  const handleRegister = async () => {
    if (Object.values(formData).some(val => val === '')) {
      Alert.alert("Ops!", "Please complete all fields.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await set(ref(db, 'users/' + user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        sex: formData.sex,
        age: formData.age,
        dob: formData.dob.toISOString(),
        address: formData.address,
        contact: formData.contact,
        email: formData.email,
        occupation: formData.occupation
      });

      Alert.alert("Success", "Account created successfully!");
      router.push('/Layout/RegisterFillUp');
    } catch (error: any) {
      Alert.alert("Registration Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Create Account</Text>
          <Text style={styles.subHeaderText}>Join our beautiful community</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <TextInput style={styles.input} placeholder="First Name" onChangeText={(v) => handleInputChange('firstName', v)} />
          <TextInput style={styles.input} placeholder="Middle Name" onChangeText={(v) => handleInputChange('middleName', v)} />
          <TextInput style={styles.input} placeholder="Last Name" onChangeText={(v) => handleInputChange('lastName', v)} />

          <View style={styles.dropdownContainer}>
            <RNPickerSelect 
              onValueChange={(v) => handleInputChange('sex', v)} 
              items={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} 
              placeholder={{ label: 'Select Sex', value: null }} 
            />
          </View>
          
          <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" onChangeText={(v) => handleInputChange('age', v)} />

          {Platform.OS === 'web' ? (
            <input type="date" style={styles.webDateInput} onChange={(e) => handleInputChange('dob', new Date(e.target.value))} />
          ) : (
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={{color: '#666'}}>Date of Birth: {formData.dob.toLocaleDateString()}</Text>
            </TouchableOpacity>
          )}

          {Platform.OS !== 'web' && showDatePicker && (
            <DateTimePicker value={formData.dob} mode="date" display="default" onChange={onDateChange} />
          )}

          <Text style={styles.sectionTitle}>Contact & Security</Text>
          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" onChangeText={(v) => handleInputChange('email', v)} />
          <TextInput style={styles.input} placeholder="Contact Number" keyboardType="phone-pad" onChangeText={(v) => handleInputChange('contact', v)} />
          <TextInput style={styles.input} placeholder="Full Address" onChangeText={(v) => handleInputChange('address', v)} />
          <TextInput style={styles.input} placeholder="Occupation" onChangeText={(v) => handleInputChange('occupation', v)} />
          
          <View style={styles.passwordContainer}>
            <TextInput style={styles.passInput} placeholder="Password" secureTextEntry={!showPass} onChangeText={(v) => handleInputChange('password', v)} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
              <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color="#BA68C8" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput style={styles.passInput} placeholder="Confirm Password" secureTextEntry={!showConfirmPass} onChangeText={(v) => handleInputChange('confirmPassword', v)} />
            <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPass ? "eye-off" : "eye"} size={20} color="#BA68C8" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.nextButton} onPress={handleRegister}>
            <Text style={styles.nextButtonText}>Next Step</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginRedirect} onPress={() => router.push('/Layout/Login')}>
            <Text style={styles.loginRedirectText}>I already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#BA68C8' },
  scrollContent: { paddingBottom: 50 },
  header: { padding: 40, paddingTop: 60, alignItems: 'center' },
  headerText: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  subHeaderText: { color: '#F3E5F5', marginTop: 5 },
  card: { backgroundColor: '#FFF', marginHorizontal: 20, padding: 20, borderRadius: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#7B1FA2', marginBottom: 15, marginTop: 10 },
  input: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E1BEE7' },
  webDateInput: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E1BEE7', width: '100%' },
  dropdownContainer: { backgroundColor: '#F9F9F9', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E1BEE7', paddingHorizontal: 10 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E1BEE7' },
  passInput: { flex: 1, padding: 15 },
  eyeIcon: { paddingRight: 15 },
  nextButton: { backgroundColor: '#BA68C8', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  loginRedirect: { marginTop: 20, alignItems: 'center' },
  loginRedirectText: { color: '#7B1FA2', fontWeight: '600', textDecorationLine: 'underline' }
});