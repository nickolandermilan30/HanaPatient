import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '../../../Firebase/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

// Import ng iyong Modals
import GenConern from './Modal/GenConern';
import Bleaching from './Modal/Bleaching';
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
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [usersSnap, cSnap, tSnap, appSnap, rejSnap] = await Promise.all([
      get(ref(db, 'users')),
      get(ref(db, 'concerns')),
      get(ref(db, 'Tooth concern')),
      get(ref(db, 'Approved')),
      get(ref(db, 'Rejected')),
    ]);

    const users = usersSnap.val() || {};
    const dataSources = [
      { data: cSnap.val() || {}, type: 'General', status: 'Pending' },
      { data: tSnap.val() || {}, type: 'Tooth', status: 'Pending' },
      { data: appSnap.val() || {}, type: 'Status', status: 'Approved' },
      { data: rejSnap.val() || {}, type: 'Status', status: 'Rejected' },
    ];

    let all: any[] = [];
    dataSources.forEach(source => {
      Object.keys(source.data).forEach(k => {
        const item = source.data[k];
        const userEmail = item.email || item.user;
        const userData = Object.values(users).find((u: any) => u.email === userEmail) as any;
        all.push({
          ...item,
          id: k,
          status: source.status,
          patientName: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown'
        });
      });
    });

    setConcerns(all);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredConcerns = concerns.filter(c => c.status === activeTab);

  // Helper para sa kulay ng Tab
  const getTabColor = (tab: string) => {
    if (tab === 'Pending') return '#2196F3'; // Blue
    if (tab === 'Approved') return '#4CAF50'; // Green
    return '#F44336'; // Red
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Patient Records</Text>

      {/* Tabs na may kulay */}
      <View style={styles.tabContainer}>
        {(['Pending', 'Approved', 'Rejected'] as const).map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[
              styles.tab, 
              activeTab === tab && { backgroundColor: getTabColor(tab) }
            ]} 
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}>
        {filteredConcerns.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card} activeOpacity={0.7} onPress={() => activeTab === 'Pending' && (setSelectedItem(item), setModalVisible(true))}>
            <View style={[styles.iconBox, { backgroundColor: item.status === 'Approved' ? '#e8f5e9' : item.status === 'Rejected' ? '#ffebee' : '#e3f2fd' }]}>
              <Ionicons name={item.status === 'Approved' ? 'checkmark-circle' : item.status === 'Rejected' ? 'close-circle' : 'time'} size={24} color={getTabColor(item.status)} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.patientName}</Text>
              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type || 'General'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getTabColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </View>
            {activeTab === 'Pending' && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal logic ay mananatili */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        {selectedItem && (
          // Dito mo i-render ang tamang modal base sa type gaya ng dati
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            {/* Modal Content Placeholder */}
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  header: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginTop: 50, marginHorizontal: 20, marginBottom: 15 },
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 12, padding: 4, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabText: { fontWeight: '600', color: '#666' },
  activeTabText: { color: '#FFF', fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#FFF', flexDirection: 'row', padding: 18, borderRadius: 20, marginBottom: 15, alignItems: 'center', elevation: 2 },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  info: { marginLeft: 15, flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  typeBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 6 },
  typeText: { fontSize: 10, fontWeight: '700', color: '#666', textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#FFF', textTransform: 'uppercase' }
});