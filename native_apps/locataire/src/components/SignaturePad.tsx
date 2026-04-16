import React, { useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { Colors } from '../theme/colors';

interface SignaturePadProps {
  onOK: (signature: string) => void;
  onClear?: () => void;
  description?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onOK, onClear, description }) => {
  const ref = useRef<any>(null);

  const handleOK = (signature: string) => {
    onOK(signature);
  };

  const handleClear = () => {
    ref.current.clearSignature();
    if (onClear) onClear();
  };

  const style = `.m-signature-pad--footer {display: none; margin: 0px;}`;

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        <SignatureScreen
          ref={ref}
          onOK={handleOK}
          webStyle={style}
          descriptionText={description || "Signez ici"}
          bgHeight={300}
        />
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.buttonClear} onPress={handleClear}>
          <Text style={styles.buttonTextClear}>Effacer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSave} onPress={() => ref.current.readSignature()}>
          <Text style={styles.buttonTextSave}>Confirmer la signature</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  canvasContainer: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  buttonClear: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#EDF2F7',
  },
  buttonSave: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  buttonTextClear: {
    color: '#4A5568',
    fontWeight: 'bold',
  },
  buttonTextSave: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SignaturePad;
