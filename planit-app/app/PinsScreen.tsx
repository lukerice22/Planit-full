import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import { auth, firestore } from "@/config/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import Nav from "@/components/Nav";

// Tag options (UI reference only)
const TAG_OPTIONS = [
  { label: 'Beach', color: '#4FC3F7', emoji: '🏖️' },
  { label: 'City', color: '#64B5F6', emoji: '🏙️' },
  { label: 'Food', color: '#FF7043', emoji: '🍜' },
  { label: 'Culture', color: '#BA68C8', emoji: '🎭' },
  { label: 'Adventure', color: '#26A69A', emoji: '🧗' },
  { label: 'Relax', color: '#81C784', emoji: '🧘' },
  { label: 'Hiking', color: '#8BC34A', emoji: '🥾' },
  { label: 'History', color: '#A1887F', emoji: '🏛️' },
  { label: 'Nightlife', color: '#7E57C2', emoji: '🌃' },
  { label: 'Shopping', color: '#F06292', emoji: '🛍️' },
  { label: 'Photography', color: '#FFD54F', emoji: '📸' },
  { label: 'Nature', color: '#81C784', emoji: '🌲' },
  { label: 'Roadtrip', color: '#90CAF9', emoji: '🚗' },
  { label: 'Waterfall', color: '#4DD0E1', emoji: '💦' },
];

// Continent mapping
const CONTINENT_MAP: { [key: string]: string } = {
  // North America
  'United States': 'North America',
  'Canada': 'North America',
  'Mexico': 'North America',
  'US': 'North America',
  'USA': 'North America',
  // Europe
  'United Kingdom': 'Europe',
  'France': 'Europe',
  'Germany': 'Europe',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'Netherlands': 'Europe',
  'Switzerland': 'Europe',
  'Austria': 'Europe',
  'Belgium': 'Europe',
  'Portugal': 'Europe',
  'Greece': 'Europe',
  'Norway': 'Europe',
  'Sweden': 'Europe',
  'Denmark': 'Europe',
  'Finland': 'Europe',
  'Iceland': 'Europe',
  'Ireland': 'Europe',
  'Poland': 'Europe',
  'Czech Republic': 'Europe',
  'Hungary': 'Europe',
  'Croatia': 'Europe',
  'Romania': 'Europe',
  'Bulgaria': 'Europe',
  'Slovakia': 'Europe',
  'Slovenia': 'Europe',
  'Estonia': 'Europe',
  'Latvia': 'Europe',
  'Lithuania': 'Europe',
  'Luxembourg': 'Europe',
  'Malta': 'Europe',
  'Cyprus': 'Europe',
  'Russia': 'Europe',
  'Ukraine': 'Europe',
  'Belarus': 'Europe',
  'Serbia': 'Europe',
  'Montenegro': 'Europe',
  'Bosnia and Herzegovina': 'Europe',
  'Albania': 'Europe',
  'North Macedonia': 'Europe',
  'Moldova': 'Europe',
  // Asia
  'China': 'Asia',
  'Japan': 'Asia',
  'India': 'Asia',
  'South Korea': 'Asia',
  'Thailand': 'Asia',
  'Vietnam': 'Asia',
  'Indonesia': 'Asia',
  'Malaysia': 'Asia',
  'Singapore': 'Asia',
  'Philippines': 'Asia',
  'Cambodia': 'Asia',
  'Laos': 'Asia',
  'Myanmar': 'Asia',
  'Nepal': 'Asia',
  'Sri Lanka': 'Asia',
  'Bangladesh': 'Asia',
  'Pakistan': 'Asia',
  'Afghanistan': 'Asia',
  'Iran': 'Asia',
  'Iraq': 'Asia',
  'Turkey': 'Asia',
  'Israel': 'Asia',
  'Jordan': 'Asia',
  'Lebanon': 'Asia',
  'Syria': 'Asia',
  'Saudi Arabia': 'Asia',
  'UAE': 'Asia',
  'Qatar': 'Asia',
  'Kuwait': 'Asia',
  'Bahrain': 'Asia',
  'Oman': 'Asia',
  'Yemen': 'Asia',
  'Kazakhstan': 'Asia',
  'Uzbekistan': 'Asia',
  'Kyrgyzstan': 'Asia',
  'Tajikistan': 'Asia',
  'Turkmenistan': 'Asia',
  'Mongolia': 'Asia',
  'North Korea': 'Asia',
  'Taiwan': 'Asia',
  'Hong Kong': 'Asia',
  'Macau': 'Asia',
  // Africa
  'South Africa': 'Africa',
  'Kenya': 'Africa',
  'Tanzania': 'Africa',
  'Uganda': 'Africa',
  'Rwanda': 'Africa',
  'Ethiopia': 'Africa',
  'Morocco': 'Africa',
  'Egypt': 'Africa',
  'Tunisia': 'Africa',
  'Algeria': 'Africa',
  'Libya': 'Africa',
  'Sudan': 'Africa',
  'Ghana': 'Africa',
  'Nigeria': 'Africa',
  'Senegal': 'Africa',
  'Mali': 'Africa',
  'Burkina Faso': 'Africa',
  'Niger': 'Africa',
  'Chad': 'Africa',
  'Cameroon': 'Africa',
  'Central African Republic': 'Africa',
  'Democratic Republic of the Congo': 'Africa',
  'Republic of the Congo': 'Africa',
  'Gabon': 'Africa',
  'Equatorial Guinea': 'Africa',
  'São Tomé and Príncipe': 'Africa',
  'Angola': 'Africa',
  'Zambia': 'Africa',
  'Zimbabwe': 'Africa',
  'Botswana': 'Africa',
  'Namibia': 'Africa',
  'Lesotho': 'Africa',
  'Eswatini': 'Africa',
  'Malawi': 'Africa',
  'Mozambique': 'Africa',
  'Madagascar': 'Africa',
  'Mauritius': 'Africa',
  'Seychelles': 'Africa',
  'Comoros': 'Africa',
  'Djibouti': 'Africa',
  'Eritrea': 'Africa',
  'Somalia': 'Africa',
  'South Sudan': 'Africa',
  'Ivory Coast': 'Africa',
  'Liberia': 'Africa',
  'Sierra Leone': 'Africa',
  'Guinea': 'Africa',
  'Guinea-Bissau': 'Africa',
  'Gambia': 'Africa',
  'Cape Verde': 'Africa',
  'Togo': 'Africa',
  'Benin': 'Africa',
  // South America
  'Brazil': 'South America',
  'Argentina': 'South America',
  'Chile': 'South America',
  'Peru': 'South America',
  'Colombia': 'South America',
  'Venezuela': 'South America',
  'Ecuador': 'South America',
  'Bolivia': 'South America',
  'Paraguay': 'South America',
  'Uruguay': 'South America',
  'Guyana': 'South America',
  'Suriname': 'South America',
  'French Guiana': 'South America',
  // Oceania
  'Australia': 'Oceania',
  'New Zealand': 'Oceania',
  'Papua New Guinea': 'Oceania',
  'Fiji': 'Oceania',
  'Solomon Islands': 'Oceania',
  'New Caledonia': 'Oceania',
  'French Polynesia': 'Oceania',
  'Vanuatu': 'Oceania',
  'Samoa': 'Oceania',
  'Micronesia': 'Oceania',
  'Tonga': 'Oceania',
  'Kiribati': 'Oceania',
  'Palau': 'Oceania',
  'Marshall Islands': 'Oceania',
  'Tuvalu': 'Oceania',
  'Nauru': 'Oceania',
  // Antarctica
  'Antarctica': 'Antarctica',
};

// Types
type TagOption = { label: string; color: string; emoji: string; };

type PinDoc = {
  id: string;
  userId?: string;
  name?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  address?: string;
  city?: string;
  country?: string;
  tags?: string[];        // <-- normalized to strings in this screen
  visited?: boolean;
  favorite?: boolean;
  priority?: number;
  createdAt?: any;
  updatedAt?: any;
  parentPinId?: string | null;
};

type SortKey = "newest" | "oldest" | "name" | "priority" | "visitedFirst" | "distance";
type FilterType = "all" | "visited" | "wishlist" | "favorites";

const PREF_SORT_KEY = "pins_sort_pref_v2";
const PREF_FILTER_KEY = "pins_filter_pref_v2";

export default function PinsScreen() {
  const router = useRouter();

  // Auth uid
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);

  // Data
  const [pins, setPins] = useState<PinDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedContinents, setSelectedContinents] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  // Selection mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'status' | 'tags' | 'location' | 'sort'>('status');

  // Location
  const [hasLocationPerm, setHasLocationPerm] = useState<boolean | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Pin detail modal
  const [selectedPin, setSelectedPin] = useState<PinDoc | null>(null);
  const [showPinDetail, setShowPinDetail] = useState(false);

  // Quick edit modal
  const [editPin, setEditPin] = useState<PinDoc | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Auth state sync
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return unsub;
  }, []);

  // Firestore subscription (normalize tags to string[])
  useEffect(() => {
    if (!uid) {
      setPins([]);
      setLoading(false);
      return;
    }
    const colRef = collection(firestore, "users", uid, "pins");
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const data: PinDoc[] = snap.docs.map((d) => {
          const raw = d.data() as any;
          const latitude = typeof raw.latitude === "number" ? raw.latitude : raw.lat;
          const longitude = typeof raw.longitude === "number" ? raw.longitude : raw.lng;
          return {
            id: d.id,
            ...raw,
            latitude,
            longitude,
            tags: normalizeTags(raw.tags), // ← guarantees string[]
          };
        });
        setPins(data);
        setLoading(false);
      },
      (err) => {
        console.error("onSnapshot error (pins subcollection)", err);
        setLoading(false);
        Alert.alert("Error", "Couldn't load your pins. Check permissions.");
      }
    );
    return () => unsub();
  }, [uid]);

  // Load preferences
  useEffect(() => {
    (async () => {
      try {
        const savedSort = await AsyncStorage.getItem(PREF_SORT_KEY);
        const savedFilter = await AsyncStorage.getItem(PREF_FILTER_KEY);
        if (savedSort) setSortKey(savedSort as SortKey);
        if (savedFilter) {
          const parsed = JSON.parse(savedFilter);
          if (parsed?.status) setStatusFilter(parsed.status);
          if (parsed?.tags) setSelectedTags(parsed.tags);
          if (parsed?.countries) setSelectedCountries(parsed.countries);
          if (parsed?.continents) setSelectedContinents(parsed.continents);
        }
      } catch {}
    })();
  }, []);

  // Save preferences
  useEffect(() => {
    AsyncStorage.setItem(PREF_SORT_KEY, sortKey).catch(() => {});
  }, [sortKey]);

  useEffect(() => {
    AsyncStorage.setItem(
      PREF_FILTER_KEY,
      JSON.stringify({
        status: statusFilter,
        tags: selectedTags,
        countries: selectedCountries,
        continents: selectedContinents,
      })
    ).catch(() => {});
  }, [statusFilter, selectedTags, selectedCountries, selectedContinents]);

  // Location permission for distance sort
  useEffect(() => {
    if (sortKey !== "distance") return;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setHasLocationPerm(false);
          return;
        }
        setHasLocationPerm(true);
        const loc = await Location.getCurrentPositionAsync({});
        setUserCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch {
        setHasLocationPerm(false);
      }
    })();
  }, [sortKey]);

  const getTagInfo = useCallback((tagName: string): TagOption | null => {
    return TAG_OPTIONS.find(t => t.label === tagName) || null;
  }, []);

  const getContinent = useCallback((country: string): string => {
    return CONTINENT_MAP[country] || 'Unknown';
  }, []);

  // Derived data for filters
  const availableTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    pins.forEach((p) => {
      p.tags?.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [pins]);

  const availableCountries = useMemo(() => {
    const countryCounts: Record<string, number> = {};
    pins.forEach((p) => {
      if (p.country) {
        countryCounts[p.country] = (countryCounts[p.country] || 0) + 1;
      }
    });
    return Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => ({ country, count }));
  }, [pins]);

  const availableContinents = useMemo(() => {
    const continentCounts: Record<string, number> = {};
    pins.forEach((p) => {
      if (p.country) {
        const continent = getContinent(p.country);
        continentCounts[continent] = (continentCounts[continent] || 0) + 1;
      }
    });
    return Object.entries(continentCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([continent, count]) => ({ continent, count }));
  }, [pins, getContinent]);

  // Filtering, searching, sorting
  const filteredSortedPins = useMemo(() => {
    const searchTerms = search.trim().toLowerCase().split(/\s+/).filter(t => t.length > 0);

    let list = pins.filter((p) => {
      if (statusFilter === "visited" && !p.visited) return false;
      if (statusFilter === "wishlist" && p.visited) return false;
      if (statusFilter === "favorites" && !p.favorite) return false;

      if (selectedTags.length) {
        const pinTags = new Set(p.tags || []);
        for (const tag of selectedTags) {
          if (!pinTags.has(tag)) return false;
        }
      }

      if (selectedCountries.length && (!p.country || !selectedCountries.includes(p.country))) {
        return false;
      }

      if (selectedContinents.length) {
        if (!p.country) return false;
        const continent = getContinent(p.country);
        if (!selectedContinents.includes(continent)) return false;
      }

      if (searchTerms.length) {
        const searchableText = [
          p.name ?? "",
          p.notes ?? "",
          p.address ?? "",
          p.city ?? "",
          p.country ?? "",
          (p.tags || []).join(" "),
        ].join(" ").toLowerCase();

        for (const term of searchTerms) {
          if (!searchableText.includes(term)) return false;
        }
      }

      return true;
    });

    const byName = (a: PinDoc, b: PinDoc) => (a.name || "").localeCompare(b.name || "");
    const byDate = (k: "createdAt" | "updatedAt") => (a: PinDoc, b: PinDoc) =>
      ((b[k]?.seconds ?? 0) - (a[k]?.seconds ?? 0));
    const byPriority = (a: PinDoc, b: PinDoc) => (a.priority ?? 3) - (b.priority ?? 3);
    const byVisitedFirst = (a: PinDoc, b: PinDoc) =>
      Number(b.visited ?? false) - Number(a.visited ?? false);
    const byDistance = (a: PinDoc, b: PinDoc) => {
      if (!userCoords) return 0;
      const da = distanceKm(userCoords.lat, userCoords.lng, a.latitude, a.longitude);
      const db = distanceKm(userCoords.lat, userCoords.lng, b.latitude, b.longitude);
      return da - db;
    };

    switch (sortKey) {
      case "name":
        list.sort(byName);
        break;
      case "oldest":
        list.sort((a, b) => -byDate("createdAt")(a, b));
        break;
      case "priority":
        list.sort(byPriority);
        break;
      case "visitedFirst":
        list.sort(byVisitedFirst);
        break;
      case "distance":
        list.sort(byDistance);
        break;
      case "newest":
      default:
        list.sort(byDate("createdAt"));
        break;
    }

    return list;
  }, [pins, search, statusFilter, selectedTags, selectedCountries, selectedContinents, sortKey, userCoords, getContinent]);

  // Selection helpers
  const toggleSelectMode = useCallback(() => {
    setSelectMode((s) => !s);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Firestore helpers
  const pinDocRef = useCallback(
    (id: string) => {
      if (!uid) throw new Error("Missing user");
      return doc(firestore, "users", uid, "pins", id);
    },
    [uid]
  );

  // Actions
  const confirmDeleteOne = useCallback(
    (pin: PinDoc) => {
      Alert.alert("Delete pin", `Delete "${pin.name || "Untitled"}"?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(pinDocRef(pin.id));
              if (selectedPin?.id === pin.id) {
                setShowPinDetail(false);
                setSelectedPin(null);
              }
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Could not delete pin");
            }
          },
        },
      ]);
    },
    [pinDocRef, selectedPin]
  );

  const toggleVisited = useCallback(
    async (pin: PinDoc) => {
      try {
        await updateDoc(pinDocRef(pin.id), {
          visited: !pin.visited,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Could not update pin");
      }
    },
    [pinDocRef]
  );

  const toggleFavorite = useCallback(
    async (pin: PinDoc) => {
      try {
        await updateDoc(pinDocRef(pin.id), {
          favorite: !pin.favorite,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Could not update favorite");
      }
    },
    [pinDocRef]
  );

  const bulkUpdateVisited = useCallback(
    async (ids: string[], value: boolean) => {
      try {
        if (!uid) throw new Error("Missing user");
        const batch = writeBatch(firestore);
        ids.forEach((id) => {
          batch.update(doc(firestore, "users", uid, "pins", id), {
            visited: value,
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
        setSelectedIds(new Set());
        setSelectMode(false);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Could not update selected pins");
      }
    },
    [uid]
  );

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      Alert.alert("Delete pins", `Delete ${ids.length} selected pins?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!uid) throw new Error("Missing user");
              const batch = writeBatch(firestore);
              ids.forEach((id) => batch.delete(doc(firestore, "users", uid, "pins", id)));
              await batch.commit();
              setSelectedIds(new Set());
              setSelectMode(false);
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Could not delete selected pins");
            }
          },
        },
      ]);
    },
    [uid]
  );

  const exportSelected = useCallback(
    async (ids: string[]) => {
      try {
        const subset = pins.filter((p) => ids.includes(p.id));
        const payload = JSON.stringify(
          subset.map((p) => ({
            id: p.id,
            name: p.name || "",
            notes: p.notes || "",
            latitude: p.latitude ?? null,
            longitude: p.longitude ?? null,
            address: p.address || "",
            city: p.city || "",
            country: p.country || "",
            tags: p.tags || [],
            visited: !!p.visited,
            favorite: !!p.favorite,
            priority: p.priority ?? 3,
            createdAt: p.createdAt?.seconds ?? null,
            updatedAt: p.updatedAt?.seconds ?? null,
          })),
          null,
          2
        );

        const { Share } = await import("react-native");
        await Share.share({ message: payload });
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Could not export pins");
      }
    },
    [pins]
  );

  const openMapWithPin = useCallback(
    (pin: PinDoc) => {
      router.push({
        pathname: "/(tabs)",
        params: { focusPinId: pin.id, centerOffset: "high" },
      });
    },
    [router]
  );

  const openPinDetail = useCallback((pin: PinDoc) => {
    setSelectedPin(pin);
    setShowPinDetail(true);
  }, []);

  const startEdit = useCallback((pin: PinDoc) => {
    setEditPin(pin);
    setEditName(pin.name || "");
    setEditNotes(pin.notes || "");
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editPin) return;
    try {
      await updateDoc(pinDocRef(editPin.id), {
        name: editName.trim() || "Untitled",
        notes: editNotes.trim(),
        updatedAt: serverTimestamp(),
      });
      setEditPin(null);
      if (selectedPin?.id === editPin.id) {
        setSelectedPin({
          ...selectedPin,
          name: editName.trim() || "Untitled",
          notes: editNotes.trim(),
        });
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not save changes");
    }
  }, [editPin, editName, editNotes, pinDocRef, selectedPin]);

  const cancelEdit = useCallback(() => setEditPin(null), []);

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setSelectedTags([]);
    setSelectedCountries([]);
    setSelectedContinents([]);
    setSortKey("newest");
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (statusFilter !== "all") count++;
    if (selectedTags.length) count++;
    if (selectedCountries.length) count++;
    if (selectedContinents.length) count++;
    if (sortKey !== "newest") count++;
    return count;
  }, [search, statusFilter, selectedTags, selectedCountries, selectedContinents, sortKey]);

  const filterTabs = [
    { key: 'status', label: 'Status', icon: 'checkmark-circle-outline' },
    { key: 'tags', label: 'Tags', icon: 'pricetag-outline' },
    { key: 'location', label: 'Location', icon: 'location-outline' },
    { key: 'sort', label: 'Sort', icon: 'funnel-outline' },
  ];

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          placeholder="Search pins..."
          placeholderTextColor="#595959" 
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} style={styles.clearSearchBtn}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Ionicons name="options-outline" size={20} color={activeFilterCount > 0 ? "#007aff" : "#666"} />
        {activeFilterCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderFilterSection = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filterSection}>
        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, activeFilterTab === tab.key && styles.filterTabActive]}
              onPress={() => setActiveFilterTab(tab.key as any)}
            >
              <Ionicons name={tab.icon as any} size={16} color={activeFilterTab === tab.key ? "#007aff" : "#666"} />
              <Text style={[styles.filterTabText, activeFilterTab === tab.key && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <View style={styles.filterContent}>
          {activeFilterTab === 'status' && (
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Show pins that are:</Text>
              <View style={styles.statusOptions}>
                {[
                  { key: "all", label: "All pins", icon: "list-outline" },
                  { key: "visited", label: "Visited", icon: "checkmark-circle" },
                  { key: "wishlist", label: "On wishlist", icon: "bookmark-outline" },
                  { key: "favorites", label: "Favorited", icon: "star" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.statusOption, statusFilter === option.key && styles.statusOptionActive]}
                    onPress={() => setStatusFilter(option.key as FilterType)}
                  >
                    <Ionicons name={option.icon as any} size={20} color={statusFilter === option.key ? "#007aff" : "#666"} />
                    <Text style={[styles.statusOptionText, statusFilter === option.key && styles.statusOptionTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {activeFilterTab === 'tags' && (
            <View style={styles.filterGroup}>
              <View style={styles.filterLabelRow}>
                <Text style={styles.filterLabel}>Filter by tags:</Text>
                {selectedTags.length > 0 && (
                  <TouchableOpacity onPress={() => setSelectedTags([])}>
                    <Text style={styles.clearText}>Clear ({selectedTags.length})</Text>
                  </TouchableOpacity>
                )}
              </View>
              {availableTags.length > 0 ? (
                <View style={styles.tagGrid}>
                  {availableTags.map(({ tag, count }) => {
                    const tagInfo = getTagInfo(tag);
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.tagOption,
                          isSelected && styles.tagOptionActive,
                          tagInfo && { borderColor: tagInfo.color + '60' },
                        ]}
                        onPress={() =>
                          setSelectedTags((prev) =>
                            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                          )
                        }
                      >
                        <View style={styles.tagOptionContent}>
                          {tagInfo && (
                            <View style={[styles.tagEmoji, { backgroundColor: tagInfo.color + '20' }]}>
                              <Text style={styles.tagEmojiText}>{tagInfo.emoji}</Text>
                            </View>
                          )}
                          <Text style={[styles.tagOptionText, isSelected && styles.tagOptionTextActive]}>{tag}</Text>
                        </View>
                        <Text style={styles.tagCount}>({count})</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyText}>No tags found in your pins</Text>
              )}
            </View>
          )}

          {activeFilterTab === 'location' && (
            <View style={styles.filterGroup}>
              {/* Countries */}
              <View style={styles.locationSection}>
                <View style={styles.filterLabelRow}>
                  <Text style={styles.filterLabel}>Countries:</Text>
                  {selectedCountries.length > 0 && (
                    <TouchableOpacity onPress={() => setSelectedCountries([])}>
                      <Text style={styles.clearText}>Clear ({selectedCountries.length})</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {availableCountries.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.locationScroll}>
                    {availableCountries.map(({ country, count }) => (
                      <TouchableOpacity
                        key={country}
                        style={[styles.locationChip, selectedCountries.includes(country) && styles.locationChipActive]}
                        onPress={() =>
                          setSelectedCountries((prev) =>
                            prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
                          )
                        }
                      >
                        <Text style={[styles.locationChipText, selectedCountries.includes(country) && styles.locationChipTextActive]}>
                          {country}
                        </Text>
                        <Text style={styles.locationCount}>({count})</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.emptyText}>No countries found</Text>
                )}
              </View>

              {/* Continents */}
              <View style={styles.locationSection}>
                <View style={styles.filterLabelRow}>
                  <Text style={styles.filterLabel}>Continents:</Text>
                  {selectedContinents.length > 0 && (
                    <TouchableOpacity onPress={() => setSelectedContinents([])}>
                      <Text style={styles.clearText}>Clear ({selectedContinents.length})</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {availableContinents.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.locationScroll}>
                    {availableContinents.map(({ continent, count }) => (
                      <TouchableOpacity
                        key={continent}
                        style={[styles.locationChip, selectedContinents.includes(continent) && styles.locationChipActive]}
                        onPress={() =>
                          setSelectedContinents((prev) =>
                            prev.includes(continent) ? prev.filter((c) => c !== continent) : [...prev, continent]
                          )
                        }
                      >
                        <Text style={[styles.locationChipText, selectedContinents.includes(continent) && styles.locationChipTextActive]}>
                          {continent}
                        </Text>
                        <Text style={styles.locationCount}>({count})</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.emptyText}>No continents found</Text>
                )}
              </View>
            </View>
          )}

          {activeFilterTab === 'sort' && (
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Sort pins by:</Text>
              <View style={styles.sortOptions}>
                {[
                  { key: "newest", label: "Newest first", icon: "time-outline" },
                  { key: "oldest", label: "Oldest first", icon: "time-outline" },
                  { key: "name", label: "Name A-Z", icon: "text-outline" },
                  { key: "priority", label: "Priority", icon: "flag-outline" },
                  { key: "visitedFirst", label: "Visited first", icon: "checkmark-circle-outline" },
                  { key: "distance", label: "Distance", icon: "navigate-outline" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.sortOption, sortKey === option.key && styles.sortOptionActive]}
                    onPress={() => setSortKey(option.key as SortKey)}
                  >
                    <Ionicons name={option.icon as any} size={18} color={sortKey === option.key ? "#007aff" : "#666"} />
                    <Text style={[styles.sortOptionText, sortKey === option.key && styles.sortOptionTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {activeFilterCount > 0 && (
          <TouchableOpacity style={styles.clearAllBtn} onPress={clearAllFilters}>
            <Ionicons name="refresh-outline" size={16} color="#007aff" />
            <Text style={styles.clearAllText}>Clear all filters & sorting</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: PinDoc }) => {
    const selected = selectedIds.has(item.id);
    return (
      <GestureHandlerRootView>
        <Swipeable
          renderLeftActions={() => (
            <SwipeAction color="#e7f1ff" icon="map-outline" text="Map" onPress={() => openMapWithPin(item)} />
          )}
          renderRightActions={() => (
            <View style={{ flexDirection: "row" }}>
              <SwipeAction
                color="#e8ffe7"
                icon={item.visited ? "refresh-outline" : "checkmark-outline"}
                text={item.visited ? "Unvisit" : "Visited"}
                onPress={() => toggleVisited(item)}
              />
              <SwipeAction
                color="#ffe8e8"
                icon="trash-outline"
                text="Delete"
                onPress={() => confirmDeleteOne(item)}
              />
            </View>
          )}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (selectMode) toggleSelect(item.id);
              else openPinDetail(item);
            }}
            onLongPress={() => {
              if (!selectMode) setSelectMode(true);
              toggleSelect(item.id);
            }}
            style={[styles.card, selected && styles.cardSelected]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name || "Untitled"}
                </Text>
                {item.visited ? (
                  <View style={styles.visitedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#0a7f00" />
                    <Text style={styles.badgeText}>Visited</Text>
                  </View>
                ) : (
                  <View style={styles.wishlistBadge}>
                    <Ionicons name="bookmark-outline" size={12} color="#0066cc" />
                    <Text style={styles.badgeText}>Wishlist</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.favoriteBtn}>
                <Ionicons
                  name={item.favorite ? "star" : "star-outline"}
                  size={20}
                  color={item.favorite ? "#f5a524" : "#999"}
                />
              </TouchableOpacity>
            </View>

            {!!item.notes && (
              <Text style={styles.cardNotes} numberOfLines={2}>
                {item.notes}
              </Text>
            )}

            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.city && item.country ? `${item.city}, ${item.country}` :
                   item.country || item.city || "Unknown location"}
                </Text>
              </View>
              {userCoords && isValidLatLng(item.latitude, item.longitude) && (
                <View style={styles.metaItem}>
                  <Ionicons name="navigate-outline" size={14} color="#666" />
                  <Text style={styles.metaText}>
                    {distanceLabel(distanceKm(userCoords.lat, userCoords.lng, item.latitude, item.longitude))}
                  </Text>
                </View>
              )}
            </View>

            {!!item.tags?.length && (
              <View style={styles.cardTags}>
                {item.tags.slice(0, 3).map((tag) => {
                  const tagInfo = getTagInfo(tag);
                  return (
                    <View
                      key={tag}
                      style={[
                        styles.cardTag,
                        tagInfo && { backgroundColor: tagInfo.color + '20' }
                      ]}
                    >
                      {tagInfo && <Text style={styles.cardTagEmoji}>{tagInfo.emoji}</Text>}
                      <Text style={styles.cardTagText}>{tag}</Text>
                    </View>
                  );
                })}
                {item.tags.length > 3 && (
                  <View style={styles.cardTag}>
                    <Text style={styles.cardTagText}>+{item.tags.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  const renderSelectionBar = () => {
    if (!selectMode) return null;

    return (
      <View style={styles.selectionBar}>
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>{selectedIds.size} selected</Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity onPress={() => setSelectedIds(new Set(filteredSortedPins.map(p => p.id)))} style={styles.selectionBtn}>
              <Text style={styles.selectionBtnText}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedIds(new Set())} style={styles.selectionBtn}>
              <Text style={styles.selectionBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bulkActions}>
          <TouchableOpacity
            style={styles.bulkActionBtn}
            onPress={() => bulkUpdateVisited(Array.from(selectedIds), true)}
            disabled={selectedIds.size === 0}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#007aff" />
            <Text style={styles.bulkActionText}>Mark Visited</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bulkActionBtn}
            onPress={() => exportSelected(Array.from(selectedIds))}
            disabled={selectedIds.size === 0}
          >
            <Ionicons name="share-outline" size={18} color="#007aff" />
            <Text style={styles.bulkActionText}>Export</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bulkActionBtn, styles.deleteActionBtn]}
            onPress={() => bulkDelete(Array.from(selectedIds))}
            disabled={selectedIds.size === 0}
          >
            <Ionicons name="trash-outline" size={18} color="#dc3545" />
            <Text style={[styles.bulkActionText, styles.deleteActionText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    const hasFilters = search.trim() || statusFilter !== "all" || selectedTags.length > 0 ||
                      selectedCountries.length > 0 || selectedContinents.length > 0;

    return (
      <View style={styles.emptyState}>
        <Ionicons name={hasFilters ? "search-outline" : "location-outline"} size={48} color="#ccc" />
        <Text style={styles.emptyTitle}>
          {hasFilters ? "No pins match your filters" : "No pins yet"}
        </Text>
        <Text style={styles.emptyText}>
          {hasFilters ? "Try adjusting your search or filters" : "Add your first pin to get started"}
        </Text>
        {hasFilters ? (
          <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearAllFilters}>
            <Text style={styles.clearFiltersBtnText}>Clear all filters</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.addPinBtn} onPress={() => router.push("/add-pin")}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addPinBtnText}>Add Pin</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Loading and auth states
  if (!uid) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="lock-closed-outline" size={48} color="#666" />
          <Text style={styles.centerText}>Sign in to view your pins</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007aff" />
          <Text style={[styles.centerText, { marginTop: 16 }]}>Loading your pins...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Pins</Text>
          <Text style={styles.headerSubtitle}>
            {filteredSortedPins.length} of {pins.length} pins
          </Text>
        </View>

        <View style={styles.headerActions}>
          {selectMode ? (
            <TouchableOpacity onPress={toggleSelectMode} style={styles.headerBtn}>
              <Ionicons name="close-outline" size={24} color="#007aff" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={toggleSelectMode} style={styles.headerBtn}>
                <Ionicons name="checkbox-outline" size={22} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/add-pin")} style={styles.headerBtn}>
                <Ionicons name="add-outline" size={24} color="#666" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Search + Filters */}
      {renderSearchBar()}
      {renderFilterSection()}

      {/* Selection Bar */}
      {renderSelectionBar()}

      {/* Pins List */}
      <FlatList
        data={filteredSortedPins}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContainer,
          filteredSortedPins.length === 0 && styles.listContainerEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      {/* Edit Modal */}
      <Modal visible={!!editPin} transparent animationType="slide" onRequestClose={cancelEdit}>
        <View style={styles.modalBackdrop}>
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Pin</Text>
              <TouchableOpacity onPress={cancelEdit}>
                <Ionicons name="close-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  placeholder="Enter pin name"
                  value={editName}
                  onChangeText={setEditName}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  placeholder="Add some notes..."
                  value={editNotes}
                  onChangeText={setEditNotes}
                  style={[styles.textInput, styles.textArea]}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Navigation */}
      <Nav onExpandedChange={() => {}} onOpenChooser={() => {}} />
    </SafeAreaView>
  );
}

/* Helpers */

function normalizeTags(input: any): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((t) =>
      typeof t === 'string'
        ? t
        : t && typeof t === 'object' && 'label' in t
        ? String((t as any).label)
        : null
    )
    .filter(Boolean) as string[];
}

function isValidLatLng(lat?: number, lng?: number) {
  return typeof lat === "number" && typeof lng === "number";
}

function distanceKm(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number {
  if (!isValidLatLng(lat1, lon1) || !isValidLatLng(lat2, lon2)) return Number.POSITIVE_INFINITY;
  const R = 6371;
  const dLat = toRad((lat2 as number) - (lat1 as number));
  const dLon = toRad((lon2 as number) - (lon1 as number));
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1 as number)) * Math.cos(toRad(lat2 as number)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function toRad(v: number) { return (v * Math.PI) / 180; }

function distanceLabel(km: number) {
  if (!isFinite(km)) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function formatCoords(lat?: number, lng?: number) {
  if (!isValidLatLng(lat, lng)) return "No coordinates";
  const f = (v: number) => v.toFixed(4);
  return `${f(lat as number)}, ${f(lng as number)}`;
}

/* Swipe Action */
function SwipeAction({
  color,
  icon,
  text,
  onPress,
}: {
  color: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.swipeAction, { backgroundColor: color }]}
    >
      <Ionicons name={icon} size={22} color="#333" />
      <Text style={styles.swipeActionText}>{text}</Text>
    </TouchableOpacity>
  );
}
/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
  },
  
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  
  centerText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#f8f9fb",
  },
  
  headerLeft: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
  },
  
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  
  headerBtn: {
    padding: 4,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111",
  },
  
  clearSearchBtn: {
    padding: 4,
  },
  
  filterBtn: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: "relative",
  },
  
  filterBtnActive: {
    backgroundColor: "#f0f8ff",
  },
  
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#007aff",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },

  // Filter Section
  filterSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingTop: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Filter Tabs
  filterTabs: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },

  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },

  filterTabActive: {
    backgroundColor: "#e7f3ff",
  },

  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },

  filterTabTextActive: {
    color: "#007aff",
  },

  // Filter Content
  filterContent: {
    paddingHorizontal: 16,
  },

  filterGroup: {
    marginBottom: 20,
  },
  
  filterLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  
  filterLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  
  clearText: {
    fontSize: 14,
    color: "#007aff",
    fontWeight: "600",
  },

  emptyText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },

  // Status Options
  statusOptions: {
    gap: 12,
  },

  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },

  statusOptionActive: {
    backgroundColor: "#e7f3ff",
  },

  statusOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },

  statusOptionTextActive: {
    color: "#007aff",
  },

  // Tag Options
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  tagOption: {
    backgroundColor: "#f8f9fb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e6ed",
    marginBottom: 8,
  },

  tagOptionActive: {
    borderWidth: 2,
    backgroundColor: "#f0f8ff",
  },

  tagOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },

  tagEmoji: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  tagEmojiText: {
    fontSize: 12,
  },

  tagOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },

  tagOptionTextActive: {
    color: "#111",
  },

  tagCount: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
  },

  // Location Options
  locationSection: {
    marginBottom: 16,
  },

  locationScroll: {
    gap: 8,
    paddingRight: 8,
  },

  locationChip: {
    backgroundColor: "#f8f9fb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e6ed",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  locationChipActive: {
    backgroundColor: "#e7f3ff",
    borderColor: "#007aff",
  },

  locationChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
  },

  locationChipTextActive: {
    color: "#007aff",
  },

  locationCount: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
  },

  // Sort Options
  sortOptions: {
    gap: 8,
  },

  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },

  sortOptionActive: {
    backgroundColor: "#e7f3ff",
  },

  sortOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },

  sortOptionTextActive: {
    color: "#007aff",
  },
  
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  
  clearAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007aff",
  },

  // Selection Bar
  selectionBar: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  
  selectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  
  selectionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  
  selectionActions: {
    flexDirection: "row",
    gap: 12,
  },
  
  selectionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f5f7fa",
    borderRadius: 8,
  },
  
  selectionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007aff",
  },
  
  bulkActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  
  bulkActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  
  deleteActionBtn: {
    backgroundColor: "#fff5f5",
  },
  
  bulkActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007aff",
  },
  
  deleteActionText: {
    color: "#dc3545",
  },

  // List
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 100,
  },
  
  listContainerEmpty: {
    flex: 1,
    justifyContent: "center",
  },

  // Card
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  
  cardSelected: {
    borderWidth: 2,
    borderColor: "#007aff",
    backgroundColor: "#f0f8ff",
  },
  
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
    marginRight: 8,
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    flex: 1,
  },
  
  visitedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  
  wishlistBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7f3ff",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },

  favoriteBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8e1",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },

  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#333",
  },
  
  favoriteBtn: {
    padding: 4,
  },
  
  cardNotes: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
  },
  
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  
  metaText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  
  cardTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  
  cardTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  
  cardTagEmoji: {
    fontSize: 12,
  },
  
  cardTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#444",
  },

  // Pin Detail Modal
  pinDetailModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    flex: 1,
    marginTop: 60,
  },

  pinDetailHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
  },

  pinDetailTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  pinDetailTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
    flex: 1,
    marginRight: 16,
  },

  closeBtn: {
    padding: 4,
  },

  pinDetailBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  pinDetailContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  detailSection: {
    marginVertical: 16,
  },

  detailSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },

  detailNotes: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
  },

  locationDetails: {
    gap: 8,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  locationText: {
    fontSize: 15,
    color: "#444",
    flex: 1,
  },

  detailTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  detailTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "#e0e6ed",
  },

  detailTagEmoji: {
    fontSize: 16,
  },

  detailTagText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },

  dateDetails: {
    gap: 8,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  dateText: {
    fontSize: 15,
    color: "#666",
  },

  pinDetailActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f2f5",
    gap: 12,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fb",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
  },

  deleteActionButton: {
    backgroundColor: "#fff5f5",
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007aff",
  },

  deleteActionText: {
    color: "#dc3545",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    marginTop: 16,
    textAlign: "center",
  },
  
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  
  addPinBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007aff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },
  
  addPinBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  
  clearFiltersBtn: {
    backgroundColor: "#f5f7fa",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  
  clearFiltersBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007aff",
  },

  // FAB
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007aff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  // Edit Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  
  editModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  
  modalContent: {
    padding: 20,
  },
  
  inputGroup: {
    marginBottom: 20,
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  
  textInput: {
    backgroundColor: "#f8f9fb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111",
    borderWidth: 1,
    borderColor: "#e0e6ed",
  },
  
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  
  cancelBtn: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#666",
  },
  
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007aff",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  // Swipe Actions
  swipeAction: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  
  swipeActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },
});