import { ScrollView, useColorScheme, View } from "react-native";
import "../global.css";
import { Slot, useGlobalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";


export default function Layout() {
  const colorScheme = useColorScheme();
  const { scrollable } = useGlobalSearchParams();

  const isScrollable = scrollable === "true"; // interpret as boolean

  const Container = isScrollable ? ScrollView : View;

  return (
    <Container className={colorScheme === "dark" ? "dark" : ""} style={{ flex: 1 }}>
      <Slot />
    </Container>
  );
}
