import { ChevronLeft, Plus, Check, MoreVertical, PlusCircle, Trash2, Timer, X, Play, Info, Dumbbell, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { useToast } from "@/hooks/use-toast";

interface WorkoutSet {
  id: string;
  type: "W" | "S"; // Warmup, Working Set
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

interface VideoInstruction {
  youtubeId: string;
  steps: string[];
}

// Exercise to YouTube Video mapping database
const exerciseInstructions: Record<string, VideoInstruction> = {
  "bench press": {
    youtubeId: "gRVjAtPip0Y",
    steps: [
      "Lie flat on a bench, grip the barbell slightly wider than shoulder-width.",
      "Lower the bar slowly to your chest, keeping elbows at a 45-degree angle.",
      "Push the bar back up powerfully by extending your arms."
    ]
  },
  "dumbbell press": {
    youtubeId: "8iPEnnM__kA",
    steps: [
      "Lie on the bench with dumbbells at chest level, palms facing forward.",
      "Press the dumbbells straight up over your chest without locking your elbows.",
      "Slowly lower them back down to the sides of your chest."
    ]
  },
  "cable fly": {
    youtubeId: "p5PR68G4tBc",
    steps: [
      "Stand between cable pulleys, hold handles with arms extended slightly bent.",
      "Bring your hands together in a wide arc in front of your chest.",
      "Slowly return to the starting position with control."
    ]
  },
  "push up": {
    youtubeId: "IODxDxX7oi4",
    steps: [
      "Place hands slightly wider than shoulder-width, feet close together.",
      "Lower your chest to the floor keeping your back straight and core tight.",
      "Push back up to the starting position."
    ]
  },
  "pullover": {
    youtubeId: "h1H4o4U4hH8",
    steps: [
      "Lie perpendicular on a bench, holding a dumbbell with both hands over chest.",
      "Lower the weight backward in an arc behind your head.",
      "Pull the weight back up to the starting position."
    ]
  },
  "pec deck": {
    youtubeId: "eGjt4lk6gJw",
    steps: [
      "Sit back against the pad, grip the handles, and place forearms on pads.",
      "Squeeze your chest to bring the handles/pads together in the center.",
      "Slowly return to the start, feeling a stretch in your chest."
    ]
  },
  "press": {
    youtubeId: "2yjwHeFToJ0",
    steps: [
      "Stand or sit holding the weight at shoulder level.",
      "Press the weight straight up overhead until arms are extended.",
      "Lower the weight back down with control."
    ]
  },
  "deadlift": {
    youtubeId: "op9kVnSso6Q",
    steps: [
      "Stand with feet hip-width apart, barbell over mid-foot.",
      "Bend at hips and knees, grip the bar, keep back flat and chest up.",
      "Drive through your heels to stand up, pulling the bar up to hip level."
    ]
  },
  "pull up": {
    youtubeId: "eGo4IYlbE5g",
    steps: [
      "Grip the pull-up bar with hands wider than shoulder-width, palms facing away.",
      "Pull your chest up toward the bar, retracting your shoulder blades.",
      "Lower yourself slowly back down to a dead hang."
    ]
  },
  "row": {
    youtubeId: "gQB25HD29bM",
    steps: [
      "Bend at the hips, keeping your back flat and knees slightly bent.",
      "Pull the barbell or dumbbell up toward your lower ribcage.",
      "Slowly lower the weight back down with control."
    ]
  },
  "pulldown": {
    youtubeId: "CAwf7n6Luuc",
    steps: [
      "Sit at the pulldown station, grip the bar wider than shoulder-width.",
      "Pull the bar down to your upper chest while retracting shoulder blades.",
      "Return the bar to the start position with control."
    ]
  },
  "overhead press": {
    youtubeId: "2yjwHeFToJ0",
    steps: [
      "Hold the barbell at your upper chest, feet shoulder-width apart.",
      "Press the bar overhead, extending arms fully and squeezing glutes.",
      "Lower the bar back to your upper chest."
    ]
  },
  "lateral raise": {
    youtubeId: "gwLzBJYoWlI",
    steps: [
      "Stand holding dumbbells at your sides, chest out.",
      "Raise your arms out to the sides until they are parallel to the floor.",
      "Slowly lower the dumbbells back to your sides."
    ]
  },
  "face pull": {
    youtubeId: "rep-qV5ibjI",
    steps: [
      "Hold rope handles from a high cable pulley, palms facing inward.",
      "Pull the rope toward your face, separating the ends toward your ears.",
      "Slowly return to the starting position."
    ]
  },
  "rear delt": {
    youtubeId: "z160v1H1o6o",
    steps: [
      "Bend forward at the hips, keeping your back flat.",
      "Raise dumbbells out to the sides, focusing on the back of your shoulders.",
      "Lower the weights back down with control."
    ]
  },
  "curl": {
    youtubeId: "ykJgr1RFoKo",
    steps: [
      "Stand holding weights, elbows tucked close to your torso.",
      "Squeeze biceps to curl the weights up while keeping upper arms still.",
      "Slowly lower the weights back to the starting position."
    ]
  },
  "skull crusher": {
    youtubeId: "d_KZxPfBYps",
    steps: [
      "Lie on a bench, hold barbell/dumbbell overhead with arms straight.",
      "Bend at the elbows to lower the weight to your forehead/behind head.",
      "Extend your arms back to the starting position."
    ]
  },
  "pushdown": {
    youtubeId: "2-LAMgAqyWY",
    steps: [
      "Hold the cable bar/rope at chest level, elbows tucked.",
      "Push the bar/rope down by extending your arms, squeezing triceps at the bottom.",
      "Slowly bring the cable back to chest level."
    ]
  },
  "dip": {
    youtubeId: "2z8JmcrW-As",
    steps: [
      "Support your body on dip bars, arms straight, knees bent.",
      "Lower your body by bending elbows to 90 degrees.",
      "Push back up to the starting position."
    ]
  },
  "squat": {
    youtubeId: "gcNh17Ckjgg",
    steps: [
      "Place barbell on upper back/traps, feet shoulder-width apart.",
      "Bend knees and hips, lowering your body as if sitting in a chair.",
      "Go down until thighs are parallel to the floor, then stand back up."
    ]
  },
  "leg press": {
    youtubeId: "IZxyjWwJYlU",
    steps: [
      "Sit on the machine, feet shoulder-width apart on the sled.",
      "Lower the sled toward your chest by bending knees to 90 degrees.",
      "Press the sled back up without locking your knees."
    ]
  },
  "lunge": {
    youtubeId: "QOVaHWMqZyU",
    steps: [
      "Stand tall, step forward with one leg.",
      "Lower your hips until your back knee is just above the floor.",
      "Push off your front foot to return to the starting position."
    ]
  },
  "hip thrust": {
    youtubeId: "LM8XHLYJoYs",
    steps: [
      "Sit on the floor, upper back against a bench, barbell over hips.",
      "Drive through your heels to lift your hips up to bench level.",
      "Squeeze glutes at the top, then lower your hips back down."
    ]
  },
  "glute bridge": {
    youtubeId: "wPM8co452Cw",
    steps: [
      "Lie on your back, knees bent, feet flat on the floor.",
      "Lift your hips off the floor, squeezing your glutes.",
      "Lower your hips back to the starting position."
    ]
  },
  "plank": {
    youtubeId: "pSHjTRCQxIw",
    steps: [
      "Place forearms on floor, elbows aligned under shoulders.",
      "Keep body in a straight line from head to heels, core engaged.",
      "Hold the position without letting hips sag."
    ]
  },
  "twist": {
    youtubeId: "wkD8rjkodUI",
    steps: [
      "Sit on the floor, knees bent, leaning back slightly.",
      "Hold hands or a weight, rotate your torso from side to side.",
      "Keep your core engaged throughout the movement."
    ]
  },
  "raise": {
    youtubeId: "hdZkxA1EDwg",
    steps: [
      "Lie on your back or hang from a bar, legs straight.",
      "Raise your legs up to 90 degrees (or hip height if hanging).",
      "Lower them slowly back to the starting position."
    ]
  }
};

const getExerciseInstruction = (name: string): VideoInstruction => {
  const cleanName = name.toLowerCase();
  for (const [key, value] of Object.entries(exerciseInstructions)) {
    if (cleanName.includes(key)) {
      return value;
    }
  }
  return {
    youtubeId: "gcNh17Ckjgg", // default fallback
    steps: [
      "Focus on performing the exercise with strict, controlled posture.",
      "Inhale on the eccentric phase (lowering) and exhale on the concentric phase (lifting).",
      "Ensure a full range of motion without locking out joints at the extreme point."
    ]
  };
};

interface DatabaseExercise {
  name: string;
  muscle: string;
  equipment: string;
}

const dbExercises: DatabaseExercise[] = [
  // Chest
  { name: "Bench Press (Barbell)", muscle: "Chest", equipment: "Barbell" },
  { name: "Incline Bench Press (Barbell)", muscle: "Chest", equipment: "Barbell" },
  { name: "Decline Bench Press (Barbell)", muscle: "Chest", equipment: "Barbell" },
  { name: "Bench Press (Dumbbell)", muscle: "Chest", equipment: "Dumbbell" },
  { name: "Incline Press (Dumbbell)", muscle: "Chest", equipment: "Dumbbell" },
  { name: "Chest Fly (Dumbbell)", muscle: "Chest", equipment: "Dumbbell" },
  { name: "Cable Crossover (Cable)", muscle: "Chest", equipment: "Cable" },
  { name: "Low to High Cable Fly (Cable)", muscle: "Chest", equipment: "Cable" },
  { name: "Pec Deck Fly (Machine)", muscle: "Chest", equipment: "Machine" },
  { name: "Chest Press (Machine)", muscle: "Chest", equipment: "Machine" },
  { name: "Push Up (None)", muscle: "Chest", equipment: "None" },
  { name: "Chest Dip (None)", muscle: "Chest", equipment: "None" },

  // Back
  { name: "Deadlift (Barbell)", muscle: "Back", equipment: "Barbell" },
  { name: "Bent Over Row (Barbell)", muscle: "Back", equipment: "Barbell" },
  { name: "T-Bar Row (Barbell)", muscle: "Back", equipment: "Barbell" },
  { name: "Single Arm Row (Dumbbell)", muscle: "Back", equipment: "Dumbbell" },
  { name: "Pullover (Dumbbell)", muscle: "Back", equipment: "Dumbbell" },
  { name: "Incline Chest Supported Row (Dumbbell)", muscle: "Back", equipment: "Dumbbell" },
  { name: "Lat Pulldown (Cable)", muscle: "Back", equipment: "Cable" },
  { name: "Seated Cable Row (Cable)", muscle: "Back", equipment: "Cable" },
  { name: "Straight Arm Pulldown (Cable)", muscle: "Back", equipment: "Cable" },
  { name: "Assisted Pull Up (Machine)", muscle: "Back", equipment: "Machine" },
  { name: "Machine Row (Machine)", muscle: "Back", equipment: "Machine" },
  { name: "Pull Up (None)", muscle: "Back", equipment: "None" },
  { name: "Chin Up (None)", muscle: "Back", equipment: "None" },
  { name: "Inverted Row (None)", muscle: "Back", equipment: "None" },

  // Shoulders
  { name: "Overhead Press (Barbell)", muscle: "Shoulders", equipment: "Barbell" },
  { name: "Push Press (Barbell)", muscle: "Shoulders", equipment: "Barbell" },
  { name: "Upright Row (Barbell)", muscle: "Shoulders", equipment: "Barbell" },
  { name: "Seated Shoulder Press (Dumbbell)", muscle: "Shoulders", equipment: "Dumbbell" },
  { name: "Lateral Raise (Dumbbell)", muscle: "Shoulders", equipment: "Dumbbell" },
  { name: "Front Raise (Dumbbell)", muscle: "Shoulders", equipment: "Dumbbell" },
  { name: "Reverse Fly (Dumbbell)", muscle: "Shoulders", equipment: "Dumbbell" },
  { name: "Lateral Raise (Cable)", muscle: "Shoulders", equipment: "Cable" },
  { name: "Face Pull (Cable)", muscle: "Shoulders", equipment: "Cable" },
  { name: "Shoulder Press (Machine)", muscle: "Shoulders", equipment: "Machine" },
  { name: "Reverse Pec Deck (Machine)", muscle: "Shoulders", equipment: "Machine" },
  { name: "Front Raise (Plate)", muscle: "Shoulders", equipment: "Plate" },

  // Biceps
  { name: "Bicep Curl (Barbell)", muscle: "Biceps", equipment: "Barbell" },
  { name: "EZ Bar Curl (Barbell)", muscle: "Biceps", equipment: "Barbell" },
  { name: "Bicep Curl (Dumbbell)", muscle: "Biceps", equipment: "Dumbbell" },
  { name: "Hammer Curl (Dumbbell)", muscle: "Biceps", equipment: "Dumbbell" },
  { name: "Incline Curl (Dumbbell)", muscle: "Biceps", equipment: "Dumbbell" },
  { name: "Concentration Curl (Dumbbell)", muscle: "Biceps", equipment: "Dumbbell" },
  { name: "Bicep Curl (Cable)", muscle: "Biceps", equipment: "Cable" },
  { name: "Overhead Cable Curl (Cable)", muscle: "Biceps", equipment: "Cable" },
  { name: "Preacher Curl (Machine)", muscle: "Biceps", equipment: "Machine" },

  // Triceps
  { name: "Close Grip Bench Press (Barbell)", muscle: "Triceps", equipment: "Barbell" },
  { name: "Skullcrusher (Barbell)", muscle: "Triceps", equipment: "Barbell" },
  { name: "Overhead Extension (Dumbbell)", muscle: "Triceps", equipment: "Dumbbell" },
  { name: "Tricep Kickback (Dumbbell)", muscle: "Triceps", equipment: "Dumbbell" },
  { name: "Tricep Pushdown (Cable)", muscle: "Triceps", equipment: "Cable" },
  { name: "Overhead Extension (Cable)", muscle: "Triceps", equipment: "Cable" },
  { name: "Tricep Extension (Machine)", muscle: "Triceps", equipment: "Machine" },
  { name: "Tricep Dip (None)", muscle: "Triceps", equipment: "None" },
  { name: "Diamond Push Up (None)", muscle: "Triceps", equipment: "None" },

  // Legs / Quads & Hamstrings
  { name: "Squat (Barbell)", muscle: "Quads", equipment: "Barbell" },
  { name: "Front Squat (Barbell)", muscle: "Quads", equipment: "Barbell" },
  { name: "Romanian Deadlift (Barbell)", muscle: "Hamstrings", equipment: "Barbell" },
  { name: "Good Morning (Barbell)", muscle: "Hamstrings", equipment: "Barbell" },
  { name: "Goblet Squat (Dumbbell)", muscle: "Quads", equipment: "Dumbbell" },
  { name: "Bulgarian Split Squat (Dumbbell)", muscle: "Quads", equipment: "Dumbbell" },
  { name: "Walking Lunge (Dumbbell)", muscle: "Quads", equipment: "Dumbbell" },
  { name: "Romanian Deadlift (Dumbbell)", muscle: "Hamstrings", equipment: "Dumbbell" },
  { name: "Leg Press (Machine)", muscle: "Quads", equipment: "Machine" },
  { name: "Leg Extension (Machine)", muscle: "Quads", equipment: "Machine" },
  { name: "Lying Leg Curl (Machine)", muscle: "Hamstrings", equipment: "Machine" },
  { name: "Seated Leg Curl (Machine)", muscle: "Hamstrings", equipment: "Machine" },
  { name: "Cable Pull Through (Cable)", muscle: "Hamstrings", equipment: "Cable" },
  { name: "Pistol Squat (None)", muscle: "Quads", equipment: "None" },

  // Calves & Glutes
  { name: "Standing Calf Raise (Barbell)", muscle: "Calves", equipment: "Barbell" },
  { name: "Hip Thrust (Barbell)", muscle: "Glutes", equipment: "Barbell" },
  { name: "Calf Raise (Dumbbell)", muscle: "Calves", equipment: "Dumbbell" },
  { name: "Standing Calf Raise (Machine)", muscle: "Calves", equipment: "Machine" },
  { name: "Seated Calf Raise (Machine)", muscle: "Calves", equipment: "Machine" },
  { name: "Hip Abductor (Machine)", muscle: "Glutes", equipment: "Machine" },
  { name: "Glute Kickback (Cable)", muscle: "Glutes", equipment: "Cable" },
  { name: "Glute Bridge (None)", muscle: "Glutes", equipment: "None" },

  // Abdominals (Core)
  { name: "Crunch (None)", muscle: "Abdominals", equipment: "None" },
  { name: "Plank (None)", muscle: "Abdominals", equipment: "None" },
  { name: "Leg Raise (None)", muscle: "Abdominals", equipment: "None" },
  { name: "Bicycle Crunch (None)", muscle: "Abdominals", equipment: "None" },
  { name: "Cable Crunch (Cable)", muscle: "Abdominals", equipment: "Cable" },
  { name: "Woodchopper (Cable)", muscle: "Abdominals", equipment: "Cable" },
  { name: "Ab Crunch (Machine)", muscle: "Abdominals", equipment: "Machine" },
  { name: "Russian Twist (Dumbbell)", muscle: "Abdominals", equipment: "Dumbbell" },
  { name: "Weighted Crunch (Plate)", muscle: "Abdominals", equipment: "Plate" }
];

const equipmentOptions = [
  { id: "all", label: "All Equipment", icon: "🌐" },
  { id: "None", label: "None", icon: "🤸" },
  { id: "Barbell", label: "Barbell", icon: "🏋️‍♂️" },
  { id: "Dumbbell", label: "Dumbbell", icon: "🏋️" },
  { id: "Kettlebell", label: "Kettlebell", icon: "⚙️" },
  { id: "Machine", label: "Machine", icon: "🏗️" },
  { id: "Plate", label: "Plate", icon: "💿" },
  { id: "Resistance Band", label: "Resistance Band", icon: "🔗" },
  { id: "Cable", label: "Cable", icon: "🔌" }
];

const muscleOptions = [
  { id: "all", label: "All Muscles", icon: "🌐" },
  { id: "Abdominals", label: "Abdominals", icon: "🧘" },
  { id: "Abductors", label: "Abductors", icon: "🦵" },
  { id: "Adductors", label: "Adductors", icon: "🦵" },
  { id: "Biceps", label: "Biceps", icon: "💪" },
  { id: "Calves", label: "Calves", icon: "🏔️" },
  { id: "Cardio", label: "Cardio", icon: "🏃" },
  { id: "Chest", label: "Chest", icon: "🫁" },
  { id: "Glutes", label: "Glutes", icon: "🍑" },
  { id: "Hamstrings", label: "Hamstrings", icon: "🦵" },
  { id: "Quads", label: "Quads", icon: "🦵" },
  { id: "Shoulders", label: "Shoulders", icon: "🤷" },
  { id: "Triceps", label: "Triceps", icon: "💪" }
];

const defaultExercisesData = [
  { name: "Arnold Press (Dumbbell)", sets: 3, reps: 10 },
  { name: "Squats (Barbell)", sets: 4, reps: 8 },
  { name: "Plank Hold", sets: 3, reps: 60 },
];

const WorkoutTracker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const state = location.state as { routineName?: string; exercises?: { name: string; sets?: number; reps?: number }[] } | null;
  const routineName = state?.routineName || "Workout Session";

  // Map state exercises to detailed sets structure
  const [exercises, setExercises] = useState<ActiveExercise[]>(() => {
    const rawExs = state?.exercises || defaultExercisesData;
    return rawExs.map((ex, idx) => {
      const setsCount = ex.sets || 3;
      const defaultWeight = ex.name.toLowerCase().includes("squat") ? "60" : "15";
      const repsVal = String(ex.reps || 10);
      return {
        id: `ex-${Date.now()}-${idx}-${Math.random()}`,
        name: ex.name,
        notes: "",
        sets: Array.from({ length: setsCount }).map((_, sIdx) => {
          const type = sIdx === 0 && setsCount > 1 ? "W" : "S";
          return {
            id: `set-${Date.now()}-${idx}-${sIdx}-${Math.random()}`,
            type,
            weight: defaultWeight,
            reps: repsVal,
            previous: `${parseFloat(defaultWeight) - 2.5 * sIdx}kg x ${repsVal}`,
            completed: false,
          };
        }),
      };
    });
  });

  // Modal State for Video Instruction
  const [instructionExercise, setInstructionExercise] = useState<string | null>(null);

  // Add Exercise Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [showEquipFilterSheet, setShowEquipFilterSheet] = useState(false);
  const [showMuscleFilterSheet, setShowMuscleFilterSheet] = useState(false);

  // Timer & active state
  const [timer, setTimer] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(true); // Active immediately on load
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Start timer on load
    timerIntervalRef.current = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Summary Metrics
  const totalVolume = exercises.reduce((acc, ex) => {
    return acc + ex.sets.reduce((sAcc, set) => {
      if (set.completed) {
        const w = parseFloat(set.weight) || 0;
        const r = parseInt(set.reps) || 0;
        return sAcc + (w * r);
      }
      return sAcc;
    }, 0);
  }, 0);

  const totalSetsCompleted = exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter(s => s.completed).length;
  }, 0);

  const toggleSetComplete = (exId: string, setId: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === exId) {
          return {
            ...ex,
            sets: ex.sets.map(s => {
              if (s.id === setId) {
                return { ...s, completed: !s.completed };
              }
              return s;
            }),
          };
        }
        return ex;
      })
    );
  };

  const addSetToExercise = (exId: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === exId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          const newWeight = lastSet ? lastSet.weight : "60";
          const newReps = lastSet ? lastSet.reps : "10";
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: `set-${Date.now()}-${Math.random()}`,
                type: "S",
                weight: newWeight,
                reps: newReps,
                previous: lastSet ? `${lastSet.weight}kg x ${lastSet.reps}` : "—",
                completed: false,
              },
            ],
          };
        }
        return ex;
      })
    );
  };

  const updateSetField = (exId: string, setId: string, field: "weight" | "reps", value: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === exId) {
          return {
            ...ex,
            sets: ex.sets.map(s => {
              if (s.id === setId) {
                return { ...s, [field]: value };
              }
              return s;
            }),
          };
        }
        return ex;
      })
    );
  };

  const deleteSetRow = (exId: string, setId: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === exId) {
          return {
            ...ex,
            sets: ex.sets.filter(s => s.id !== setId),
          };
        }
        return ex;
      })
    );
  };

  const addExercise = () => {
    setSearchQuery("");
    setSelectedEquipment("all");
    setSelectedMuscle("all");
    setShowAddModal(true);
  };

  const handleSelectDbExercise = (dbExName: string) => {
    const defaultWeight = dbExName.toLowerCase().includes("squat") || dbExName.toLowerCase().includes("press") || dbExName.toLowerCase().includes("deadlift") ? "40" : "15";
    setExercises(prev => [
      ...prev,
      {
        id: `ex-${Date.now()}-${Math.random()}`,
        name: dbExName,
        notes: "",
        sets: [
          {
            id: `set-${Date.now()}-${Math.random()}`,
            type: "S",
            weight: defaultWeight,
            reps: "10",
            previous: "—",
            completed: false,
          },
        ],
      },
    ]);
    setShowAddModal(false);
    toast({
      title: "Exercise Added! 💪",
      description: `Added ${dbExName} to your workout.`
    });
  };

  const handleCreateCustomExercise = () => {
    const name = prompt("Enter Custom Exercise Name:");
    if (name) {
      handleSelectDbExercise(name);
    }
  };

  const handleNotesChange = (exId: string, val: string) => {
    setExercises(prev =>
      prev.map(ex => (ex.id === exId ? { ...ex, notes: val } : ex))
    );
  };

  const stopWorkout = () => {
    setIsWorkoutActive(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const duration = Math.round(timer / 60) || 1;
    const calories = Math.round(timer * 0.15) || 5;
    const todayStr = new Date().toISOString().split("T")[0];

    const completedExercisesCount = exercises.filter(ex => ex.sets.some(s => s.completed)).length;

    const newLog = {
      id: `w-log-${Date.now()}`,
      name: routineName,
      date: todayStr,
      duration,
      calories,
      exercisesCompleted: completedExercisesCount,
      totalExercises: exercises.length,
      volume: totalVolume,
      setsCount: totalSetsCompleted,
    };

    const saved = localStorage.getItem("ado-workout-log");
    const logs = saved ? JSON.parse(saved) : [];
    logs.push(newLog);
    localStorage.setItem("ado-workout-log", JSON.stringify(logs));

    // Mark today active in active days
    const activeDaysSaved = localStorage.getItem("ado-active-days");
    const activeDays = activeDaysSaved ? JSON.parse(activeDaysSaved) : [];
    if (!activeDays.includes(todayStr)) {
      activeDays.push(todayStr);
      localStorage.setItem("ado-active-days", JSON.stringify(activeDays));
    }

    toast({
      title: "Workout Completed! 🎉",
      description: `Saved ${routineName}: ${duration} min · Volume: ${totalVolume} kg.`,
    });
    
    // Redirect to analytics
    navigate("/progress");
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    return `${mins}min`;
  };

  const filteredDbExercises = dbExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || ex.muscle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEquipment = selectedEquipment === "all" || ex.equipment.toLowerCase() === selectedEquipment.toLowerCase();
    const matchesMuscle = selectedMuscle === "all" || ex.muscle.toLowerCase() === selectedMuscle.toLowerCase();
    return matchesSearch && matchesEquipment && matchesMuscle;
  });

  const groupedExercises: Record<string, DatabaseExercise[]> = {};
  filteredDbExercises.sort((a, b) => a.name.localeCompare(b.name)).forEach(ex => {
    const firstLetter = ex.name.charAt(0).toUpperCase();
    if (!groupedExercises[firstLetter]) {
      groupedExercises[firstLetter] = [];
    }
    groupedExercises[firstLetter].push(ex);
  });

  const activeInstruction = instructionExercise ? getExerciseInstruction(instructionExercise) : null;

  return (
    <MobileLayout>
      <div className="animate-fade-in px-4 pt-6 pb-28 min-h-screen bg-background text-foreground">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-border/30 pb-3">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-secondary/40 rounded-full transition-colors">
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <h1 className="text-base font-bold text-card-foreground">Log Workout</h1>
          </div>
          <div className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-muted-foreground animate-pulse" />
            <button 
              onClick={stopWorkout}
              className="bg-[#1C64F2] hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-md active:scale-95 transition-transform"
            >
              Finish
            </button>
          </div>
        </div>

        {/* Workout Info Stats Bar */}
        <div className="grid grid-cols-3 gap-2 bg-card border border-border/30 rounded-2xl p-4 mb-6 text-center shadow-sm">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Time</p>
            <p className="text-sm font-bold text-primary mt-0.5">{formatTimer(timer)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Volume</p>
            <p className="text-sm font-bold text-card-foreground mt-0.5">{totalVolume} kg</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Sets</p>
            <p className="text-sm font-bold text-card-foreground mt-0.5">{totalSetsCompleted}</p>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm">
              
              {/* Exercise Header (Click name to open instructions) */}
              <div className="flex items-center justify-between mb-3">
                <button 
                  onClick={() => setInstructionExercise(exercise.name)}
                  className="flex items-center gap-3 text-left group hover:opacity-85 transition-opacity"
                  title="Tap to see instructions"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                    <Dumbbell className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C64F2] flex items-center gap-1">
                      {exercise.name} 
                      <span className="text-[9px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Info className="h-2.5 w-2.5" /> Video
                      </span>
                    </h3>
                  </div>
                </button>
                <button className="p-1 hover:bg-secondary/40 rounded-full text-muted-foreground">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Notes Field */}
              <input 
                type="text" 
                placeholder="Add notes here..." 
                value={exercise.notes}
                onChange={(e) => handleNotesChange(exercise.id, e.target.value)}
                className="w-full bg-secondary/50 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none border border-border/20 mb-3"
              />

              {/* Rest Timer Banner */}
              <div className="flex items-center gap-1.5 text-[#1C64F2] text-[10px] font-bold mb-4 bg-[#1C64F2]/5 px-3 py-1.5 rounded-lg border border-[#1C64F2]/10 w-fit">
                <Timer className="h-3.5 w-3.5" />
                <span>Rest Timer: 2min 30s</span>
              </div>

              {/* Sets Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 text-[9px] font-bold uppercase text-muted-foreground">
                      <th className="py-1 w-10 text-center">Set</th>
                      <th className="py-1 pl-2">Previous</th>
                      <th className="py-1 text-center w-16">kg</th>
                      <th className="py-1 text-center w-16">Reps</th>
                      <th className="py-1 text-center w-10">✓</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {exercise.sets.map((set, sIdx) => (
                      <tr 
                        key={set.id}
                        className={`transition-colors border-b border-border/10 last:border-0 ${
                          set.completed 
                            ? "bg-[#2D452B]/20 text-[#58D66D]" 
                            : "hover:bg-secondary/20"
                        }`}
                      >
                        {/* Set Type Label */}
                        <td className="py-2 text-xs font-bold text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                            set.type === "W" ? "bg-amber-500/10 text-amber-500" : "text-muted-foreground"
                          }`}>
                            {set.type === "W" ? "W" : `${sIdx}`}
                          </span>
                        </td>

                        {/* Previous stats */}
                        <td className="py-2 pl-2 text-[10px] text-muted-foreground font-medium">
                          {set.previous}
                        </td>

                        {/* Weight input */}
                        <td className="py-2 text-center">
                          <input 
                            type="number" 
                            value={set.weight} 
                            disabled={set.completed}
                            onChange={(e) => updateSetField(exercise.id, set.id, "weight", e.target.value)}
                            className="w-12 bg-secondary border border-border/30 rounded py-1 text-center text-xs font-bold outline-none text-foreground disabled:opacity-50"
                          />
                        </td>

                        {/* Reps input */}
                        <td className="py-2 text-center">
                          <input 
                            type="number" 
                            value={set.reps} 
                            disabled={set.completed}
                            onChange={(e) => updateSetField(exercise.id, set.id, "reps", e.target.value)}
                            className="w-12 bg-secondary border border-border/30 rounded py-1 text-center text-xs font-bold outline-none text-foreground disabled:opacity-50"
                          />
                        </td>

                        {/* Checkbox */}
                        <td className="py-2 text-center">
                          <button
                            onClick={() => toggleSetComplete(exercise.id, set.id)}
                            className={`h-6 w-6 rounded flex items-center justify-center border transition-all ${
                              set.completed 
                                ? "bg-[#58D66D] border-[#58D66D] text-white" 
                                : "bg-secondary border-border hover:border-muted-foreground text-transparent"
                            }`}
                          >
                            <Check className="h-4.5 w-4.5 stroke-[3]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Set Button */}
              <button
                onClick={() => addSetToExercise(exercise.id)}
                className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl bg-secondary/50 border border-border/20 py-2.5 text-xs font-bold text-muted-foreground hover:bg-secondary active:scale-[0.98] transition-all"
              >
                <Plus className="h-4 w-4" /> Add Set
              </button>
            </div>
          ))}
        </div>

        {/* Add Exercise Button */}
        <button
          onClick={addExercise}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-[#1C64F2] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
        >
          <Plus className="h-5 w-5" /> Add Exercise
        </button>

      </div>

      {/* Video Instruction Modal Overlay */}
      {instructionExercise && activeInstruction && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 animate-fade-in"
          onClick={() => setInstructionExercise(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-card border border-border p-5 text-left animate-scale-in relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-card-foreground flex items-center gap-2">
                <Play className="h-4 w-4 text-primary fill-current" /> {instructionExercise}
              </h3>
              <button 
                onClick={() => setInstructionExercise(null)}
                className="p-1 hover:bg-secondary/40 rounded-full transition-colors text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* YouTube Iframe Player (Pull from Youtube as requested) */}
            <div className="w-full aspect-video rounded-xl bg-black overflow-hidden border border-border/40 shadow-inner relative mb-4">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeInstruction.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${activeInstruction.youtubeId}`}
                title={`${instructionExercise} instruction video`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Steps Instruction list */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Instructions</p>
              <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {activeInstruction.steps.map((step, sIdx) => (
                  <li key={sIdx} className="flex gap-2 items-start text-[10px] text-muted-foreground leading-normal">
                    <span className="h-4 w-4 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button 
              onClick={() => setInstructionExercise(null)}
              className="mt-5 w-full rounded-xl bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-secondary/80 active:scale-95 transition-transform"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* iOS-style Add Exercise bottom sheet modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full h-[90vh] rounded-t-[28px] bg-card border-t border-border/30 flex flex-col overflow-hidden animate-slide-up shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/20 shrink-0">
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-sm font-semibold text-[#1C64F2] hover:opacity-80 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <h2 className="text-sm font-bold text-card-foreground">Add Exercise</h2>
              <button 
                onClick={handleCreateCustomExercise}
                className="text-sm font-semibold text-[#1C64F2] hover:opacity-80 active:scale-95 transition-all"
              >
                Create
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3 shrink-0">
              <div className="relative flex items-center bg-secondary/60 rounded-2xl border border-border/10 px-3 py-2.5">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input
                  type="text"
                  placeholder="Search exercise"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-xs font-semibold outline-none text-foreground placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="p-0.5 rounded-full bg-muted/40 hover:bg-muted/60 text-muted-foreground">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 px-4 pb-3 border-b border-border/10 shrink-0 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setShowEquipFilterSheet(true)}
                className="flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary border border-border/40 rounded-full px-3 py-1.5 text-[10px] font-bold text-muted-foreground transition-all shrink-0"
              >
                <span>Equipment: {equipmentOptions.find(e => e.id === selectedEquipment)?.label}</span>
                <span className="text-[8px]">▼</span>
              </button>
              <button
                onClick={() => setShowMuscleFilterSheet(true)}
                className="flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary border border-border/40 rounded-full px-3 py-1.5 text-[10px] font-bold text-muted-foreground transition-all shrink-0"
              >
                <span>Muscle Group: {muscleOptions.find(m => m.id === selectedMuscle)?.label}</span>
                <span className="text-[8px]">▼</span>
              </button>
            </div>

            {/* Scrollable Exercise List */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {Object.keys(groupedExercises).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-3xl mb-2">🔍</span>
                  <p className="text-xs font-bold text-muted-foreground">No exercises match your search</p>
                  <button 
                    onClick={handleCreateCustomExercise} 
                    className="mt-3 text-xs text-[#1C64F2] font-semibold hover:underline"
                  >
                    Create custom exercise instead
                  </button>
                </div>
              ) : (
                Object.keys(groupedExercises).sort().map(letter => (
                  <div key={letter} className="mb-5">
                    {/* Alphabet Header */}
                    <h3 className="text-xs font-extrabold text-muted-foreground px-2 py-1 sticky top-0 bg-card z-10">{letter}</h3>
                    
                    {/* Exercises list */}
                    <div className="mt-1.5 bg-secondary/15 rounded-2xl border border-border/10 overflow-hidden divide-y divide-border/10">
                      {groupedExercises[letter].map((ex, exIdx) => {
                        const muscleObj = muscleOptions.find(m => m.id === ex.muscle);
                        return (
                          <div 
                            key={exIdx}
                            className="flex items-center justify-between p-3 hover:bg-secondary/20 transition-all cursor-pointer"
                            onClick={() => handleSelectDbExercise(ex.name)}
                          >
                            <div className="flex items-center gap-3">
                              {/* Avatar badge */}
                              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-lg shadow-sm border border-border/10 shrink-0">
                                {muscleObj?.icon || "💪"}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-foreground">{ex.name}</h4>
                                <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{ex.muscle} · {ex.equipment}</p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectDbExercise(ex.name);
                              }}
                              className="h-6 w-6 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary active:scale-90 transition-transform shrink-0"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* Equipment Selection Sub-Sheet Modal */}
      {showEquipFilterSheet && (
        <div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowEquipFilterSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full h-[55vh] rounded-t-[28px] bg-card border-t border-border/30 flex flex-col overflow-hidden animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/20 shrink-0">
              <span className="w-12" />
              <h2 className="text-sm font-bold text-card-foreground">Equipment</h2>
              <button onClick={() => setShowEquipFilterSheet(false)} className="text-sm font-semibold text-[#1C64F2]">Done</button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-border/15">
              {equipmentOptions.map(eq => (
                <button
                  key={eq.id}
                  onClick={() => {
                    setSelectedEquipment(eq.id);
                    setShowEquipFilterSheet(false);
                  }}
                  className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-secondary/20 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{eq.icon}</span>
                    <span className="text-xs font-semibold">{eq.label}</span>
                  </div>
                  {selectedEquipment === eq.id && <Check className="h-4 w-4 text-[#1C64F2] stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Muscle Group Selection Sub-Sheet Modal */}
      {showMuscleFilterSheet && (
        <div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowMuscleFilterSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full h-[60vh] rounded-t-[28px] bg-card border-t border-border/30 flex flex-col overflow-hidden animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/20 shrink-0">
              <span className="w-12" />
              <h2 className="text-sm font-bold text-card-foreground">Muscle Group</h2>
              <button onClick={() => setShowMuscleFilterSheet(false)} className="text-sm font-semibold text-[#1C64F2]">Done</button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-border/15">
              {muscleOptions.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMuscle(m.id);
                    setShowMuscleFilterSheet(false);
                  }}
                  className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-secondary/20 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-xs font-semibold">{m.label}</span>
                  </div>
                  {selectedMuscle === m.id && <Check className="h-4 w-4 text-[#1C64F2] stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default WorkoutTracker;
