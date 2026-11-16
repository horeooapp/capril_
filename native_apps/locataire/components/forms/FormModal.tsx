import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';   // PAS celui de 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function FormModal({ visible, onClose, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="padding" style={[styles.backdrop, { paddingTop: insets.top + 24 }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fermer" />
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
          {footer ? (
            <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0,0,0,0.45)' 
  },
  sheet: { 
    flexShrink: 1, 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20 
  },
  content: { 
    padding: 16, 
    gap: 16 
  },
  footer: { 
    paddingHorizontal: 16, 
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth, 
    borderTopColor: '#D9D4C8' 
  },
});
