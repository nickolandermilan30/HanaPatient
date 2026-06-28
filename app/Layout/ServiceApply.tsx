import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { auth, db } from '../../Firebase/FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

export default function ServiceApply() {
  const [filter, setFilter] = useState<'Applied' | 'Approved' | 'Rejected'>('Applied');
  const [userEmail, setUserEmail] = useState('');
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.currentUser) {
      const email = auth.currentUser.email || '';
      setUserEmail(email);

      // Fetch lahat ng kailangan na nodes
      const nodes = ['concerns', 'Tooth concern', 'Approved', 'Rejected'];
      const dbRef = ref(db, '/');

      onValue(dbRef, (snapshot) => {
        const val = snapshot.val();
        let combined: any[] = [];

        if (val) {
          nodes.forEach(node => {
            if (val[node]) {
              Object.keys(val[node]).forEach(key => {
                const item = val[node][key];
                // Check kung sa user na ito ang record
                if (item.email === email || item.user === email) {
                  combined.push({
                    id: key,
                    service: item.type || item.concern || 'Request',
                    date: item.timestamp || item.date || new Date().toISOString(),
                    status: node === 'Approved' ? 'Approved' : node === 'Rejected' ? 'Rejected' : 'Applied'
                  });
                }
              });
            }
          });
        }
        
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAllData(combined);
        setLoading(false);
      });
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return '#2E7D32'; // Green
      case 'Rejected': return '#C62828'; // Red
      default: return '#EF6C00'; // Orange (Applied/Pending)
    }
  };

  const filteredData = allData.filter(item => item.status === filter);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: getStatusColor(item.status) + '15' }]}>
        <Ionicons name="medical" size={24} color={getStatusColor(item.status)} />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.serviceTitle}>{item.service}</Text>
        <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4A148C" />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.emailText}>{userEmail}</Text>
        <Text style={styles.title}>My Requests</Text>
      </View>

      <View style={styles.tabContainer}>
        {(['Applied', 'Approved', 'Rejected'] as const).map((status) => (
          <TouchableOpacity 
            key={status} 
            style={[styles.tab, filter === status && { backgroundColor: getStatusColor(status) }]} 
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.tabText, filter === status && styles.activeTabText]}>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No {filter} requests found.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  header: { padding: 30, backgroundColor: '#4A148C', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
  emailText: { color: '#E1BEE7', fontSize: 12, opacity: 0.8 },
  title: { color: '#FFF', fontSize: 24, fontWeight: '800', marginTop: 5 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20, paddingHorizontal: 20 },
  tab: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, backgroundColor: '#FFF', elevation: 2 },
  tabText: { color: '#4A148C', fontWeight: 'bold' },
  activeTabText: { color: '#FFF' },
  list: { padding: 20 },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 5 },
  cardIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  serviceTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
  dateText: { fontSize: 12, color: '#999', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});