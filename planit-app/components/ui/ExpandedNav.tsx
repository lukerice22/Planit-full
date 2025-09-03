// components/ui/ExpandedNav.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import AuthModal from '../AuthModal';
import { auth } from '@/config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as Haptics from 'expo-haptics';

type Props = {
  onOpenChooser?: () => void; // 👈 NEW
};

export default function ExpandedNavContent({ onOpenChooser }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const NAVBAR_HEIGHT = 120;

  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User signed in:', user.email);
        setCurrentUser(user);
      } else {
        console.log('User signed out');
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const handleAuthAction = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentUser) {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut(auth);
                console.log('✅ User signed out');
                router.replace('/home');
              } catch (err) {
                console.error('❌ Sign out error', err);
              }
            },
          },
        ]
      );
    } else {
      setModalVisible(true);
    }
  };

  const userName = currentUser?.displayName || currentUser?.email || null;

  const ActionItem = ({
    icon,
    label,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.7}
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
    >
      {icon}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <AuthModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      <BottomSheetScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + NAVBAR_HEIGHT },
        ]}
      >
        {/* Profile header */}
        <TouchableOpacity
          style={styles.profileHeader}
          activeOpacity={0.7}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <View style={styles.profileInfo}>
            <Ionicons name="person-circle-outline" size={30} color="#333" />
            <Text style={styles.profileName}>
              {userName ? `Welcome, ${userName}` : 'Welcome'}
            </Text>
          </View>
          <View style={styles.profileAction}>
            <Text style={styles.profileActionText}>Profile</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#007aff" />
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ActionItem
          icon={<Ionicons name="add-outline" size={24} color="#007aff" />}
          label="Add Pin"
          onPress={() => {
            // 👇 open the same chooser modal the Plan button uses
            onOpenChooser?.();
          }}
        />
        <ActionItem icon={<Ionicons name="airplane-outline" size={24} color="#007aff" />} label="Add Trip" />
        <ActionItem icon={<Ionicons name="image-outline" size={24} color="#007aff" />} label="Upload Photo" />
        <ActionItem icon={<Ionicons name="bulb-outline" size={24} color="#007aff" />} label="AI Tools" />

        {/* Tools */}
        <Text style={styles.sectionTitle}>Tools</Text>
        <ActionItem icon={<Ionicons name="bookmark-outline" size={24} color="#007aff" />} label="Saved Pins" onPress={() => router.push('/saved-pins')} />
        <ActionItem icon={<Ionicons name="earth-outline" size={24} color="#007aff" />} label="My World" onPress={() => router.push('/my-world')} />
        <ActionItem icon={<Ionicons name="airplane-outline" size={24} color="#007aff" />} label="Flight Finder" onPress={() => router.push('/flight-finder')} />
        <ActionItem icon={<Ionicons name="calendar-outline" size={24} color="#007aff" />} label="Trip Calendar" onPress={() => router.push('/trip-calendar')} />
        <ActionItem icon={<MaterialIcons name="attach-money" size={24} color="#007aff" />} label="Budget Tracker" onPress={() => router.push('/budget-tracker')} />
        <ActionItem icon={<Ionicons name="trophy-outline" size={24} color="#007aff" />} label="Achievements" onPress={() => router.push('/achievements')} />
        <ActionItem icon={<Ionicons name="locate-outline" size={24} color="#007aff" />} label="Travel Challenges" onPress={() => router.push('/travel-challenges')} />
        <ActionItem icon={<Ionicons name="globe-outline" size={24} color="#007aff" />} label="Explore" onPress={() => router.push('/explore')} />
        <ActionItem icon={<Ionicons name="home-outline" size={24} color="#007aff" />} label="Lodging Suggestions" onPress={() => router.push('/lodging-suggestions')} />
        <ActionItem icon={<Ionicons name="newspaper-outline" size={24} color="#007aff" />} label="News & Updates" onPress={() => router.push('/news')} />
        <ActionItem icon={<Ionicons name="settings-outline" size={24} color="#007aff" />} label="Settings" onPress={() => router.push('/settings')} />

        {/* Sign In / Sign Out */}
        <TouchableOpacity
          style={styles.authButton}
          onPress={handleAuthAction}
          activeOpacity={0.7}
        >
          <Text style={[styles.authText, { color: currentUser ? 'red' : '#007aff' }]}>
            {currentUser ? 'Sign Out' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 10 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 10 },
  profileInfo: { flexDirection: 'row', alignItems: 'center' },
  profileName: { fontSize: 18, fontWeight: '600', marginLeft: 10 },
  profileAction: { flexDirection: 'row', alignItems: 'center' },
  profileActionText: { fontSize: 16, color: '#007aff', marginRight: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginTop: 20, marginBottom: 10, color: '#555' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  label: { fontSize: 16, color: '#333', marginLeft: 12 },
  authButton: { marginTop: 30, alignSelf: 'center' },
  authText: { fontSize: 16, fontWeight: '600', color: '#007aff' },
});