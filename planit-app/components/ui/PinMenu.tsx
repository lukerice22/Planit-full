import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
  Linking,
  Switch,
  Alert,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// import PinIcon (adjust path if your folders differ)
import PinIcon from '../PinIcon';

export interface TagOption {
  label: string;
  color: string;
  emoji?: string;
}
export interface TodoItem {
  text: string;
  done: boolean;
}

export interface PinData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  createdAt?: Date;
  priority?: number;
  color?: string;
  shape?: string;
  tags?: TagOption[];
  notes?: string;
  todos?: TodoItem[];
}

export interface PinMenuProps {
  pin: PinData;
  onClose: () => void;
  onSave: (updated: Partial<PinData>) => void;
  onDelete: () => void;
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
  primary: '#007AFF',
  danger: '#E74C3C',
  gold: '#F1C40F',
  success: '#2ECC71',
  text: '#111',
  textLight: '#333',
  muted: '#777',
  mutedLight: '#999',
  separator: '#E5E5EA',
  background: '#F8F9FA',
  cardBg: '#FFFFFF',
};

// 8-color palette
const MARKER_PALETTE = ['#C41E3A','#FF6600','#FFEA00','#4CBB17','#3BC3F5','#9B59B6','#000000','#FFFFFF'];

// shapes available to pick
const SHAPES = ['default', 'flag', 'thin'] as const;
type ShapeOption = typeof SHAPES[number];

const TAG_OPTIONS: TagOption[] = [
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

const NAV_HEIGHT = 72;

const PriorityStars: React.FC<{ value: number; onChange: (n: number) => void }> = ({ value, onChange }) => {
  const scales = useRef([...Array(5)].map(() => new Animated.Value(1))).current;

  const animateStar = (index: number) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scales[index], { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(scales[index], { toValue: 1, tension: 400, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.priorityContainer}>
      <View style={styles.starsRow}>
        {[1,2,3,4,5].map((star, index) => {
          const isActive = star <= value;
          return (
            <TouchableOpacity
              key={star}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                onChange(star);
                animateStar(index);
              }}
              style={styles.starButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Animated.View style={{ transform: [{ scale: scales[index] }] }}>
                <Ionicons
                  name={isActive ? 'star' : 'star-outline'}
                  size={24}
                  color={isActive ? COLORS.gold : COLORS.muted}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.priorityLabel}>
        {
          value === 0 ? 'No priority set'
          : value === 5 ? 'Must visit!'
          : value === 1 ? 'Low priority.'
          : value === 2 ? 'Small priority.'
          : value === 3 ? 'Medium priority'
          : value === 4 ? 'High Priority'
          : ''
        }
      </Text>
    </View>
  );
};

const ActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
  color?: string;
}> = ({ icon, title, subtitle, onPress, rightElement, color = COLORS.primary }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
      {icon}
    </View>
    <View style={styles.actionContent}>
      <Text style={styles.actionTitle}>{title}</Text>
      {subtitle && <Text style={styles.actionSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />}
  </TouchableOpacity>
);

const PinMenu: React.FC<PinMenuProps> = ({ pin, onClose, onSave, onDelete }) => {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;

  const [name, setName] = useState(pin.name ?? '');
  const [date, setDate] = useState<Date | undefined>(pin.createdAt);
  const [visited, setVisited] = useState<boolean>(false);
  const [priority, setPriority] = useState<number>(pin.priority ?? 0);
  const [color, setColor] = useState<string>(pin.color ?? MARKER_PALETTE[0]);
  const [shape, setShape] = useState<ShapeOption>((pin.shape as ShapeOption) ?? 'default');
  const [tags, setTags] = useState<TagOption[]>(pin.tags ?? []);
  const [notes, setNotes] = useState<string>(pin.notes ?? '');
  const [todos, setTodos] = useState<TodoItem[]>(pin.todos ?? []);
  const [newTodo, setNewTodo] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    tags: false,
    todos: false,
  });

  const [sheetIndex, setSheetIndex] = useState(1);

  const saveTimeoutRef = useRef<number | null>(null);

  const snapPoints = useMemo(() => ['35%', '60%', '100%'], []);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeIn]);

  const debouncedSave = useCallback((partial: Partial<PinData>) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      onSave(partial);
    }, 800) as unknown as number;
  }, [onSave]);

  const immediateSave = useCallback((partial: Partial<PinData>) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    onSave(partial);
  }, [onSave]);

  const handleChangeName = useCallback((text: string) => {
    setName(text);
    debouncedSave({ name: text });
  }, [debouncedSave]);

  const handleToggleVisited = useCallback((value: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisited(value);
    if (value) {
      const d = date ?? new Date();
      setDate(d);
      immediateSave({ createdAt: d });
    } else {
      setDate(undefined);
      immediateSave({ createdAt: undefined });
    }
  }, [date, immediateSave]);

  const handlePickDate = useCallback((e: DateTimePickerEvent, selected?: Date) => {
    if (e.type === 'set' && selected) {
      setDate(selected);
      setVisited(true);
      immediateSave({ createdAt: selected });
    }
    setShowDatePicker(false);
  }, [immediateSave]);

  const handleSetPriority = useCallback((value: number) => {
    setPriority(value);
    immediateSave({ priority: value });
  }, [immediateSave]);

  const handleSetColor = useCallback((c: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setColor(c);
    immediateSave({ color: c });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [immediateSave]);

  const handleSetShape = useCallback((s: ShapeOption) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setShape(s);
    immediateSave({ shape: s });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [immediateSave]);

  const toggleTag = useCallback((t: TagOption) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const exists = tags.find(x => x.label === t.label);
    const next = exists ? tags.filter(x => x.label !== t.label) : [...tags, t];
    setTags(next);
    immediateSave({ tags: next });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [tags, immediateSave]);

  const addTodo = useCallback(() => {
    const trimmed = newTodo.trim();
    if (!trimmed) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updated = [...todos, { text: trimmed, done: false }];
    setTodos(updated);
    setNewTodo('');
    immediateSave({ todos: updated });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [newTodo, todos, immediateSave]);

  const toggleTodo = useCallback((index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updated = todos.map((t, i) => i === index ? { ...t, done: !t.done } : t);
    setTodos(updated);
    immediateSave({ todos: updated });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [todos, immediateSave]);

  const openDirections = useCallback(() => {
    const url = `https://maps.apple.com/?q=${pin.lat},${pin.lng}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const googleUrl = `https://maps.google.com/?q=${pin.lat},${pin.lng}`;
        Linking.openURL(googleUrl);
      }
    });
  }, [pin.lat, pin.lng]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Pin',
      'This will permanently remove this pin from your collection.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete();
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
          }
        }
      ]
    );
  }, [onDelete]);

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      onChange={(i) => {
        setSheetIndex(i);
      }}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBackground}
      bottomInset={NAV_HEIGHT + insets.bottom}
      style={{ zIndex: 10 }}
      enableContentPanningGesture
    >
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: 24 + insets.bottom, flexGrow: 1 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEnabled={sheetIndex === 2}
      >
        <Animated.View style={{ opacity: fadeIn }}>
          {/* Header */}
          <View style={styles.header}>
            <TextInput
              value={name}
              onChangeText={handleChangeName}
              placeholder="Name this place..."
              placeholderTextColor={COLORS.muted}
              style={styles.titleInput}
              maxLength={100}
            />
            <View style={styles.headerMeta}>
              <Text style={styles.coordinates}>
                {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <ActionCard
            icon={<Ionicons name="navigate" size={20} color={COLORS.primary} />}
            title="Get Directions"
            subtitle="Open in Maps"
            onPress={openDirections}
          />

          <ActionCard
            icon={<Ionicons name={visited ? 'checkmark-circle' : 'radio-button-off'} size={20} color={visited ? COLORS.success : COLORS.muted} />}
            title={visited ? 'Visited' : 'Not Visited'}
            subtitle={date ? date.toLocaleDateString() : 'Mark as visited'}
            onPress={() => handleToggleVisited(!visited)}
            rightElement={
              <Switch
                value={visited}
                onValueChange={handleToggleVisited}
                thumbColor={visited ? COLORS.success : undefined}
                trackColor={{ false: '#ddd', true: `${COLORS.success}40` }}
              />
            }
            color={visited ? COLORS.success : COLORS.muted}
          />

          {showDatePicker && (
            <View style={styles.datePickerCard}>
              <DateTimePicker
                value={date ?? new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'compact' : 'default'}
                onChange={handlePickDate}
                maximumDate={new Date()}
              />
            </View>
          )}

          <ActionCard
            icon={<Ionicons name="calendar" size={20} color={COLORS.primary} />}
            title="Visit Date"
            subtitle={date ? date.toLocaleDateString() : 'Set visit date'}
            onPress={() => setShowDatePicker(true)}
          />

          {/* Priority */}
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.card}>
            <PriorityStars value={priority} onChange={setPriority} />
          </View>

          {/* Appearance */}
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            {/* Preview */}
            <Text style={styles.cardTitle}>Preview</Text>
            <View style={styles.previewRow}>
              <PinIcon shape={shape} color={color} size={36} />
              <Text style={styles.previewLabel}>{shape} • {color.toUpperCase()}</Text>
            </View>

            {/* Shape picker */}
            <Text style={[styles.cardTitle, { marginTop: 12 }]}>Pin Shape</Text>
            <View style={styles.shapeGrid}>
              {SHAPES.map((s) => {
                const selected = s === shape;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => handleSetShape(s)}
                    style={[
                      styles.shapeCell,
                      selected && { borderColor: COLORS.primary, borderWidth: 2, backgroundColor: `${COLORS.primary}0F` },
                    ]}
                    activeOpacity={0.85}
                  >
                    <PinIcon shape={s} color={selected ? COLORS.primary : COLORS.muted} size={28} />
                    <Text style={[styles.shapeLabel, { color: selected ? COLORS.primary : COLORS.muted }]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Color picker */}
            <Text style={[styles.cardTitle, { marginTop: 12 }]}>Pin Color</Text>
            <View style={styles.colorGrid}>
              {MARKER_PALETTE.map((c) => {
                const selected = c === color;
                const isWhite = c.toLowerCase() === '#ffffff' || c.toLowerCase() === 'white';
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => handleSetColor(c)}
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor: c,
                        transform: [{ scale: selected ? 1.2 : 1 }],
                        shadowOpacity: selected ? 0.3 : 0,
                        borderColor: isWhite ? '#D1D5DB' : '#E5E5EA',
                      }
                    ]}
                    activeOpacity={0.9}
                  />
                );
              })}
            </View>
          </View>

          {/* Tags */}
          <Text style={styles.sectionTitle}>Tags</Text>
          <ActionCard
            icon={<Ionicons name="pricetags" size={20} color={COLORS.primary} />}
            title="Categories"
            subtitle={tags.length > 0 ? `${tags.length} selected` : 'Add tags'}
            onPress={() => toggleSection('tags')}
            rightElement={
              <Ionicons
                name={expandedSections.tags ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.muted}
              />
            }
          />

          {expandedSections.tags && (
            <View style={styles.tagsGrid}>
              {TAG_OPTIONS.map(t => {
                const selected = !!tags.find(x => x.label === t.label);
                return (
                  <TouchableOpacity
                    key={t.label}
                    onPress={() => toggleTag(t)}
                    style={[
                      styles.tagPill,
                      {
                        backgroundColor: selected ? `${t.color}20` : COLORS.cardBg,
                        borderColor: selected ? t.color : COLORS.separator,
                        borderWidth: selected ? 2 : 1,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.tagEmoji}>{t.emoji}</Text>
                    <Text style={[styles.tagLabel, { color: selected ? t.color : COLORS.textLight }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Notes */}
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.card}>
            <TextInput
              value={notes}
              onChangeText={(text) => {
                setNotes(text);
                debouncedSave({ notes: text });
              }}
              placeholder="Add your thoughts, tips, or memories..."
              placeholderTextColor={COLORS.muted}
              multiline
              style={styles.notesInput}
              maxLength={1000}
            />
          </View>

          {/* To-Do */}
          <Text style={styles.sectionTitle}>To-Do</Text>
          <ActionCard
            icon={<Ionicons name="list" size={20} color={COLORS.primary} />}
            title="Tasks"
            subtitle={todos.length > 0 ? `${todos.filter(t => !t.done).length} remaining` : 'Add tasks'}
            onPress={() => toggleSection('todos')}
            rightElement={
              <Ionicons
                name={expandedSections.todos ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.muted}
              />
            }
          />

          {expandedSections.todos && (
            <View style={styles.card}>
              {todos.map((todo, i) => (
                <View key={`${todo.text}-${i}`} style={styles.todoItem}>
                  <TouchableOpacity onPress={() => toggleTodo(i)} style={styles.todoCheckbox}>
                    <Ionicons
                      name={todo.done ? 'checkmark-circle' : 'radio-button-off'}
                      size={24}
                      color={todo.done ? COLORS.success : COLORS.muted}
                    />
                  </TouchableOpacity>
                  <Text style={[styles.todoText, todo.done && styles.todoTextDone]}>
                    {todo.text}
                  </Text>
                </View>
              ))}

              <View style={styles.addTodoContainer}>
                <TextInput
                  value={newTodo}
                  onChangeText={setNewTodo}
                  placeholder="Add a new task..."
                  placeholderTextColor={COLORS.muted}
                  onSubmitEditing={addTodo}
                  returnKeyType="done"
                  style={styles.addTodoInput}
                  maxLength={100}
                />
                <TouchableOpacity
                  onPress={addTodo}
                  style={[styles.addTodoButton, { opacity: newTodo.trim().length > 0 ? 1 : 0.5 }]}
                  disabled={newTodo.trim().length === 0}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Danger Zone */}
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity style={styles.deleteCard} onPress={handleDelete} activeOpacity={0.8}>
            <Ionicons name="trash" size={20} color={COLORS.danger} />
            <Text style={styles.deleteText}>Delete Pin</Text>
          </TouchableOpacity>
        </Animated.View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default PinMenu;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.separator,
    alignSelf: 'center',
    marginVertical: 8,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  headerMeta: {
    marginTop: 4,
  },
  coordinates: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 12,
  },
  priorityContainer: {
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  priorityLabel: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  // appearance
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  previewLabel: {
    fontSize: 14,
    color: COLORS.muted,
    textTransform: 'capitalize',
  },
  shapeGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  shapeCell: {
    width: '30%',
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  shapeLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    flexBasis: '22%',
  },
  datePickerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tagEmoji: {
    fontSize: 16,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesInput: {
    fontSize: 16,
    color: COLORS.textLight,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  todoCheckbox: {
    padding: 4,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  todoTextDone: {
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },
  addTodoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
  },
  addTodoInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textLight,
    paddingVertical: 12,
  },
  addTodoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.danger}10`,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.danger,
  },
});