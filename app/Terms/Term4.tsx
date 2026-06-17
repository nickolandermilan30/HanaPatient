import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

export default function Term4() {
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
            <Text style={styles.boldText}>6. User Responsibilities</Text>{'\n'}
            You agree to:{'\n'}
            • Provide truthful and accurate information.{'\n'}
            • Update your information when necessary.{'\n'}
            • Use the application only for lawful purposes.{'\n'}
            • Respect communications from dental clinicians and AMEC personnel.{'\n'}
            • Refrain from providing false, fraudulent, or misleading information.{'\n\n'}
            <Text style={styles.boldText}>7. Treatment Disclaimer</Text>{'\n'}
            HanaPatient serves as a communication and patient management platform only. Registration through the application does not guarantee acceptance for treatment, immediate treatment, or specific dental procedures. Treatment decisions remain subject to clinical evaluation, case suitability, and supervision by qualified dental professionals.
          </Text>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('./Term5')}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Gamitin ang parehong styles object mula sa Term3
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