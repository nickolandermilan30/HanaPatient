import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, TextInput } from 'react-native';
import { auth, db } from '../../../Firebase/FirebaseConfig';
import { ref, push, set } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function CDA() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  // States para sa mga input
  const [visiting, setVisiting] = useState<string | null>(null);
  const [phoneOwner, setPhoneOwner] = useState<string | null>(null);
  const [fbName, setFbName] = useState('');
  const [selectedSample, setSelectedSample] = useState<string | null>(null); // State para sa napiling sample picture

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserEmail(user.email);
  }, []);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...prev, ...uris]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!visiting || !phoneOwner || !selectedSample) { 
      Alert.alert("Error", "Please answer all questions and select a sample picture."); 
      return; 
    }
    if (selectedImages.length === 0) { Alert.alert("Error", "Please attach at least one image."); return; }

    setLoading(true);
    try {
      const dbRef = ref(db, 'Tooth concern');
      const newRequestRef = push(dbRef);
      
      await set(newRequestRef, {
        user: userEmail,
        type: "Complete Denture Application",
        visiting3to4Times: visiting,
        phoneOwner: phoneOwner,
        relativeFbName: fbName,
        selectedDentureType: selectedSample, // Dito mai-save kung Upper o Lower ang pinili
        imageUris: selectedImages,
        timestamp: new Date().toISOString()
      });

      Alert.alert("Success", "Application Submitted!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to submit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#4A148C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Denture</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.userContainer}>
          <Text style={styles.userLabel}>Logged in as:</Text>
          <Text style={styles.userEmail}>{userEmail || 'No user logged in'}</Text>
        </View>

        <Text style={styles.questionText}>Are you willing to come for 3-4 visits?</Text>
        <View style={styles.buttonRow}>
          {['YES', 'NO'].map(opt => (
            <TouchableOpacity key={opt} style={[styles.choiceBtn, visiting === opt && styles.selected]} onPress={() => setVisiting(opt)}>
              <Text style={[styles.choiceText, visiting === opt && {color: '#FFF'}]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.questionText}>Whose phone are you using right now?</Text>
        <View style={styles.buttonRow}>
          {['Mine', 'Relative\'s'].map(opt => (
            <TouchableOpacity key={opt} style={[styles.choiceBtn, phoneOwner === opt && styles.selected]} onPress={() => setPhoneOwner(opt)}>
              <Text style={[styles.choiceText, phoneOwner === opt && {color: '#FFF'}]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput style={styles.input} placeholder="Relative's Facebook Name" value={fbName} onChangeText={setFbName} />

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Select Denture Type:</Text>
          <View style={styles.sampleContainer}>
            <TouchableOpacity onPress={() => setSelectedSample('Upper')} style={[styles.sampleTouch, selectedSample === 'Upper' && styles.selectedSample]}>
                <Image source={require('../../../assets/CD Apply/Upper.png')} style={styles.sampleImg} />
                <Text style={styles.labelSmall}>Upper</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedSample('Lower')} style={[styles.sampleTouch, selectedSample === 'Lower' && styles.selectedSample]}>
                <Image source={require('../../../assets/CD Apply/Lower.png')} style={styles.sampleImg} />
                <Text style={styles.labelSmall}>Lower</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Attach Images:</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickImages}>
            <Ionicons name="camera" size={30} color="#4A148C" />
            <Text style={styles.uploadText}>Tap to add photos</Text>
          </TouchableOpacity>
          
          <ScrollView horizontal style={styles.imagePreviewList}>
            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.previewContainer}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Complete Application</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A148C' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  userContainer: { padding: 15, backgroundColor: '#FFF', borderRadius: 15, marginBottom: 20, alignItems: 'center' },
  userLabel: { fontSize: 12, color: '#4A148C' },
  userEmail: { fontSize: 16, fontWeight: 'bold' },
  questionText: { fontSize: 16, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', marginBottom: 15, gap: 10 },
  choiceBtn: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, flex: 1, alignItems: 'center', borderWidth: 1, borderColor: '#E1BEE7' },
  selected: { backgroundColor: '#4A148C', borderColor: '#4A148C' },
  choiceText: { color: '#4A148C', fontWeight: 'bold' },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E1BEE7', marginBottom: 15 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginTop: 10 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  sampleContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  sampleTouch: { alignItems: 'center', padding: 5, borderRadius: 10 },
  selectedSample: { borderWidth: 2, borderColor: '#4A148C' },
  sampleImg: { width: 120, height: 80, borderRadius: 10 },
  labelSmall: { marginTop: 5, fontSize: 12, fontWeight: '600' },
  uploadBox: { height: 80, borderStyle: 'dashed', borderWidth: 2, borderColor: '#4A148C', borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3E5F5' },
  uploadText: { marginTop: 5, color: '#4A148C', fontWeight: '600' },
  imagePreviewList: { marginTop: 15 },
  previewContainer: { position: 'relative', marginRight: 10 },
  previewImage: { width: 80, height: 80, borderRadius: 10 },
  removeBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FFF', borderRadius: 10 },
  submitButton: { backgroundColor: '#4A148C', padding: 15, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});