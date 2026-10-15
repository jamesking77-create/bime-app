import type { RefObject } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, usePathname, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { MomentumState } from "@bime/core";
import { Clay } from "./Clay";
import { Glass } from "./Glass";
import { tap } from "./haptics";
import { TabIcon, type TabName } from "./icons";
import { T } from "./type";
import { colors, DOCK_HEIGHT, stateColor } from "./tokens";

const TABS: { href: Href; path: string; label: string; icon: TabName }[] = [
  { href: "/", path: "/", label: "Today", icon: "today" },
  { href: "/lock-in", path: "/lock-in", label: "Lock-in", icon: "lockin" },
  { href: "/progress", path: "/progress", label: "Progress", icon: "progress" },
  { href: "/plan", path: "/plan", label: "Plan", icon: "plan" },
];

type Props = {
  blurTarget: RefObject<View | null>;
  state: MomentumState;
  /** A lock-in is running: mark its tab. */
  live: boolean;
};

/** The tab bar: a glass dock floating over the screen; the open tab is pressed into it. */
export function Dock({ blurTarget, state, live }: Props) {
  const path = usePathname();
  const insets = useSafeAreaInsets();
  const light = stateColor[state];
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <Glass blur blurTarget={blurTarget} radius={DOCK_HEIGHT / 2} style={styles.dock}>
        <View style={styles.row} accessibilityRole="tablist">
          {TABS.map(t => {
            const on = path === t.path;
            const inner = (
              <>
                <View>
                  <TabIcon name={t.icon} color={on ? light : colors.muted} />
                  {live && t.icon === "lockin" && <View style={[styles.liveDot, { backgroundColor: light }]} />}
                </View>
                <T v="meta" style={[styles.label, on && styles.labelOn]}>
                  {t.label}
                </T>
              </>
            );
            return (
              <Pressable
                key={t.path}
                style={styles.tab}
                onPress={() => {
                  if (on) return;
                  tap();
                  router.navigate(t.href);
                }}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={live && t.icon === "lockin" ? `${t.label}, session running` : t.label}
              >
                {on ? (
                  <Clay pressed small radius={22} style={styles.well}>
                    {inner}
                  </Clay>
                ) : (
                  <View style={styles.well}>{inner}</View>
                )}
              </Pressable>
            );
          })}
        </View>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center", paddingHorizontal: 16 },
  dock: { width: "100%", maxWidth: 520, height: DOCK_HEIGHT, justifyContent: "center", paddingHorizontal: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: DOCK_HEIGHT - 8 },
  well: { width: "100%", height: DOCK_HEIGHT - 14, alignItems: "center", justifyContent: "center", gap: 2 },
  label: { fontSize: 11, lineHeight: 14 },
  labelOn: { color: colors.ink },
  liveDot: { position: "absolute", top: -2, right: -4, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: colors.night },
});
