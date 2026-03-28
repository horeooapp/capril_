import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../theme/theme';

interface RowProps {
  label: string;
  value: string;
  color?: string;
}

export const Row: React.FC<RowProps> = ({ label, value, color }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color: color || Theme.colors.textMid }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.grey1,
  },
  label: {
    fontSize: 10,
    color: Theme.colors.textLight,
  },
  value: {
    fontSize: 11,
    fontWeight: '700',
  },
});
