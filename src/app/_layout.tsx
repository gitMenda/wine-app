import { useColorScheme, View } from "react-native";
import "../global.css";
import { Slot } from "expo-router";

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <View className={colorScheme === "dark" ? "dark" : ""} style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
