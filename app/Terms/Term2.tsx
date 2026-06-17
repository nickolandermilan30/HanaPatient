import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

export default function Term2() {
  const router = useRouter();

  return (
    <View style={styles.modalContainer}>
      <View style={styles.card}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <Image 
            source={require('../../Image/Logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Terms & Conditions</Text>
          
          <Text style={styles.description}>
            Welcome to HanaPatient. By creating an account, accessing, or using the HanaPatient application, 
            you agree to be bound by these Terms and Conditions. If you do not agree with any part of these 
            Terms, please do not use the application.
            {'\n\n'}
            <Text style={styles.boldText}>1. Acceptance of Terms</Text>{'\n'}
            By registering for and using HanaPatient, you confirm that you have read, understood, and 
            agreed to comply with these Terms and Conditions and all applicable laws and regulations.
            {'\n\n'}
            <Text style={styles.boldText}>2. Eligibility</Text>{'\n'}
            You must provide accurate, complete, and current information when registering for an account. 
            HanaPatient reserves the right to suspend or terminate accounts containing false or misleading information.
            {'\n\n'}
            <Text style={styles.boldText}>3. Patient Commitment</Text>{'\n'}
            By registering with HanaPatient, you acknowledge and agree that:{'\n'}
            • You are voluntarily seeking dental services through the application.{'\n'}
            • You are willing to cooperate with your assigned dental clinician throughout the treatment process.{'\n'}
            • Certain dental procedures may require multiple visits and follow-up appointments.{'\n'}
            • You commit to attending scheduled appointments and completing the required treatment plan whenever reasonably possible.{'\n'}
            • Failure to attend appointments without prior notice may affect your eligibility for future treatment scheduling through the platform.
          </Text>
        </ScrollView>

        {/* Inayos na Button Container */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('./Term3')}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A148C',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    lineHeight: 24,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
});