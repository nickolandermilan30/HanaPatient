import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { auth, db } from '../../../Firebase/FirebaseConfig';
import { ref, push, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import para sa Storage
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function TRA() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const classes = [
    { id: 'Class I', img: require('../../../assets/Oral/class1.png') },
    { id: 'Class II', img: require('../../../assets/Oral/class2.png') },
    { id: 'Class III', img: require('../../../assets/Oral/class3.png') },
    { id: 'Class IV', img: require('../../../assets/Oral/class4.png') },
    { id: 'Class V', img: require('../../../assets/Oral/class5.png') },
    { id: 'Class VI', img: require('../../../assets/Oral/class6.png') },
  ];

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
    if (!selectedClass) { Alert.alert("Error", "Please select a cavity class."); return; }
    if (selectedImages.length === 0) { Alert.alert("Error", "Please attach at least one image."); return; }

    setLoading(true);
    try {
      const storage = getStorage();
      
      // 1. I-upload ang bawat image sa Storage para makuha ang Public URL
      const uploadedUrls = await Promise.all(
        selectedImages.map(async (uri) => {
          const response = await fetch(uri);
          const blob = await response.blob(); // Ito ang nagpapatakbo sa Web at Mobile
          const filename = `restorations/${Date.now()}_${Math.random()}.jpg`;
          const imageRef = storageRef(storage, filename);
          await uploadBytes(imageRef, blob);
          return await getDownloadURL(imageRef);
        })
      );

      // 2. I-save ang data sa Realtime Database
      const dbRef = ref(db, 'Tooth concern');
      const newRequestRef = push(dbRef);
      
      await set(newRequestRef, {
        user: userEmail,
        type: "Tooth Restoration",
        selectedClass: selectedClass,
        imageUris: uploadedUrls, // Dito na papasok ang public URL na nababasa sa kahit anong device
        timestamp: new Date().toISOString()
      });

      Alert.alert("Success", "Restoration Request Submitted!");
      router.back();
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to submit request. Please try again.");
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
        <Text style={styles.headerTitle}>Tooth Restoration</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.userContainer}>
          <Text style={styles.userLabel}>Logged in as:</Text>
          <Text style={styles.userEmail}>{userEmail || 'No user logged in'}</Text>
        </View>

        <Text style={styles.questionText}>Which classification do you think your case falls under?</Text>
        <Text style={styles.subText}>Tap the picture that describes your answer</Text>
        
        <View style={styles.gridContainer}>
          {classes.map((item) => (
            <TouchableOpacity 
              key={item.id}
              style={[styles.classCard, selectedClass === item.id && styles.selectedCard]} 
              onPress={() => setSelectedClass(item.id)}
            >
              <Image source={item.img} style={styles.classImage} />
              <Text style={styles.classLabel}>{item.id}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Attach Images:</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickImages}>
            <Ionicons name="camera" size={30} color="#4A148C" />
            <Text style={styles.uploadText}>Tap to add photos</Text>
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Submit Request</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // (Panatilihin ang iyong existing styles)
  container: { flex: 1, backgroundColor: '#F8F4FF' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A148C' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  userContainer: { padding: 15, backgroundColor: '#FFF', borderRadius: 15, marginBottom: 20, alignItems: 'center' },
  userLabel: { fontSize: 12, color: '#4A148C' },
  userEmail: { fontSize: 16, fontWeight: 'bold' },
  questionText: { fontSize: 18, fontWeight: 'bold', color: '#4A148C', textAlign: 'center' },
  subText: { fontSize: 14, color: '#7B1FA2', textAlign: 'center', marginBottom: 15 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  classCard: { width: '48%', backgroundColor: '#FFF', marginBottom: 10, padding: 10, borderRadius: 15, alignItems: 'center', elevation: 2 },
  selectedCard: { borderColor: '#4A148C', borderWidth: 2 },
  classImage: { width: 100, height: 100, resizeMode: 'contain' },
  classLabel: { marginTop: 5, fontWeight: 'bold', color: '#4A148C' },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginTop: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  uploadBox: { height: 80, borderStyle: 'dashed', borderWidth: 2, borderColor: '#4A148C', borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3E5F5' },
  uploadText: { marginTop: 5, color: '#4A148C', fontWeight: '600' },
  previewContainer: { position: 'relative', marginRight: 10, marginTop: 10 },
  previewImage: { width: 80, height: 80, borderRadius: 10 },
  removeBtn: { position: 'absolute', top: 5, right: 0, backgroundColor: '#FFF', borderRadius: 10 },
  submitButton: { backgroundColor: '#4A148C', padding: 15, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});