import { StatusBar } from "expo-status-bar";
import { Tabs } from "expo-router/js-tabs";
import { TabIcon } from "../components/TabIcon";
import { colors } from "../theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.ink },
          tabBarStyle: { backgroundColor: colors.ink, borderTopColor: colors.line, minHeight: 56 },
          tabBarActiveTintColor: colors.teal,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Today", tabBarIcon: ({ color }) => <TabIcon name="today" color={color} /> }} />
        <Tabs.Screen name="lock-in" options={{ title: "Lock-in", tabBarIcon: ({ color }) => <TabIcon name="lockin" color={color} /> }} />
        <Tabs.Screen name="progress" options={{ title: "Progress", tabBarIcon: ({ color }) => <TabIcon name="progress" color={color} /> }} />
        <Tabs.Screen name="plan" options={{ title: "Plan", tabBarIcon: ({ color }) => <TabIcon name="plan" color={color} /> }} />
      </Tabs>
    </>
  );
}
