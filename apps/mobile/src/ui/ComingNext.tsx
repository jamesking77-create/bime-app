import { StyleSheet } from "react-native";
import { Glass } from "./Glass";
import { Screen } from "./Screen";
import { T } from "./type";
import { colors } from "./tokens";

/** Placeholder for screens that are built in later steps. */
export function ComingNext({ title, body }: { title: string; body: string }) {
  return (
    <Screen>
      <T v="title" accessibilityRole="header">
        {title}
      </T>
      <Glass radius={22} style={styles.pane}>
        <T v="body" style={styles.body}>
          {body}
        </T>
      </Glass>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pane: { padding: 20 },
  body: { color: colors.muted },
});
