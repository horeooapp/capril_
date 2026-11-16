import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  footer?: React.ReactNode;              // bouton(s) de validation
  contentStyle?: StyleProp<ViewStyle>;
};

const FOOTER_HEIGHT = 72;

export function FormScreen({ children, footer, contentStyle }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.flex}>
      <KeyboardAwareScrollView
        bottomOffset={footer ? FOOTER_HEIGHT + 24 : 24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, contentStyle]}
      >
        {children}
      </KeyboardAwareScrollView>
      {footer ? (
        <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View>
        </KeyboardStickyView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 16 },
  footer: { 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth, 
    borderTopColor: '#D9D4C8' 
  },
});
