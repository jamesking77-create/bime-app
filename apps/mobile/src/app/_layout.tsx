import { useRef } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, ThemeProvider } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { BlurTargetView } from "expo-blur";
import { useFonts } from "expo-font";
import { Fraunces_500Medium_Italic, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from "@expo-google-fonts/instrument-sans";
import { LockInProvider, useLockIn } from "../data/lockin";
import { useWeek, WeekProvider } from "../data/week";
import { Backdrop } from "../ui/Backdrop";
import { Dock } from "../ui/Dock";
import { colors } from "../ui/tokens";

// The screens are see-through: one night backdrop, lit by the momentum state,
// sits behind all four tabs, and the glass dock floats over them.
const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: "transparent", card: colors.night, text: colors.ink, border: "transparent", primary: colors.ink },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_500Medium_Italic,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });
  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <WeekProvider>
        <LockInProvider>
          <View style={{ flex: 1, backgroundColor: colors.night }}>{fontsLoaded || fontError ? <Shell /> : null}</View>
        </LockInProvider>
      </WeekProvider>
    </ThemeProvider>
  );
}

function Shell() {
  // Android blurs the content of this view behind the dock.
  const blurTarget = useRef<View>(null);
  const { momentum } = useWeek();
  const { phase } = useLockIn();
  return (
    <>
      <BlurTargetView ref={blurTarget} style={{ flex: 1 }}>
        <Backdrop state={momentum.state} />
        <Tabs tabBar={() => null} screenOptions={{ headerShown: false, animation: "fade", sceneStyle: { backgroundColor: "transparent" } }}>
          <Tabs.Screen name="index" options={{ title: "Today" }} />
          <Tabs.Screen name="lock-in" options={{ title: "Lock-in" }} />
          <Tabs.Screen name="progress" options={{ title: "Progress" }} />
          <Tabs.Screen name="plan" options={{ title: "Plan" }} />
        </Tabs>
      </BlurTargetView>
      <Dock blurTarget={blurTarget} state={momentum.state} live={phase === "running"} />
    </>
  );
}
