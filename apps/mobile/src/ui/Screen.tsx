import { useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { alpha, colors, DOCK_HEIGHT } from "./tokens";

/** Room the floating dock takes at the bottom of the screen. */
export function useDockSpace(): number {
  const insets = useSafeAreaInsets();
  return DOCK_HEIGHT + Math.max(insets.bottom, 12) + 12;
}

type Props = {
  children: ReactNode;
  /** Pinned above the dock: the screen's one next step. */
  footer?: ReactNode;
  /** Covers the screen, e.g. the session-complete moment. */
  overlay?: ReactNode;
};

/** A screen over the night backdrop: scrolling content, an optional pinned footer. */
export function Screen({ children, footer, overlay }: Props) {
  const insets = useSafeAreaInsets();
  const dock = useDockSpace();
  const [footerHeight, setFooterHeight] = useState(0);
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: dock + (footer ? footerHeight : 0) + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>{children}</View>
      </ScrollView>
      {footer ? (
        <View
          pointerEvents="box-none"
          style={[styles.footer, { bottom: dock }]}
          onLayout={e => setFooterHeight(e.nativeEvent.layout.height)}
        >
          <LinearGradient
            pointerEvents="none"
            colors={[alpha(colors.night, 0), alpha(colors.night, 0.92)]}
            locations={[0, 0.45]}
            style={[styles.fade, { bottom: -dock }]}
          />
          <View style={styles.column}>{footer}</View>
        </View>
      ) : null}
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  column: { width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 20, gap: 20 },
  footer: { position: "absolute", left: 0, right: 0, paddingTop: 10, paddingBottom: 8 },
  fade: { position: "absolute", left: 0, right: 0, top: -28 },
});
