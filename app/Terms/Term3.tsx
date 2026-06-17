import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

export default function Term3() {
  const router = useRouter();

  return (
    <View style={styles.modalContainer}>
      <View style={styles.card}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image 
            source={require('../../Image/Logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Terms & Conditions</Text>
          
          <Text style={styles.description}>
            <Text style={styles.boldText}>4. Information Collection and Use</Text>{'\n'}
            By using HanaPatient, you consent to the collection, storage, and processing of information that may include: Full name, Age and sex, Contact information, Birthday, Address, Contact Number.{'\n\n'}
            This information will be used solely for:{'\n'}
            • Patient screening and case matching{'\n'}
            • Appointment scheduling and management{'\n'}
            • Communication regarding treatment{'\n'}
            • Clinical and educational requirements of dental clinicians{'\n'}
            • Record keeping and case monitoring{'\n\n'}
            <Text style={styles.boldText}>5. Privacy and Confidentiality</Text>{'\n'}
            Your privacy is important to us. All information submitted through HanaPatient shall be treated as confidential and protected in accordance with applicable data privacy laws. Your personal information will only be accessible to:{'\n'}
            • Authorized Doctor of Dental Medicine clinicians of Ago Medical and Educational Center (AMEC){'\n'}
            • Authorized faculty supervisors and administrators directly involved in patient management and clinical supervision{'\n\n'}
            Your information will not be sold, rented, shared, or disclosed to unauthorized third parties without your consent, except as required by law. While we strive to maintain the security of all information, no electronic system can guarantee absolute security. By using the application, you acknowledge and accept this inherent risk. The App will be strictly ruled out by RA10173 or the Data Privacy Act of 2012.
          </Text>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('./Term4')}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  card: { width: '100%', maxHeight: '85%', backgroundColor: '#FFFFFF', borderRadius: 25, padding: 30, alignItems: 'center', elevation: 5 },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4A148C', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 16, color: '#333', textAlign: 'left', lineHeight: 24 },
  boldText: { fontWeight: 'bold', color: '#000' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  navButton: { paddingVertical: 10 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#6A1B9A' },
});