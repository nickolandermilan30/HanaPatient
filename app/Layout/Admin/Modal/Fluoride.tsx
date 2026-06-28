import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, get, set, remove } from 'firebase/database';
import { db } from '../../../../Firebase/FirebaseConfig';

export default function Fluoride({ item, onClose }: { item: any, onClose: () => void }) {
  
  // Function para ilipat ang data sa kaukulang folder
  const moveDataToStatus = async (status: 'Approved' | 'Rejected') => {
    try {
      // 1. Reference sa kasalukuyang record sa "Tooth concern"
      const oldRef = ref(db, `Tooth concern/${item.id}`);
      // 2. Reference sa destinasyon (Approved o Rejected node)
      const newRef = ref(db, `${status}/${item.id}`);

      // Kunin ang data mula sa Firebase
      const snapshot = await get(oldRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // I-save sa bagong location na may status at timestamp
        await set(newRef, { 
          ...data, 
          status: status, 
          processedAt: new Date().toISOString() 
        });
        
        // Burahin ang data sa lumang location (Tooth concern) para maalis sa pending list
        await remove(oldRef);
        
        Alert.alert("Success", `Fluoride concern has been moved to ${status}.`);
        onClose();
      } else {
        Alert.alert("Error", "Record not found.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to move data.");
    }
  };

  const renderTeethInfo = () => {
    if (!item.selectedTeeth) return <Text style={styles.value}>Not specified</Text>;
    return Object.entries(item.selectedTeeth).map(([key, value]) => (
      <View key={key} style={styles.teethItem}>
        <Ionicons name="medical" size={16} color="#E91E63" style={{ marginRight: 8 }} />
        <Text style={styles.value}>
          {key.replace(/([A-Z])/g, ' $1')}: <Text style={{ fontWeight: 'normal' }}>{String(value)}</Text>
        </Text>
      </View>
    ));
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        <View style={styles.headerBar}>
          <Text style={styles.title}>Fluoride Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Patient Name</Text>
            <Text style={styles.value}>{item?.patientName}</Text>
            <Text style={[styles.label, { marginTop: 15 }]}>Date Submitted</Text>
            <Text style={styles.value}>{item?.timestamp ? new Date(item.timestamp).toLocaleDateString('en-PH', { dateStyle: 'long' }) : 'N/A'}</Text>
          </View>

          <Text style={styles.sectionHeader}>Selected Teeth</Text>
          <View style={styles.messageBox}>
            {renderTeethInfo()}
          </View>

          {item.imageUris && item.imageUris.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Pictures</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {item.imageUris.map((uri: string, index: number) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.image} />
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </ScrollView>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => moveDataToStatus('Rejected')}>
            <Ionicons name="close-circle" size={20} color="#FFF" />
            <Text style={styles.btnText}> Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => moveDataToStatus('Approved')}>
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
  value: { fontSize: 15, fontWeight: '700', color: '#333' },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#E91E63', marginBottom: 10 },
  messageBox: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', padding: 15, borderRadius: 15, marginBottom: 20 },
  teethItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  imageScroll: { marginBottom: 20 },
  imageWrapper: { marginRight: 15 },
  image: { width: 120, height: 120, borderRadius: 15, borderWidth: 2, borderColor: '#E91E63' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  btn: { flexDirection: 'row', padding: 16, borderRadius: 15, width: '47%', alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { backgroundColor: '#E91E63' },
  approveBtn: { backgroundColor: '#4CAF50' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});