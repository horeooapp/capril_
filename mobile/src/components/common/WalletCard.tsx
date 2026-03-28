import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../theme/theme';

interface WalletCardProps {
  icon: string;
  label: string;
  sub?: string;
  color: string;
  bg: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const WalletCard: React.FC<WalletCardProps> = ({ 
  icon, label, sub, color, bg, onClick, disabled 
}) => (
  <TouchableOpacity 
    onPress={onClick} 
    disabled={disabled}
    style={[
      styles.container, 
      { backgroundColor: disabled ? Theme.colors.grey1 : bg, borderColor: `${disabled ? Theme.colors.grey2 : color}33` },
      { opacity: disabled ? 0.4 : 1 }
    ]}
  >
    <Text style={styles.icon}>{icon}</Text>
    <View style={styles.textContainer}>
      <Text style={[styles.label, { color: disabled ? Theme.colors.textLight : color }]}>{label}</Text>
      {sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
    {!disabled && <Text style={[styles.chevron, { color }]}>›</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 8,
    borderWidth: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  sub: {
    fontSize: 10,
    color: Theme.colors.textLight,
    marginTop: 1,
  },
  chevron: {
    fontSize: 14,
    opacity: 0.5,
  },
});
