import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../theme/theme';

interface SectionTitleProps {
  label: string;
  right?: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ label, right }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{label}</Text>
    {right}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textLight,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
