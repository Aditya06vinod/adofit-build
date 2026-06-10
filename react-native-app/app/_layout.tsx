import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DarkTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0F172A" },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="workout-tracker" options={{ title: "Workout" }} />
          <Stack.Screen name="diet-tracker" options={{ title: "Diet" }} />
          <Stack.Screen name="progress" options={{ title: "Progress" }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
