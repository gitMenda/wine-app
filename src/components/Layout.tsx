import { ScrollView, View } from "react-native";
import { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";


export default function Layout({
  children,
  scrollable = false,
}: {
  children: ReactNode;
  scrollable?: boolean;
}) {
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-gray-900">
        <StatusBar style="light" />
            <Container style={{ flex: 1 }}>
                {children}
        </Container>
    </SafeAreaView>
  );
}
