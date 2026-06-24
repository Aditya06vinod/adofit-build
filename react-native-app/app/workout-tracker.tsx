import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Plus,
  Check,
  MoreVertical,
  Timer,
  X,
  Play,
  Info,
  Dumbbell,
  Search,
  Camera
} from "lucide-react-native";
import { WebView } from "react-native-webview";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

// Types and Data (Kept same as Web for consistency)
interface WorkoutSet {
  id: string;
  type: "W" | "S";
  weight: string;
  reps: string;
  previous: string;
  completed: boolean;
}

interface ActiveExercise {
  id: string;
  name: string;
  notes: string;
  sets: WorkoutSet[];
}

const exerciseInstructions: Record<string, { youtubeId: string; steps: string[] }> = {
  "bench press": {
    youtubeId: "gRVjAtPip0Y",
    steps: [
      "Lie flat on a bench, grip the barbell slightly wider than shoulder-width.",
      "Lower the bar slowly to your chest, keeping elbows at a 45-degree angle.",
      "Push the bar back up powerfully by extending your arms."
    ]
  },
  // ... other instructions can be ported here
};

const WorkoutTracker = () => {
  const router = useRouter();
  const [exercises, setExercises] = useState<ActiveExercise[]>([]);
  const [timer, setTimer] = useState(0);
  const [instructionExercise, setInstructionExercise] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
    if (type === "light") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (type === "medium") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSetComplete = (exId: string, setId: string) => {
    triggerHaptic("light");
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === exId) {
          return {
            ...ex,
            sets: ex.sets.map(s => (s.id === setId ? { ...s, completed: !s.completed } : s)),
          };
        }
        return ex;
      })
    );
  };

  const stopWorkout = () => {
    triggerHaptic("heavy");
    Alert.alert("Workout Completed!", `Time: ${formatTimer(timer)}`, [
      { text: "Finish", onPress: () => router.push("/progress") }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            style={styles.iconButton}
          >
            <ChevronLeft size={24} color="#94A3B8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Workout</Text>
        </View>
        <View style={styles.headerRight}>
          <Timer size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <Text style={styles.timerText}>{formatTimer(timer)}</Text>
          <TouchableOpacity onPress={stopWorkout} style={styles.finishButton}>
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TIME</Text>
            <Text style={styles.statValue}>{formatTimer(timer)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>VOLUME</Text>
            <Text style={styles.statValue}>0 kg</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SETS</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
        </View>

        {/* Exercise List */}
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
             <View style={styles.exerciseHeader}>
                <TouchableOpacity
                  onPress={() => setInstructionExercise(exercise.name)}
                  style={styles.exerciseInfo}
                >
                  <View style={styles.dumbbellCircle}>
                    <Dumbbell size={18} color="#1C64F2" />
                  </View>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Info size={14} color="#1C64F2" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <MoreVertical size={20} color="#94A3B8" />
                </TouchableOpacity>
             </View>

             <TextInput
                placeholder="Add notes..."
                placeholderTextColor="#64748B"
                style={styles.notesInput}
                value={exercise.notes}
             />

             {/* Table Headers */}
             <View style={styles.tableHeader}>
                <Text style={[styles.columnLabel, { width: 40, textAlign: 'center' }]}>SET</Text>
                <Text style={[styles.columnLabel, { flex: 1 }]}>PREVIOUS</Text>
                <Text style={[styles.columnLabel, { width: 60, textAlign: 'center' }]}>KG</Text>
                <Text style={[styles.columnLabel, { width: 60, textAlign: 'center' }]}>REPS</Text>
                <Text style={[styles.columnLabel, { width: 40, textAlign: 'center' }]}>✓</Text>
             </View>

             {exercise.sets.map((set, idx) => (
               <View key={set.id} style={[styles.setRow, set.completed && styles.setRowCompleted]}>
                 <Text style={styles.setText}>{idx + 1}</Text>
                 <Text style={styles.previousText}>{set.previous}</Text>
                 <TextInput
                    style={styles.setInput}
                    keyboardType="numeric"
                    value={set.weight}
                 />
                 <TextInput
                    style={styles.setInput}
                    keyboardType="numeric"
                    value={set.reps}
                 />
                 <TouchableOpacity
                   onPress={() => toggleSetComplete(exercise.id, set.id)}
                   style={[styles.checkButton, set.completed && styles.checkButtonActive]}
                 >
                   <Check size={16} color="white" />
                 </TouchableOpacity>
               </View>
             ))}

             <TouchableOpacity style={styles.addSetButton}>
                <Plus size={16} color="#64748B" />
                <Text style={styles.addSetText}>Add Set</Text>
             </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="white" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Video Modal */}
      <Modal
        visible={!!instructionExercise}
        transparent
        animationType="slide"
        onRequestClose={() => setInstructionExercise(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{instructionExercise}</Text>
                <TouchableOpacity onPress={() => setInstructionExercise(null)}>
                  <X size={24} color="#94A3B8" />
                </TouchableOpacity>
             </View>
             <View style={styles.videoContainer}>
                {instructionExercise && (
                  <WebView
                    source={{ uri: `https://www.youtube.com/embed/${exerciseInstructions[instructionExercise.toLowerCase()]?.youtubeId || 'gcNh17Ckjgg'}` }}
                    style={{ flex: 1 }}
                  />
                )}
             </View>
             <TouchableOpacity
               style={styles.closeModalButton}
               onPress={() => setInstructionExercise(null)}
             >
               <Text style={styles.closeModalText}>Got it</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 12,
  },
  finishButton: {
    backgroundColor: "#1C64F2",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  finishButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "bold",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  exerciseCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dumbbellCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(28, 100, 242, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  exerciseName: {
    color: "#1C64F2",
    fontSize: 16,
    fontWeight: "bold",
  },
  notesInput: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
    padding: 10,
    color: "white",
    fontSize: 12,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  columnLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "bold",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  setRowCompleted: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  setText: {
    width: 40,
    textAlign: "center",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  previousText: {
    flex: 1,
    color: "#64748B",
    fontSize: 11,
  },
  setInput: {
    width: 50,
    backgroundColor: "#0F172A",
    borderRadius: 4,
    textAlign: "center",
    color: "white",
    fontSize: 12,
    paddingVertical: 4,
    marginHorizontal: 5,
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  checkButtonActive: {
    backgroundColor: "#22C55E",
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: "#0F172A",
    borderRadius: 8,
  },
  addSetText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C64F2",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  addExerciseText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: "black",
    borderRadius: 12,
    overflow: "hidden",
  },
  closeModalButton: {
    backgroundColor: "#334155",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  closeModalText: {
    color: "white",
    fontWeight: "bold",
  },
  iconButton: {
    padding: 4,
  }
});

export default WorkoutTracker;
