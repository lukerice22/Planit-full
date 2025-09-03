import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Animated } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Nav from '@/components/Nav';
import AuthModal from '@/components/AuthModal';
import { auth, firestore } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import customMapStyle from '@/constants/Mapstyle';
import SearchBar, { SearchBarRef } from '@/components/SearchBar';
import PinMenu, { PinData } from '@/components/ui/PinMenu';
import AddPinChooser, { AddPinChooserRef } from '@/components/ui/AddPinChooser';
import PinIcon from '../components/PinIcon';

// 🔹 Pill toggle
import PinToggle, { PinFilter } from '@/components/PinToggle'; // <- change path if needed

interface PlaceItem {
  place_id: string;
  description: string;
  lat?: number;
  lng?: number;
}

const NAV_HEIGHT = 72;
const BANNER_EXTRA_OFFSET = 64;
const DEFAULT_PIN_COLOR = '#C41E3A';

const getAnchor = (shape?: string) => {
  switch (shape) {
    case 'flag':
      return { x: 0.42, y: 1 };
    default:
      return { x: 0.5, y: 1 };
  }
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const modalShownThisSession = useRef(false);

  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);
  const [resumeAfterAuth, setResumeAfterAuth] = useState<PlaceItem | null>(null);

  const [pins, setPins] = useState<PinData[]>([]);
  const [selectedPin, setSelectedPin] = useState<PinData | null>(null);

  // 🔹 Filter state for pill
  const [filter, setFilter] = useState<PinFilter>('all');

  const [locationPermission, setLocationPermission] = useState(false);
  const mapRef = useRef<MapView | null>(null);

  const [navExpanded, setNavExpanded] = useState(false);
  const [placingManual, setPlacingManual] = useState(false);

  const chooserRef = useRef<AddPinChooserRef>(null);
  const searchRef = useRef<SearchBarRef>(null);

  // Force RN Maps to repaint custom markers after updates
  const [refreshMarkers, setRefreshMarkers] = useState(false);
  const nudgeMarkers = useCallback(() => {
    setRefreshMarkers(true);
    setTimeout(() => setRefreshMarkers(false), 600);
  }, []);

  const { focusPinId } = useLocalSearchParams<{ focusPinId?: string }>();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') setLocationPermission(true);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
        if (!modalShownThisSession.current) {
          setModalVisible(true);
          modalShownThisSession.current = true;
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user && resumeAfterAuth) {
      setSelectedPlace(resumeAfterAuth);
      setResumeAfterAuth(null);
    }
  }, [user, resumeAfterAuth]);

  useEffect(() => {
    const loadPins = async () => {
      if (!user?.uid) {
        setPins([]);
        return;
      }
      const snap = await getDocs(collection(firestore, 'users', user.uid, 'pins'));

      const loaded: PinData[] = snap.docs.map((d) => {
        const data = d.data() as any;

        // 🔹 Normalize visited/status for older docs
        const visitedNorm: boolean =
          typeof data.visited === 'boolean' ? data.visited : data.status === 'visited';
        const statusNorm: 'visited' | 'wishlist' = visitedNorm ? 'visited' : 'wishlist';

        return {
          id: d.id,
          name: data.name,
          lat: data.lat,
          lng: data.lng,
          createdAt: data.createdAt?.toDate?.(),
          priority: data.priority,
          color: data.color,
          shape: data.shape, // "default" | "flag" | "thin"
          tags: data.tags ?? [],
          notes: data.notes ?? '',
          todos: data.todos ?? [],
          visited: visitedNorm,
          status: statusNorm,
        } as PinData;
      });

      setPins(loaded);
    };
    loadPins();
  }, [user]);

  const handlePlaceSelect = (place: PlaceItem) => {
    setSelectedPlace(place);
    setSelectedPin(null);
    if (place.lat && place.lng && mapRef.current) {
      mapRef.current.animateToRegion(
        { latitude: place.lat, longitude: place.lng, latitudeDelta: 0.5, longitudeDelta: 0.5 },
        800
      );
    }
  };

  const confirmPin = useCallback(async () => {
    if (!selectedPlace?.lat || !selectedPlace.lng) return;

    if (!user?.uid) {
      setResumeAfterAuth(selectedPlace);
      setSelectedPlace(null);
      setModalVisible(true);
      return;
    }

    // New pins start as wishlist/ not visited
    const basePin: Omit<PinData, 'id'> & { visited?: boolean; status?: 'visited' | 'wishlist' } = {
      name: selectedPlace.description,
      lat: selectedPlace.lat,
      lng: selectedPlace.lng,
      createdAt: new Date(),
      priority: 0,
      color: DEFAULT_PIN_COLOR,
      shape: 'default',
      tags: [],
      notes: '',
      todos: [],
      visited: false,
      status: 'wishlist',
    };

    try {
      const ref = doc(collection(firestore, 'users', user.uid, 'pins'));
      await setDoc(ref, { ...basePin, createdAt: serverTimestamp() });
      setPins((prev) => [...prev, { ...basePin, id: ref.id } as PinData]);
      nudgeMarkers();
    } catch (err) {
      console.error('Error saving pin:', err);
    }

    setSelectedPlace(null);
  }, [selectedPlace, user, nudgeMarkers]);

  const handleSavePinPartial = useCallback(
    async (updated: Partial<PinData & { visited?: boolean; status?: 'visited' | 'wishlist' }>) => {
      if (!user?.uid || !selectedPin?.id) return;

      const ref = doc(firestore, 'users', user.uid, 'pins', selectedPin.id);
      const payload: any = { ...updated };
      if (Object.prototype.hasOwnProperty.call(updated, 'createdAt')) {
        const val = (updated as any).createdAt;
        payload.createdAt = val instanceof Date ? val : null;
      }

      try {
        await updateDoc(ref, payload as any);
      } catch {
        await setDoc(ref, payload as any, { merge: true });
      }

      // reflect changes locally
      setPins((prev) => prev.map((p) => (p.id === selectedPin.id ? { ...p, ...updated } : p)));
      setSelectedPin((prev) => (prev ? { ...prev, ...updated } as PinData : prev));
      nudgeMarkers();
    },
    [user, selectedPin, nudgeMarkers]
  );

  const handleDeletePin = useCallback(async () => {
    if (!user?.uid || !selectedPin?.id) return;
    try {
      const ref = doc(firestore, 'users', user.uid, 'pins', selectedPin.id);
      await deleteDoc(ref);
      setPins((prev) => prev.filter((p) => p.id !== selectedPin.id));
      setSelectedPin(null);
      nudgeMarkers();
    } catch (err) {
      console.error('Error deleting pin:', err);
    }
  }, [user, selectedPin, nudgeMarkers]);

  const isMenuOpen = !!selectedPin;

  const handleMapPress = (e: MapPressEvent) => {
    if (placingManual) {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setSelectedPlace({
        place_id: 'manual',
        description: 'Dropped Pin',
        lat: latitude,
        lng: longitude,
      });
      setPlacingManual(false);
      return;
    }
    if (selectedPin) setSelectedPin(null);
    if (selectedPlace) setSelectedPlace(null);
  };

  const handleExpandedChange = (expanded: boolean) => setNavExpanded(expanded);
  const openChooser = () => requestAnimationFrame(() => chooserRef.current?.open?.());

  const handleChooserAddBySearch = () => {
    setPlacingManual(false);
    setSelectedPin(null);
    setTimeout(() => searchRef.current?.focus?.(), 150);
  };
  const handleChooserAddManual = () => {
    setSelectedPin(null);
    setSelectedPlace(null);
    setPlacingManual(true);
  };

  const overlaysOpen = isMenuOpen || navExpanded;

  const centerOnPin = useCallback(
    async (pinId: string) => {
      try {
        let snap = null;
        if (user?.uid) {
          snap = await getDoc(doc(firestore, 'users', user.uid, 'pins', pinId));
          if (!snap.exists()) snap = null;
        }
        if (!snap) {
          const rootSnap = await getDoc(doc(firestore, 'pins', pinId));
          if (rootSnap.exists()) snap = rootSnap;
        }
        if (!snap?.exists()) return;

        const data = snap.data() as any;
        const lat = data?.lat ?? data?.latitude;
        const lng = data?.lng ?? data?.longitude;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        mapRef.current?.animateCamera(
          { center: { latitude: lat, longitude: lng }, zoom: 14, pitch: 0, heading: 0 },
          { duration: 600 }
        );

        const visitedNorm: boolean =
          typeof data.visited === 'boolean' ? data.visited : data.status === 'visited';
        const statusNorm: 'visited' | 'wishlist' = visitedNorm ? 'visited' : 'wishlist';

        const pinForMenu: PinData = {
          id: pinId,
          name: data?.name ?? 'Pinned Place',
          lat,
          lng,
          createdAt: data?.createdAt?.toDate?.() ?? new Date(),
          priority: data?.priority ?? 0,
          color: data?.color ?? DEFAULT_PIN_COLOR,
          shape: data?.shape ?? 'default',
          tags: data?.tags ?? [],
          notes: data?.notes ?? '',
          todos: data?.todos ?? [],
          visited: visitedNorm,
          status: statusNorm,
        };
        setSelectedPlace(null);
        setSelectedPin(pinForMenu);
      } catch (e) {
        console.warn('centerOnPin failed:', e);
      }
    },
    [user?.uid]
  );

  useEffect(() => {
    if (!focusPinId) return;
    centerOnPin(String(focusPinId));
    const t = setTimeout(() => {
      try {
        router.setParams({ focusPinId: undefined as any });
      } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [focusPinId, centerOnPin, router]);

  // 🔹 FINAL: the filter you asked for
  const filteredPins = useMemo(() => {
    if (filter === 'all') return pins;
    if (filter === 'visited') return pins.filter((p: any) => p.visited === true || p.status === 'visited');
    return pins.filter((p: any) => p.visited === false || p.status === 'wishlist');
  }, [pins, filter]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider="google"
        style={StyleSheet.absoluteFillObject}
        customMapStyle={customMapStyle}
        showsUserLocation={locationPermission}
        showsMyLocationButton
        initialRegion={{ latitude: 30.8283, longitude: -98.5795, latitudeDelta: 60, longitudeDelta: 30 }}
        rotateEnabled={false}
        pitchEnabled={false}
        onPress={handleMapPress}
      >
        {/* Temporary dropped/selected place preview */}
        {selectedPlace?.lat && selectedPlace.lng && (
          <Marker
            coordinate={{ latitude: selectedPlace.lat, longitude: selectedPlace.lng }}
            anchor={getAnchor('default')}
            tracksViewChanges={refreshMarkers}
          >
            <PinIcon shape="default" color="#9CA3AF" size={34} />
          </Marker>
        )}

        {/* Render FILTERED pins */}
        {filteredPins.map((pin: any) => (
          <Marker
            key={`${pin.id}-${pin.shape}-${pin.color}`}
            coordinate={{ latitude: pin.lat, longitude: pin.lng }}
            anchor={getAnchor(pin.shape as any)}
            tracksViewChanges={refreshMarkers}
            onPress={(e) => {
              e.stopPropagation?.();
              setSelectedPlace(null);
              setSelectedPin(pin);
            }}
          >
            <PinIcon
              shape={(pin.shape as any) || 'default'}
              color={pin.color || DEFAULT_PIN_COLOR}
              size={34}
            />
          </Marker>
        ))}
      </MapView>

      {/* 🔹 Pill toggle just above the nav bar */}
      <View style={[styles.pillWrap, { bottom: NAV_HEIGHT + insets.bottom + 16 }]}>
        <PinToggle value={filter} onChange={setFilter} />
      </View>

      {/* SearchBar */}
      <View
        style={[
          styles.searchContainer,
          (isMenuOpen || navExpanded) ? styles.searchUnder : styles.searchOver,
        ]}
        pointerEvents={(isMenuOpen || navExpanded) ? 'none' : 'auto'}
      >
        <SearchBar ref={searchRef} onPlaceSelect={handlePlaceSelect} />
      </View>

      {placingManual && (
        <View style={styles.manualHint}>
          <Text style={styles.manualHintText}>Tap anywhere on the map to drop a pin</Text>
        </View>
      )}

      {selectedPlace ? (
        <AddPinBanner onConfirm={confirmPin} onCancel={() => setSelectedPlace(null)} />
      ) : null}

      {/* Pin Menu */}
      {selectedPin ? (
        <View style={styles.sheetHost} pointerEvents="auto">
          <PinMenu
            pin={selectedPin}
            onClose={() => setSelectedPin(null)}
            onSave={handleSavePinPartial}
            onDelete={handleDeletePin}
          />
        </View>
      ) : null}

      <Nav onExpandedChange={handleExpandedChange} onOpenChooser={openChooser} />

      <AddPinChooser
        ref={chooserRef}
        onAddBySearch={handleChooserAddBySearch}
        onAddManual={handleChooserAddManual}
      />

      <AuthModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const AddPinBanner: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => {
  const slide = useRef(new Animated.Value(100)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [slide, fade]);

  return (
    <Animated.View
      style={[styles.bannerWrap, { transform: [{ translateY: slide }], opacity: fade }]}
      pointerEvents="auto"
    >
      <View style={styles.bannerInner}>
        <Text style={styles.bannerText}>Add this pin?</Text>
        <View style={styles.bannerButtons}>
          <TouchableOpacity onPress={onCancel} style={styles.bannerCancel}>
            <Text style={styles.bannerCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} style={styles.bannerAdd} activeOpacity={0.9}>
            <Text style={styles.bannerAddText}>Add Pin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },

  // Search at top
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 16 : 10,
    left: 20,
    right: 20,
  },
  searchOver: { zIndex: 8 },
  searchUnder: { zIndex: 0 },

  // Pill above nav
  pillWrap: {
    position: 'absolute',
    paddingBottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 0,
  },

  sheetHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },

  manualHint: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 95,
    left: 20, right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 12,
    zIndex: 6,
  },
  manualHintText: { color: '#fff', textAlign: 'center', fontWeight: '600' },

  bannerWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16 + NAV_HEIGHT + BANNER_EXTRA_OFFSET,
    zIndex: 6,
  },
  bannerCancelText: { color: '#333', fontWeight: '600' },
  bannerInner: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  bannerText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111' },
  bannerButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerCancel: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#f2f2f2' },
  bannerAdd: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#007AFF' },
  bannerAddText: { color: '#fff', fontWeight: '700' },
});