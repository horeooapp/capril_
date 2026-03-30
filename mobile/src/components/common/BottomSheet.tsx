import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Pressable, 
  Dimensions,
  Platform 
} from 'react-native';
import { Theme } from '../../theme/theme';

const { height } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  titleColor?: string;
  children: React.ReactNode;
  maxHeight?: number | string;
}

export function BottomSheet({ 
  visible, 
  onClose, 
  title, 
  titleColor, 
  children,
  maxHeight = '85%' 
}: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[styles.sheet, { maxHeight: typeof maxHeight === 'string' ? maxHeight : maxHeight }]} 
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: titleColor || Theme.colors.navy }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 26, 69, 0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: Theme.colors.grey1,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Theme.colors.grey1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textMid,
  },
  content: {
    paddingHorizontal: 24,
  }
});
