// components/SearchBar.tsx
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  Keyboard,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
// If you auth-protect your proxy, you can import auth and attach a bearer token
// import { auth } from '@/config/firebase';

export type SearchBarRef = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  dismiss: () => void;
};

const RECENT_KEY = 'planit_recent_searches';
const MAX_RECENT = 10;

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;
console.log('API_BASE =', API_BASE);
if (!API_BASE) {
  throw new Error('EXPO_PUBLIC_API_BASE_URL missing. Set it in Planit-app/.env');
}


interface PlaceItem {
  description: string;
  place_id: string;
  lat?: number;
  lng?: number;
  timestamp?: number;
}

interface SearchBarProps {
  onPlaceSelect: (place: PlaceItem) => void;
  onFocusChange?: (focused: boolean) => void;
}

function InnerSearchBar(
  { onPlaceSelect, onFocusChange }: SearchBarProps,
  ref: React.Ref<SearchBarRef>
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceItem[]>([]);
  const [recent, setRecent] = useState<PlaceItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      setQuery('');
      setResults([]);
      requestAnimationFrame(() => inputRef.current?.clear?.());
    },
    dismiss: () => {
      setIsFocused(false);
      setResults([]);
      Keyboard.dismiss();
      inputRef.current?.blur?.();
    },
  }));

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    const stored = await AsyncStorage.getItem(RECENT_KEY);
    setRecent(stored ? JSON.parse(stored) : []);
  };

  const saveRecent = async (item: PlaceItem) => {
    const itemWithTime = { ...item, timestamp: Date.now() };
    const current = [...recent.filter((i) => i.place_id !== item.place_id)];
    const next = [itemWithTime, ...current].slice(0, MAX_RECENT);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
    setRecent(next);
  };

  // guard against stale autocomplete responses
  const lastReqId = useRef(0);

  const fetchSuggestions = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }

    const reqId = ++lastReqId.current;

    try {
      // OPTIONAL: include Firebase auth if your proxy validates it
      // const token = await auth.currentUser?.getIdToken?.();
      // const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const res = await fetch(
        `${API_BASE}/api/autocomplete?input=${encodeURIComponent(text)}`
        // , { headers }
      );
      const data = await res.json();

      if (reqId !== lastReqId.current) return;

      if (data.status === 'OK' && Array.isArray(data.predictions)) {
        setResults(data.predictions);
      } else {
        setResults([{ description: 'No results found', place_id: 'no_results' }]);
      }
    } catch (err) {
      if (reqId !== lastReqId.current) return;
      console.error('Autocomplete error:', err);
      setResults([{ description: 'No results found', place_id: 'no_results' }]);
    }
  };

  const handleSelect = async (place: PlaceItem) => {
    if (place.place_id === 'no_results') return;

    Keyboard.dismiss();
    onPlaceSelect(place); // optimistic
    setResults([]);
    setIsFocused(false);
    onFocusChange?.(false);

    try {
      // OPTIONAL auth header as above
      // const token = await auth.currentUser?.getIdToken?.();
      // const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const res = await fetch(
        `${API_BASE}/api/autocomplete/details?place_id=${encodeURIComponent(place.place_id)}`
        // , { headers }
      );
      const data = await res.json();

      if (data.status === 'OK' && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        const item = { ...place, lat, lng };
        onPlaceSelect(item);
        setQuery(place.description);
        saveRecent(item);
      } else {
        console.warn('Place details not OK:', data?.status);
      }
    } catch (err) {
      console.error('Place details fetch error:', err);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults(recent);
  };

  const highlightMatch = (text: string, match: string) => {
    const i = text.toLowerCase().indexOf(match.toLowerCase());
    if (i === -1) return <Text style={styles.itemText}>{text}</Text>;

    const before = text.slice(0, i);
    const matchText = text.slice(i, i + match.length);
    const after = text.slice(i + match.length);

    return (
      <Text style={styles.itemText} numberOfLines={1}>
        {before}
        <Text style={{ fontWeight: 'bold' }}>{matchText}</Text>
        {after}
      </Text>
    );
  };

  const isPinned = (_placeId: string) => false;

  const renderSection = (data: PlaceItem[], title: string) => {
    if (data.length === 0) return null;
    return (
      <>
        <Text style={styles.sectionHeader}>{title}</Text>
        <FlatList
          data={data}
          keyExtractor={(item) => item.place_id}
          style={{ maxHeight: 140 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            if (item.place_id === 'no_results') {
              return (
                <View key={item.place_id} style={styles.item}>
                  <Text style={styles.itemText}>No results found</Text>
                </View>
              );
            }

            const icon = isPinned(item.place_id)
              ? 'pin-outline'
              : title === 'Recent'
              ? 'time-outline'
              : 'location-outline';

            return (
              <TouchableOpacity
                key={item.place_id}
                style={styles.item}
                onPress={() => handleSelect(item)}
                activeOpacity={0.6}
              >
                <Ionicons
                  name={icon}
                  size={18}
                  color="#555"
                  style={{ marginRight: 8, marginTop: 2 }}
                />
                {highlightMatch(item.description, query)}
              </TouchableOpacity>
            );
          }}
        />
      </>
    );
  };

  useEffect(() => {
    if (isFocused) {
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isFocused, dropdownAnim]);

  const handleReturnKey = () => {
    if (results.length > 0 && results[0].place_id !== 'no_results') {
      handleSelect(results[0]);
    }
  };

  // Only show dropdown when focused AND something to show
  const shouldShowDropdown =
    isFocused &&
    ((query.length < 3 && recent.length > 0) || results.length > 0);

  return (
    <TouchableWithoutFeedback
      onPressIn={() => {
        if (!isFocused) setIsFocused(true);
      }}
    >
      <View style={styles.wrapper}>
        <BlurView intensity={50} tint="light" style={styles.container}>
          <Ionicons name="search-outline" size={20} color="#555" style={styles.icon} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search destinations..."
            placeholderTextColor="#999"
            value={query}
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
            onFocus={() => {
              setIsFocused(true);
              onFocusChange?.(true);
              if (!query.trim()) setResults(recent);
            }}
            onBlur={() => {
              setIsFocused(false);
              onFocusChange?.(false);
              setResults([]);
            }}
            onChangeText={fetchSuggestions}
            returnKeyType="search"
            onSubmitEditing={handleReturnKey}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#888" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          )}
        </BlurView>

        {shouldShowDropdown && (
          <Animated.View
            style={[
              styles.dropdown,
              {
                opacity: dropdownAnim,
                transform: [
                  {
                    translateY: dropdownAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
            <View style={{ paddingTop: 8, paddingBottom: 4 }}>
              {query.length < 3
                ? renderSection(recent, 'Recent')
                : results.length === 0
                ? null
                : renderSection(results, 'Results')}
            </View>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(InnerSearchBar);
export default SearchBar;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    height: 50,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  dropdown: {
    position: 'absolute',
    top: '120%',
    width: '90%',
    borderRadius: 15,
    overflow: 'hidden',
    maxHeight: 200,
    backgroundColor: 'transparent',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
});