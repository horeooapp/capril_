import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

export default function SideMenuHeader() {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/logo-qapril.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.version}>Version 1.0.0 (Pre-Build)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#001C29',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logo: {
    width: 140,
    height: 60,
  },
  version: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 5,
    fontWeight: '600',
  }
});
