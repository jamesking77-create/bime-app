import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Clay should feel physical. The web gets no vibration: it reads as noise there.
const native = Platform.OS !== "web";

export function tap() {
  if (native) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function thud() {
  if (native) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export function success() {
  if (native) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function warn() {
  if (native) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
