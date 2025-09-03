import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onGoogleSignIn: () => void;
}

export default function SignInModal({ visible, onClose, onGoogleSignIn }: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.heading}>Welcome to PlanIt</Text>
          <Text style={styles.subheading}>Sign in to get started</Text>

          <TouchableOpacity style={styles.googleBtn} onPress={onGoogleSignIn}>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
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
  modal: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
  },
  subheading: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  googleBtn: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
  },
  googleText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  close: {
    marginTop: 16,
    color: '#007AFF',
    fontSize: 14,
  },
});
