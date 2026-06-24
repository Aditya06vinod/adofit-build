import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { Stack, useRouter, usePathname } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onBackPress = () => {
      // 1. Prevent exit on Home/Welcome
      if (pathname === '/' || pathname === '/welcome') {
        return true;
      }

      // 2. Sequential pop
      if (router.canGoBack()) {
        router.back();
        return true;
      }

      // 3. Fallback to Home
      router.replace('/');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [pathname]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="workout-tracker" options={{ title: "Workout" }} />
          <Stack.Screen name="diet-tracker" options={{ title: "Diet" }} />
          <Stack.Screen name="progress" options={{ title: "Progress" }} />
          <Stack.Screen name="workout-dashboard" options={{ title: "Workout Dashboard" }} />
          <Stack.Screen name="profile" options={{ title: "Profile" }} />
          <Stack.Screen name="welcome" options={{ title: "Welcome" }} />
          <Stack.Screen name="workouts" options={{ title: "Explore Workouts" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
          <Stack.Screen
            name="modal/add-food"
            options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="modal/workout-video"
            options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}