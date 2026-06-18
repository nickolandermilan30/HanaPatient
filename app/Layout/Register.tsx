import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../../Firebase/FirebaseConfig'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';

export default function Register() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width > 600;

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
        ...formData,
        dob: formData.dob.toISOString()
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
          <Text style={styles.subHeaderText}>Join our community today</Text>
        </View>
        
        <View style={[styles.card, { width: isLargeScreen ? '50%' : '90%' }]}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 2 }]} placeholder="First Name" onChangeText={(v) => handleInputChange('firstName', v)} />
            <TextInput style={[styles.input, { flex: 1, marginLeft: 10 }]} placeholder="M.I." onChangeText={(v) => handleInputChange('middleName', v)} />
          </View>
          <TextInput style={styles.input} placeholder="Last Name" onChangeText={(v) => handleInputChange('lastName', v)} />

          <View style={styles.row}>
            <View style={[styles.dropdownContainer, { flex: 2 }]}>
              <RNPickerSelect 
                onValueChange={(v) => handleInputChange('sex', v)} 
                items={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} 
                placeholder={{ label: 'Sex', value: null }} 
              />
            </View>
            <TextInput style={[styles.input, { flex: 1, marginLeft: 10 }]} placeholder="Age" keyboardType="numeric" onChangeText={(v) => handleInputChange('age', v)} />
          </View>

          {isWeb ? (
            <input type="date" style={styles.webDateInput} onChange={(e) => handleInputChange('dob', new Date(e.target.value))} />
          ) : (
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={{color: '#666'}}>Birthdate: {formData.dob.toLocaleDateString()}</Text>
            </TouchableOpacity>
          )}

          {!isWeb && showDatePicker && (
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
            <Text style={styles.nextButtonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginRedirect} onPress={() => router.push('/Layout/Login')}>
            <Text style={styles.loginRedirectText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#BA68C8' },
  scrollContent: { alignItems: 'center', paddingBottom: 50 },
  header: { paddingVertical: 40, alignItems: 'center' },
  headerText: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  subHeaderText: { color: '#F3E5F5', marginTop: 5 },
  card: { backgroundColor: '#FFF', padding: 30, borderRadius: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#7B1FA2', marginBottom: 15, marginTop: 10 },
  input: { backgroundColor: '#F9F9F9', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  webDateInput: { backgroundColor: '#F9F9F9', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EEE', width: '100%', fontSize: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  passInput: { flex: 1, padding: 14 },
  eyeIcon: { paddingRight: 15 },
  row: { flexDirection: 'row', alignItems: 'center' },
  dropdownContainer: { backgroundColor: '#F9F9F9', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EEE', justifyContent: 'center' },
  nextButton: { backgroundColor: '#7B1FA2', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  loginRedirect: { marginTop: 15, alignItems: 'center' },
  loginRedirectText: { color: '#7B1FA2', fontWeight: '600' }
});