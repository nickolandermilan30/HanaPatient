import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const services = [
  { id: '1', title: 'Tooth Extraction', sub: '(Bunot)', icon: require('../../Image/extraction.png'), path: '/Layout/Services/TE' },
  { id: '2', title: 'Tooth Restoration', sub: '(Pasta)', icon: require('../../Image/restoration.png'), path: '/Layout/Services/TR' },
  { id: '3', title: 'Oral Prophylaxis', sub: '(Linis)', icon: require('../../Image/prophylaxis.png'), path: '/Layout/Services/OP' },
  { id: '4', title: 'Complete Denture', sub: '(Pustiso sa lahat ng ngipin)', icon: require('../../Image/complete_denture.png'), path: '/Layout/Services/CD' },
  { id: '5', title: 'Fixed Partial Denture', sub: '(Nakapirming pustiso)', icon: require('../../Image/fixed_denture.png'), path: '/Layout/Services/FPD' },
  { id: '6', title: 'Removable Partial Denture', sub: '(Natatanggal na pustiso)', icon: require('../../Image/removable.png'), path: '/Layout/Services/RPD' },
  { id: '7', title: 'Bleaching', sub: '(Pagpaputi ng ngipin)', icon: require('../../Image/bleaching.png'), path: '/Layout/Services/BL' },
  { id: '8', title: 'Fluoride Application', sub: '(Proteksyon sa ngipin)', icon: require('../../Image/fluoride.png'), path: '/Layout/Services/FA' },
  { id: '9', title: 'Sealant Application', sub: '(Sealant sa ngipin)', icon: require('../../Image/sealant.png'), path: '/Layout/Services/SA' },
];

export default function Dashboard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [concernText, setConcernText] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...newUris]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Image source={require('../../Image/Logo.png')} style={styles.logo} />
        </View>
        <Text style={styles.headerTitle}>Which Dental Service do you need?</Text>
      </View>

      <FlatList
        data={services}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(item.path as any)}>
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.sub}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.otherButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.otherButtonText}>Other Concern</Text>
      </TouchableOpacity>

      {/* Modal para sa Other Concern */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Other Concerns</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              multiline
              value={concernText}
              onChangeText={setConcernText}
            />
            
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>+ Upload Photo</Text>
            </TouchableOpacity>

            <ScrollView horizontal style={styles.imageScroll}>
              {images.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.thumbnail} />
              ))}
            </ScrollView>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.submitBtn]} onPress={() => { Alert.alert("Sent!", "Ipadadala na ang iyong concern."); setModalVisible(false); }}>
                <Text style={{color: '#FFF'}}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF' },
  header: { alignItems: 'center', padding: 15, backgroundColor: '#E1BEE7', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingBottom: 40 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  logo: { width: 65, height: 65 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#4A148C', textAlign: 'center', paddingHorizontal: 20 },
  grid: { paddingHorizontal: 10, paddingBottom: 20, alignItems: 'center' },
  card: { width: 105, height: 150, backgroundColor: '#E1BEE7', margin: 6, borderRadius: 15, alignItems: 'center', padding: 8 },
  icon: { width: 60, height: 60, marginBottom: 8 },
  cardTitle: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#2C0657' },
  cardSub: { fontSize: 8, textAlign: 'center', color: '#4A148C', marginTop: 4 },
  otherButton: { backgroundColor: '#E1BEE7', padding: 20, margin: 20, borderRadius: 20, alignItems: 'center' },
  otherButtonText: { fontSize: 18, fontWeight: 'bold', color: '#4A148C' },
  // Modal Styles
  modalView: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A148C', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#E1BEE7', borderRadius: 10, padding: 10, height: 100, marginBottom: 15 },
  uploadButton: { backgroundColor: '#E1BEE7', padding: 10, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  uploadButtonText: { color: '#4A148C', fontWeight: 'bold' },
  imageScroll: { marginBottom: 15 },
  thumbnail: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { padding: 15, borderRadius: 10, width: '45%', alignItems: 'center' },
  cancelBtn: { backgroundColor: '#EEE' },
  submitBtn: { backgroundColor: '#4A148C' }
});