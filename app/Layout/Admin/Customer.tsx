import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { ref, onValue } from 'firebase/database';
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

  useEffect(() => {
    // Pag-set up ng references
    const usersRef = ref(db, 'users');
    const cRef = ref(db, 'concerns');
    const tRef = ref(db, 'Tooth concern');
    const appRef = ref(db, 'Approved');
    const rejRef = ref(db, 'Rejected');

    // Ang onValue ay awtomatikong nag-uupdate kapag may nagbago sa database
    const handleDataUpdate = () => {
      setLoading(true);
      Promise.all([
        import('firebase/database').then(dbMod => Promise.all([
          // Dahil onValue ang gamit natin, kailangan natin ng paraan para makuha ang latest
          // o kaya ay i-wrap ang listeners sa isang main listener.
        ]))
      ]);
    };

    // Real-time listener para sa lahat ng tables
    const unsub = () => {
        // Simplified approach: pag-subscribe sa lahat ng nodes
        const nodes = [
            { ref: cRef, type: 'General', status: 'Pending' },
            { ref: tRef, type: 'Tooth', status: 'Pending' },
            { ref: appRef, type: 'Status', status: 'Approved' },
            { ref: rejRef, type: 'Status', status: 'Rejected' },
        ];

        // Fetch users once, then listen to the rest
        import('firebase/database').then(({ get }) => {
            get(usersRef).then((usersSnap) => {
                const users = usersSnap.val() || {};
                
                // Set up listeners for all nodes
                nodes.forEach(node => {
                    onValue(node.ref, (snapshot) => {
                        const data = snapshot.val() || {};
                        const formattedData = Object.keys(data).map(k => {
                            const item = data[k];
                            const userEmail = item.email || item.user;
                            const userData = Object.values(users).find((u: any) => u.email === userEmail) as any;
                            return {
                                ...item,
                                id: k,
                                status: node.status,
                                type: item.type || node.type,
                                patientName: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown'
                            };
                        });

                        setConcerns(prev => {
                            // Alisin ang lumang data ng node na ito at idagdag ang bago
                            const filtered = prev.filter(p => p.status !== node.status || (p.status === 'Pending' && node.type !== 'General' && node.type !== 'Tooth'));
                            return [...filtered, ...formattedData];
                        });
                        setLoading(false);
                    });
                });
            });
        });
    };

    unsub();
  }, []);

  const filteredConcerns = concerns.filter(c => c.status === activeTab);

  const getTabColor = (tab: string) => {
    if (tab === 'Pending') return '#2196F3';
    if (tab === 'Approved') return '#4CAF50';
    return '#F44336';
  };

  const renderModalContent = (item: any) => {
    const props = { item, onClose: () => setModalVisible(false) };
    switch (item.type) {
      case 'General': return <GenConern {...props} />;
      case 'Tooth Extraction': return <Extraction {...props} />;
      case 'Tooth Restoration': return <Restoration {...props} />;
      case 'Oral Prophylaxis': return <OralProphylaxis {...props} />;
      case 'Complete Denture Application': return <CompleteDenture {...props} />;
      case 'Fixed Partial Denture': return <Fixed {...props} />;
      case 'Removable Partial Denture': return <PartialDenture {...props} />;
      case 'Bleaching': return <Bleaching {...props} />;
      case 'Fluoride Application': return <Fluoride {...props} />;
      case 'Sealants Application': return <Sealant {...props} />;
      default: return <GenConern {...props} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Patient Records</Text>

      <View style={styles.tabContainer}>
        {(['Pending', 'Approved', 'Rejected'] as const).map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && { backgroundColor: getTabColor(tab) }]} 
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredConcerns.map((item, index) => (
          <TouchableOpacity 
            key={item.id || index} 
            style={styles.card} 
            activeOpacity={0.7} 
            onPress={() => {
              if (activeTab === 'Pending') {
                setSelectedItem(item);
                setModalVisible(true);
              }
            }}
          >
            <View style={[styles.iconBox, { backgroundColor: item.status === 'Approved' ? '#e8f5e9' : item.status === 'Rejected' ? '#ffebee' : '#e3f2fd' }]}>
              <Ionicons name={item.status === 'Approved' ? 'checkmark-circle' : item.status === 'Rejected' ? 'close-circle' : 'time'} size={24} color={getTabColor(item.status)} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.patientName}</Text>
              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type || 'General'}</Text>
                </View>
              </View>
            </View>
            {activeTab === 'Pending' && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        {selectedItem && (
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
             {renderModalContent(selectedItem)}
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
  typeText: { fontSize: 10, fontWeight: '700', color: '#666', textTransform: 'uppercase' }
});