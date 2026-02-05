import { useState } from 'react';
import { Button, Modal, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from './themed-text';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onLogin: (externalId: string) => void;
}

export function LoginModal({ visible, onClose, onLogin }: LoginModalProps) {
  const [externalId, setExternalId] = useState('');

  const handleLogin = () => {
    if (externalId.trim()) {
      onLogin(externalId.trim());
      setExternalId('');
    }
  };

  const handleClose = () => {
    setExternalId('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ThemedText>Enter External ID</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="External ID"
            value={externalId}
            onChangeText={setExternalId}
            autoFocus
          />
          <View style={styles.buttons}>
            <Button title="Cancel" onPress={handleClose} />
            <Button title="Login" onPress={handleLogin} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
