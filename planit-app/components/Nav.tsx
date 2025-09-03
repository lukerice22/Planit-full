// components/Nav.tsx
import React, { useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import ExpandedNavContent from './ui/ExpandedNav';
import * as Haptics from 'expo-haptics';

export type NavProps = {
  onExpandedChange?: (expanded: boolean) => void;
  onOpenChooser?: () => void;
};

const NAVBAR_HEIGHT = 120;

export default function Nav({ onExpandedChange, onOpenChooser }: NavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const expandedSheetRef = useRef<BottomSheet>(null);
  const expandedSnapPoints = useMemo(() => ['10%', '75%'], []);

  const setExpandedState = (next: boolean) => onExpandedChange?.(next);

  const openedThisDrag = useRef(false);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_e, gs) => {
        const vertical = Math.abs(gs.dy) > Math.abs(gs.dx);
        return vertical && gs.dy < -6;
      },
      onPanResponderMove: (_e, gs) => {
        if (!openedThisDrag.current && gs.dy < -16) {
          openedThisDrag.current = true;
          expandedSheetRef.current?.snapToIndex(1);
        }
      },
      onPanResponderRelease: () => {
        openedThisDrag.current = false;
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => {
        openedThisDrag.current = false;
      },
    })
  ).current;

  const prevIndexRef = useRef(0);
  const handleSheetChange = async (index: number) => {
    if (prevIndexRef.current === 0 && index > 0) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    prevIndexRef.current = index;
    setExpandedState(index > 0);
  };

  const openExpanded = async () => {
    await Haptics.selectionAsync();
    expandedSheetRef.current?.snapToIndex(1);
  };

  const onPlanPress = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onOpenChooser?.();
  };

  return (
    <>
      {/* Expanded Nav Sheet */}
      <BottomSheet
        ref={expandedSheetRef}
        index={0}
        snapPoints={expandedSnapPoints}
        enablePanDownToClose
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.sheetBackground}
        onChange={handleSheetChange}
        style={{ zIndex: 8 }}
      >
        <ExpandedNavContent onOpenChooser={onOpenChooser} />
      </BottomSheet>

      {/* Bottom Nav Bar */}
      <View
        style={[styles.container, { paddingBottom: insets.bottom + 10 }]}
        {...panResponder.panHandlers}
      >
        <NavButton
          icon="home-outline"
          label="Home"
          onPress={async () => {
            await Haptics.selectionAsync();
            router.push('/home');
          }}
        />

        <NavButton
          icon="map-outline"
          label="Pins"
          onPress={async () => {
            await Haptics.selectionAsync();
            router.push('/pins'); // your new route file makes this work
          }}
        />

        <View style={styles.floatingButtonWrapper}>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={onPlanPress}
            activeOpacity={0.7}
          >
            <Ionicons name="add-outline" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.label}>Plan</Text>
        </View>

        <NavButton
          icon="images-outline"
          label="Photos"
          onPress={async () => {
            await Haptics.selectionAsync();
            router.push('/photos');
          }}
        />

        <TouchableOpacity style={styles.moreWrapper} onPress={openExpanded} activeOpacity={0.7}>
          <View style={styles.iconContainer}>
            <Ionicons name="list-outline" size={26} color="#0047AB" />
          </View>
          <Text style={styles.label}>More</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

function NavButton({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={26} color="#0047AB" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f2f7ff',
    paddingVertical: 14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#a3bffa',
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 18,
    zIndex: 5,
    pointerEvents: 'box-none',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
  },
  iconContainer: {
    backgroundColor: '#e0ebff',
    padding: 10,
    borderRadius: 18,
    marginBottom: 2,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 6,
  },
  label: { fontSize: 11, color: '#0047AB', fontWeight: '600', marginTop: 4 },
  floatingButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
  },
  floatingButton: {
    backgroundColor: '#0047AB',
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 12,
  },
  moreWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
  },
  indicator: {
    backgroundColor: '#ccc',
    width: 40, height: 5, borderRadius: 10, alignSelf: 'center', marginVertical: 8,
  },
  sheetBackground: { backgroundColor: '#fff' },
});