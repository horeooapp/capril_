import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { ChevronLeft, FileText, CheckCircle, XCircle } from 'lucide-react-native';
import { API_ENDPOINTS } from '../config/api';

export default function ApplicationsScreen({ route, navigation }: any) {
  const token = route.params?.token;
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_APPS = API_ENDPOINTS.APPLICATIONS;

  const fetchApplications = () => {
    fetch(API_APPS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'GET_ALL' })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) setApplications(json.applications);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = (appId: string, actionType: 'APPROVE' | 'REJECT') => {
    setLoading(true);
    fetch(API_APPS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: actionType, applicationId: appId })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          Alert.alert("Succès", actionType === 'APPROVE' ? "Candidature acceptée." : "Candidature rejetée.");
          fetchApplications();
        } else {
          Alert.alert("Erreur", json.error);
          setLoading(false);
        }
      })
      .catch(() => {
        Alert.alert("Erreur", "Problème réseau.");
        setLoading(false);
      });
  };

  if (loading && applications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#064E3B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#064E3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Candidatures</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {applications.length === 0 ? (
          <View style={{alignItems: 'center', marginTop: 40}}>
             <FileText size={40} color="#6b7280" style={{marginBottom: 16}} />
             <Text style={{color: '#6b7280'}}>Aucun dossier en attente.</Text>
          </View>
        ) : (
          applications.map(app => (
            <View key={app.id} style={styles.card}>
              <Text style={styles.prospectName}>{app.user?.firstName} {app.user?.lastName}</Text>
              <Text style={styles.propertyInfo}>Propriété: {app.property?.address}</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => handleAction(app.id, 'REJECT')}>
                   <XCircle size={18} color="#dc2626" />
                   <Text style={{color: '#dc2626', fontWeight: '800'}}>Refuser</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={() => handleAction(app.id, 'APPROVE')}>
                   <CheckCircle size={18} color="#059669" />
                   <Text style={{color: '#059669', fontWeight: '800'}}>Accepter</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  backButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12, marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#064E3B' },
  container: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 12 },
  prospectName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  propertyInfo: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 12, borderWidth: 1 },
  rejectBtn: { borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  acceptBtn: { borderColor: '#6ee7b7', backgroundColor: '#ecfdf5' }
});
