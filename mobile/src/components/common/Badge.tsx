import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../theme/theme';

interface BadgeProps {
  label: string;
  color: string;
  bg: string;
  size?: number;
  style?: any;
}

export const Badge: React.FC<BadgeProps> = ({ label, color, bg, size = 10, style }) => (
  <View style={[styles.container, { backgroundColor: bg }, style]}>
    <Text style={[styles.text, { color, fontSize: size }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
  },
});
