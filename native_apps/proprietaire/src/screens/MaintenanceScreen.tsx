import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { ChevronLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react-native';

export default function MaintenanceScreen({ route, navigation }: any) {
  const token = route.params?.token || 'DUMMY_TOKEN';
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_TICKETS = 'https://www.qapril.ci/api/mobile/owner/tickets';

  const fetchTickets = () => {
    fetch(API_TICKETS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'GET_TICKETS' })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) setTickets(json.tickets);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleAction = (ticketId: string, actionType: 'ACCEPT_TICKET' | 'REJECT_TICKET') => {
    setLoading(true);
    fetch(API_TICKETS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: actionType, ticketId })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          Alert.alert("Succès", actionType === 'ACCEPT_TICKET' ? "Ticket pris en charge." : "Ticket refusé.");
          fetchTickets();
        } else {
          Alert.alert("Erreur", json.error);
          setLoading(false);
        }
      })
      .catch(err => {
        Alert.alert("Erreur", "Problème réseau.");
        setLoading(false);
      });
  };

  if (loading && tickets.length === 0) {
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
        <Text style={styles.headerTitle}>Interventions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {tickets.length === 0 && (
          <Text style={styles.emptyText}>Aucun ticket de maintenance signalé.</Text>
        )}
        
        {tickets.map(ticket => (
          <View key={ticket.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <AlertCircle size={20} color="#d97706" />
              <Text style={styles.cardTitle}>{ticket.category.replace('MAI_', '')} - Urgence</Text>
            </View>

            <Text style={styles.description}>{ticket.description}</Text>
            <Text style={styles.propertyText}>{ticket.property?.address}</Text>
            
            <View style={styles.divider} />

            {ticket.status === 'EN_ATTENTE' ? (
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.btn, styles.rejectBtn]}
                  onPress={() => handleAction(ticket.id, 'REJECT_TICKET')}
                >
                  <XCircle size={18} color="#dc2626" />
                  <Text style={styles.rejectText}>Refuser</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, styles.acceptBtn]}
                  onPress={() => handleAction(ticket.id, 'ACCEPT_TICKET')}
                >
                  <CheckCircle size={18} color="#059669" />
                  <Text style={styles.acceptText}>Prise en charge</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.statusBox}>
                <Text style={styles.statusLabel}>Statut actuel: <Text style={{fontWeight: '800'}}>{ticket.status}</Text></Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
  },
  container: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginLeft: 8 },
  description: { fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 20 },
  propertyText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  actionRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 12, borderWidth: 1 },
  rejectBtn: { borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  acceptBtn: { borderColor: '#6ee7b7', backgroundColor: '#ecfdf5' },
  rejectText: { color: '#dc2626', fontWeight: '700', marginLeft: 8 },
  acceptText: { color: '#059669', fontWeight: '700', marginLeft: 8 },
  statusBox: { backgroundColor: 'rgba(0,0,0,0.03)', padding: 12, borderRadius: 8, alignItems: 'center' },
  statusLabel: { color: '#4b5563', fontSize: 13 }
});
