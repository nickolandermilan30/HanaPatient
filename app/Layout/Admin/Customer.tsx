import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '../../../Firebase/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import GenConern from './Modal/GenConern'; // Siguraduhin na nasa tamang path ito
import Bleaching from './Modal/Bleaching'; // Import mo yung Bleaching component
import Sealant from './Modal/Sealant';
import PartialDenture from './Modal/PartialDenture';
import Fixed from './Modal/Fixed';
import Fluoride from './Modal/Fluoride';
import Extraction from './Modal/Extraction';
import Restoration from './Modal/Restoration';
import OralProphylaxis from './Modal/OralProphylaxis';
import CompleteDenture from './Modal/CompleteDenture';

export default function Customer() {
  const [concerns, setConcerns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchData = useCallback(async () => {
    // ... (fetch logic mo ay pareho pa rin)
    const usersRef = ref(db, 'users');
    const concernsRef = ref(db, 'concerns');
    const toothRef = ref(db, 'Tooth concern');

    const [userSnap, cSnap, tSnap] = await Promise.all([get(usersRef), get(concernsRef), get(toothRef)]);
    const users = userSnap.val() || {};
    const cData = cSnap.val() || {};
    const tData = tSnap.val() || {};

    const allConcerns = [
      ...Object.keys(cData).map(k => ({ ...cData[k], id: k, type: 'General' })),
      ...Object.keys(tData).map(k => ({ ...tData[k], id: k, type: tData[k].type || 'Tooth' }))
    ];

    const processed = allConcerns.map(item => {
      const userEmail = item.email || item.user;
      const userData = Object.values(users).find((u: any) => u.email === userEmail);
      return { ...item, patientName: userData ? `${(userData as any).firstName} ${(userData as any).lastName}` : 'Unknown' };
    });

    processed.sort((a, b) => new Date(b.date || b.timestamp).getTime() - new Date(a.date || a.timestamp).getTime());
    setConcerns(processed);
    setLoading(false);
  }, []);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#6200EE" /></View>;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
      >
        <Text style={styles.header}>Patient Concerns</Text>
        {concerns.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card} activeOpacity={0.7} onPress={() => openModal(item)}>
            <View style={[styles.iconBox, { backgroundColor: item.type === 'Tooth' ? '#e3f2fd' : '#fce4ec' }]}>
              <Ionicons name={item.type === 'Tooth' ? 'medical' : 'chatbubbles'} size={24} color={item.type === 'Tooth' ? '#2196F3' : '#E91E63'} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.patientName}</Text>
              <Text style={styles.type}>{item.type} Concern</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal for Details */}
<Modal visible={modalVisible} animationType="slide" transparent={true}>
  {selectedItem?.type === 'Bleaching' ? (
    <Bleaching item={selectedItem} onClose={() => setModalVisible(false)} />
  ) : selectedItem?.type === 'Sealants Application' ? (
    <Sealant item={selectedItem} onClose={() => setModalVisible(false)} />
  ) : selectedItem?.type === 'Removable Partial Denture' ? (
    <PartialDenture item={selectedItem} onClose={() => setModalVisible(false)} />
  ) : selectedItem?.type === 'Fixed Partial Denture' ? (
    <Fixed item={selectedItem} onClose={() => setModalVisible(false)} />
  ) : selectedItem?.type === 'Fluoride Application' ? (
    <Fluoride item={selectedItem} onClose={() => setModalVisible(false)} />
  ) : selectedItem?.type === 'Tooth Extraction' ? (
    <Extraction item={selectedItem} onClose={() => setModalVisible(false)} />
  ) : selectedItem?.type === 'Tooth Restoration' ? (
    <Restoration item={selectedItem} onClose={() => setModalVisible(false)} />
  ) : selectedItem?.type === 'Oral Prophylaxis' ? (
    <OralProphylaxis item={selectedItem} onClose={() => setModalVisible(false)} />
  ) :selectedItem?.type === 'Complete Denture Application' ? (
    <CompleteDenture item={selectedItem} onClose={() => setModalVisible(false)} />
  ) : (
    <GenConern item={selectedItem} onClose={() => setModalVisible(false)} />
  )}
</Modal>


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  scrollContent: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 20 },
  card: { backgroundColor: '#FFF', flexDirection: 'row', padding: 18, borderRadius: 20, marginBottom: 15, alignItems: 'center', elevation: 4 },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  info: { marginLeft: 15, flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  type: { fontSize: 12, color: '#636E72', textTransform: 'uppercase' }
});