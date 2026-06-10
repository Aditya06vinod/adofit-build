import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ado Workout App</Text>
      <Text style={styles.subtitle}>Native Implementation</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/workout-tracker")}
      >
        <Text style={styles.buttonText}>Workout Tracker</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 12, backgroundColor: "#22C55E" }]}
        onPress={() => router.push("/diet-tracker")}
      >
        <Text style={styles.buttonText}>Diet Tracker</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 12, backgroundColor: "#A855F7" }]}
        onPress={() => router.push("/progress")}
      >
        <Text style={styles.buttonText}>Progress Analytics</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#94A3B8",
    marginBottom: 40,
  },
  button: {
    width: '100%',
    backgroundColor: "#1C64F2",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
