import { Link, router } from "expo-router";
import React from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { useAuth } from '@/hooks/useAuth';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/Button";

export default function Page() {
  const { user, loading: authLoading } = useAuth();

  // Force log the authentication state
  console.log("Auth state:", { 
    user: user ? "Logged in" : "Not logged in", 
    authLoading
  });

  // Muestra loading mientras se chequea auth
  if (authLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#7c2d12" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-1">
      <Header />
      <Content user={user} />
      <Footer />
    </View>
  );
}

function Content({ user }: { user: any }) {
  // ¡IMPORTANTE! - Usa useAuth aquí, en el nivel superior del componente
  const { signOut } = useAuth();

  // Función para manejar el cierre de sesión
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("Sesión cerrada correctamente");
      // No es necesario redireccionar, el cambio en el estado de autenticación
      // hará que el componente se vuelva a renderizar
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  return (
    <View className="flex-1">
      <View className="py-12 md:py-24 lg:py-32 xl:py-48">
        <View className="px-4 md:px-6">
          <View className="flex flex-col items-center gap-2 text-center px-3 justify-between flex-col h-full py-48">
            <View className="gap-3 w-full">
              <Text
                role="heading"
                className="text-3xl text-center native:text-5xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
              >
                Welcome to
              </Text>
              <Text
                role="heading"
                className="text-3xl text-burgundy-600 text-center native:text-5xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
              >
                TuVino
              </Text>
              <Text className="mx-auto max-w-[700px] text-lg text-center text-gray-700 md:text-xl dark:text-gray-400">
                Your first wine advisor 
              </Text>
            </View>

            <View className="gap-3 w-full">
              {/* Separamos la lógica para usuarios autenticados y no autenticados */}
              {user ? (
                <>
                  <Button
                    title="Continuar a la App"
                    onPress={() => {
                      if (user.onboardingCompleted === false) {
                        router.push('/(onboarding)/welcome');
                      } else {
                        router.push('/home');
                      }
                    }}
                    variant="primary"
                  />
                  
                  <Button
                    title="Cerrar Sesión"
                    onPress={handleSignOut}
                    variant="secondary"
                  />
                </>
              ) : (
                <>
                  <Button
                    title="Iniciar Sesión"
                    onPress={() => router.push('/login')}
                    variant="primary"
                    className="bg-burgundy-600" // Agregar este className para mantener consistencia
                  />
                  
                  <Button
                    title="Registrarse"
                    onPress={() => router.push('/register')}
                    variant="secondary"
                  />
                </>
              )}
              
              <Button
                title="Ver Home (Demo)"
                onPress={() => router.push('/home')}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Header() {
  const { top } = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: top }}>
      <View className="px-4 lg:px-6 h-14 flex items-center flex-row justify-between">
        <Link className="font-bold flex-1 items-center justify-center" href="/">
          <Text>TuVino</Text>
        </Link>
        <View className="flex flex-row gap-4 sm:gap-6">
          <Link
            className="text-md font-medium hover:underline web:underline-offset-4"
            href="/"
          >
            <Text>About</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

function Footer() {
  const { bottom } = useSafeAreaInsets();
  return (
    <View
      className="flex shrink-0 bg-gray-100 native:hidden"
      style={{ paddingBottom: bottom }}
    >
      <View className="py-6 flex-1 items-start px-4 md:px-6 ">
        <Text className={"text-center text-gray-700"}>
          © {new Date().getFullYear()} Me
        </Text>
      </View>
    </View>
  );
}
