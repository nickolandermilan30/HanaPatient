import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, update } from 'firebase/database';
import { db } from '../../../../Firebase/FirebaseConfig';

export default function Bleaching({ item, onClose }: { item: any, onClose: () => void }) {
  
  const updateStatus = async (status: string) => {
    try {
      // Paggamit ng 'Tooth concern' path para sa Bleaching data
      const concernRef = ref(db, `Tooth concern/${item.id}`);
      await update(concernRef, { status: status });
      Alert.alert("Success", `Request has been ${status}.`);
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update status.");
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        <View style={styles.headerBar}>
          <Text style={styles.title}>Bleaching Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Patient & Date Info */}
        <View style={styles.infoCard}>
          <Text style={styles.label}>Patient Name</Text>
          <Text style={styles.value}>{item?.patientName || 'Unknown'}</Text>
          
          <Text style={[styles.label, { marginTop: 15 }]}>Date Requested</Text>
          <Text style={styles.value}>{new Date(item?.timestamp).toLocaleDateString('en-PH', { dateStyle: 'long' })}</Text>
        </View>

        {/* Selected Teeth Info */}
        {item.selectedTeeth && (
          <>
            <Text style={styles.sectionHeader}>Selected Teeth</Text>
            <View style={styles.teethBox}>
              <Text style={styles.teethText}>Upper: {item.selectedTeeth.upperLeft} / {item.selectedTeeth.upperRight}</Text>
              <Text style={styles.teethText}>Lower: {item.selectedTeeth.lowerLeft} / {item.selectedTeeth.lowerRight}</Text>
            </View>
          </>
        )}

        {/* Reference Images */}
        {item.imageUris && item.imageUris.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Actual Pictures of Teeth</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {item.imageUris.map((uri: string, index: number) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Action Buttons */}
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
  teethBox: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', padding: 15, borderRadius: 15, marginBottom: 20 },
  teethText: { fontSize: 14, color: '#444', marginBottom: 4 },
  imageScroll: { marginBottom: 20 },
  imageWrapper: { marginRight: 15 },
  image: { width: 120, height: 120, borderRadius: 15, borderWidth: 2, borderColor: '#E91E63' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  btn: { flexDirection: 'row', padding: 16, borderRadius: 15, width: '47%', alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { backgroundColor: '#E91E63' },
  approveBtn: { backgroundColor: '#4CAF50' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});