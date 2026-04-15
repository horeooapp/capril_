import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Plus } from 'lucide-react-native';

interface DashboardCardProps {
  title: string;
  status: string;
  subStatus: string;
  icon: React.ReactNode;
  backgroundColor: string;
  onPress?: () => void;
  onAddPress?: () => void;
}

export default function DashboardCard({ 
  title, 
  status, 
  subStatus, 
  icon, 
  backgroundColor, 
  onPress,
  onAddPress 
}: DashboardCardProps) {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor }]} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>{icon}</View>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Plus size={16} color={Colors.primary} strokeWidth={3} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.footer}>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.subStatus}>{subStatus}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    // Styling additionnel si besoin
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  subStatus: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 2,
  }
});
