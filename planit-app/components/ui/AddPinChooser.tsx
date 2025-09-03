// components/ui/AddPinChooser.tsx
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export type AddPinChooserRef = { open: () => void; close: () => void };

type Props = {
  onAddBySearch: () => void;
  onAddManual: () => void;
};

const AddPinChooser = forwardRef<AddPinChooserRef, Props>(
  ({ onAddBySearch, onAddManual }, ref) => {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    const close = () => setVisible(false);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={close} />

        {/* Card */}
        <View style={styles.centerWrap} pointerEvents="box-none">
          <View style={styles.card}>
            <Text style={styles.title}>Add a pin</Text>

            <TouchableOpacity
              style={styles.row}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                close();
                onAddBySearch();
              }}
              activeOpacity={0.9}
            >
              <Ionicons name="search-outline" size={20} color="#0047AB" />
              <Text style={styles.rowLabel}>By search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                close();
                onAddManual();
              }}
              activeOpacity={0.9}
            >
              <Ionicons name="pin-outline" size={20} color="#0047AB" />
              <Text style={styles.rowLabel}>Manually on map</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancel} onPress={close} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);

export default AddPinChooser;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0b1a33', marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e8ecf5',
    backgroundColor: '#f7faff',
    marginTop: 8,
  },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#0b1a33' },
  cancel: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Platform.OS === 'ios' ? '#f2f2f7' : '#eee',
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#333' },
});