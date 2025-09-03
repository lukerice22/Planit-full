import * as Haptics from 'expo-haptics';

let last = 0;
const GAP = 120; // ms

const ok = () => {
  const now = Date.now();
  if (now - last < GAP) return false;
  last = now;
  return true;
};

export const h = {
  light: async () => ok() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: async () => ok() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: async () => ok() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  select: async () => ok() && Haptics.selectionAsync(),
  success: async () => ok() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warn: async () => ok() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: async () => ok() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};