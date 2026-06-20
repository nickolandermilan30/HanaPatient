import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { auth, db } from '../../../Firebase/FirebaseConfig';
import { ref, push, set } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function BLA() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

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
    if (selectedImages.length === 0) {
      Alert.alert("Error", "Please attach at least one image.");
      return;
    }

    setLoading(true);
    try {
      const dbRef = ref(db, 'Tooth concern');
      const newRequestRef = push(dbRef);
      
      await set(newRequestRef, {
        user: userEmail,
        type: "Bleaching",
        imageUris: selectedImages,
        timestamp: new Date().toISOString()
      });

      Alert.alert("Success", "Request Submitted Successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to submit request.");
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
        <Text style={styles.headerTitle}>Bleaching</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Email Section */}
        <View style={styles.userContainer}>
          <Text style={styles.userLabel}>Logged in as:</Text>
          <Text style={styles.userEmail}>{userEmail || 'No user logged in'}</Text>
        </View>

        {/* Reference Image (Static/Display only) */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Reference</Text>
          <Image 
            source={require('../../../assets/CD Apply/BT.png')} 
            style={styles.referenceImage} 
            resizeMode="contain" 
          />
        </View>

        {/* Upload Section */}
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
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Submit Request</Text>}
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
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginTop: 10 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  referenceImage: { width: '100%', height: 200, borderRadius: 10 },
  uploadBox: { height: 80, borderStyle: 'dashed', borderWidth: 2, borderColor: '#4A148C', borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3E5F5' },
  uploadText: { marginTop: 5, color: '#4A148C', fontWeight: '600' },
  imagePreviewList: { marginTop: 15 },
  previewContainer: { position: 'relative', marginRight: 10 },
  previewImage: { width: 80, height: 80, borderRadius: 10 },
  removeBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FFF', borderRadius: 10 },
  submitButton: { backgroundColor: '#4A148C', padding: 15, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});