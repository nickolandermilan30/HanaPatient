import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, update } from 'firebase/database';
import { db } from '../../../../Firebase/FirebaseConfig';

export default function GenConern({ item, onClose }: { item: any, onClose: () => void }) {
  
  const updateStatus = async (status: string) => {
    try {
      const concernRef = ref(db, `concerns/${item.id}`);
      await update(concernRef, { status: status });
      Alert.alert("Success", `Concern has been ${status}.`);
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update status.");
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        <View style={styles.headerBar}>
          <Text style={styles.title}>Concern Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Patient Name</Text>
          <Text style={styles.value}>{item?.patientName}</Text>
          
          <Text style={[styles.label, { marginTop: 15 }]}>Date Submitted</Text>
          <Text style={styles.value}>{new Date(item?.date).toLocaleDateString('en-PH', { dateStyle: 'long' })}</Text>
        </View>

        <Text style={styles.sectionHeader}>Concern Message</Text>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{item?.concern || "No message provided."}</Text>
        </View>

        {/* Display Images with Title */}
        {item.images && item.images.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Actual Pictures of Teeth</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {item.images.map((uri: string, index: number) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => updateStatus('Rejected')}>
            <Ionicons name="close-circle" size={20} color="#FFF" />
            <Text style={styles.btnText}> Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => updateStatus('Approved')}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.btnText}> Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', padding: 25, borderRadius: 30, elevation: 10, maxHeight: '85%' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#E91E63' },
  closeBtn: { backgroundColor: '#F0F0F0', padding: 8, borderRadius: 20 },
  infoCard: { backgroundColor: '#F8F4FF', padding: 15, borderRadius: 15, marginBottom: 20 },
  label: { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 15, fontWeight: '700', color: '#333', marginTop: 2 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#E91E63', marginBottom: 10 },
  messageBox: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', padding: 15, borderRadius: 15, marginBottom: 20 },
  messageText: { color: '#444', lineHeight: 22 },
  imageScroll: { marginBottom: 20 },
  imageWrapper: { marginRight: 15 },
  image: { width: 120, height: 120, borderRadius: 15, borderWidth: 2, borderColor: '#E91E63' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  btn: { flexDirection: 'row', padding: 16, borderRadius: 15, width: '47%', alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { backgroundColor: '#E91E63' },
  approveBtn: { backgroundColor: '#4CAF50' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});