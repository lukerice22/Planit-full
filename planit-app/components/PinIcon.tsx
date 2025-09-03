import React from "react";
import { ViewStyle } from "react-native";

// IMPORTANT: filenames must match exactly (Metro is case-sensitive)
import PinDefault from "../assets/icons/Pin-Default.svg";
import PinFlag from "../assets/icons/Pin-Flag.svg";
import PinThin from "../assets/icons/Pin-Thin.svg";

export type PinShape = "default" | "flag" | "thin";

interface PinIconProps {
  shape?: PinShape;
  color?: string;
  size?: number;
  style?: ViewStyle;
}

/**
 * NOTE: For color to work, open each SVG and replace hardcoded fills like
 * fill="#000000" with fill="currentColor", OR remove fills and let parent fill.
 * Then the `fill={color}` prop here will recolor your SVGs.
 */
export default function PinIcon({
  shape = "default",
  color = "#E74C3C",
  size = 34,
  style,
}: PinIconProps) {
  const props = { width: size, height: size, fill: color, style };

  switch (shape) {
    case "flag":
      return <PinFlag {...props} />;
    case "thin":
      return <PinThin {...props} />;
    default:
      return <PinDefault {...props} />;
  }
}
