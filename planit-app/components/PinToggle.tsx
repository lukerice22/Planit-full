// components/FilterPill.tsx
import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  AccessibilityInfo,
  LayoutChangeEvent,
} from "react-native";

export type PinFilter = "all" | "visited" | "wishlist";

type Props = {
  value: PinFilter;
  onChange: (next: PinFilter) => void;
  labels?: { all?: string; visited?: string; wishlist?: string };
};

const TABS: PinFilter[] = ["all", "visited", "wishlist"];

// Match the container padding below. Using pixels keeps the slider centered.
const PADDING = 2;

export default function FilterPill({ value, onChange, labels }: Props) {
  const idx = useMemo(() => TABS.indexOf(value), [value]);
  const anim = useRef(new Animated.Value(idx)).current;

  // measure inner track (width minus padding)
  const [trackWidth, setTrackWidth] = useState<number>(0);
  const segment = trackWidth > 0 ? trackWidth / TABS.length : 0;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: idx,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true, // we're animating translateX now
    }).start();
  }, [idx, anim]);

  // translateX in pixels so padding is respected
  const translateX = Animated.multiply(anim, segment);

  const readable = {
    all: labels?.all ?? "All",
    visited: labels?.visited ?? "Visited",
    wishlist: labels?.wishlist ?? "Wishlist",
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setTrackWidth(Math.max(0, width - PADDING * 2));
  };

  return (
    <View
      style={styles.container}
      onLayout={onLayout}
      accessible
      accessibilityRole="tablist"
      accessibilityLabel="Pin filter"
    >
      {/* Slider */}
      {segment > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.slider,
            {
              left: PADDING,
              width: segment,
              transform: [{ translateX }],
            },
          ]}
        />
      )}

      {/* Tabs */}
      {TABS.map((key) => {
        const selected = value === key;
        const label = readable[key];
        return (
          <Pressable
            key={key}
            onPress={() => {
              onChange(key);
              AccessibilityInfo.announceForAccessibility?.(`${label} selected`);
            }}
            style={({ pressed }) => [
              styles.tab,
              {
                width: `${100 / TABS.length}%`,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`${label} pins`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: true }}
          >
            <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 45,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    padding: PADDING, // keep in sync with PADDING constant
    position: "relative",
    overflow: "hidden",
    // layering: keep this low; parent controls stacking vs. bottom sheet/nav
    zIndex: 0,
    elevation: 0,
  },
  slider: {
    position: "absolute",
    top: PADDING,
    bottom: PADDING,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.7)",
    // subtle iOS shadow only (no elevation so it won’t float over siblings on Android)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 0,
  },
  tab: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
    color: "#222",
  },
  tabTextSelected: {
    color: "#111",
  },
});