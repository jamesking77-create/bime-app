import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, space } from "../theme";

// Placeholder for screens that are built in later steps.
export function ComingNext({ title, body }: { title: string; body: string }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: space.lg, gap: space.sm },
  title: { color: colors.text, fontSize: 24, fontWeight: "700" },
  body: { color: colors.muted, fontSize: 16, lineHeight: 22 },
});
