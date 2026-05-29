import { ChevronRight, ChevronDown, Plus, Play, MoreHorizontal, Dumbbell, Compass, FilePlus, Sparkles, Folder, FolderOpen, Clock, Heart, Trash2, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
}

interface Routine {
  id: string;
  name: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  exercises: Exercise[];
}

interface RoutineGroup {
  id: string;
  name: string;
  routines: Routine[];
}

const defaultGroups: RoutineGroup[] = [
  {
    id: "upper-lower",
    name: "4-day Upper/Lower",
    routines: [
      {
        id: "ul-1",
        name: "Upper Body A",
        duration: "45 mins",
        difficulty: "Medium",
        exercises: [
          { name: "Bench Press", sets: 4, reps: 10 },
          { name: "Lat Pulldown", sets: 4, reps: 12 },
          { name: "Overhead Press", sets: 3, reps: 10 },
          { name: "Bicep Curls", sets: 3, reps: 12 },
        ],
      },
      {
        id: "ul-2",
        name: "Lower Body A",
        duration: "45 mins",
        difficulty: "Medium",
        exercises: [
          { name: "Squats", sets: 4, reps: 10 },
          { name: "Leg Curls", sets: 3, reps: 12 },
          { name: "Calf Raises", sets: 4, reps: 15 },
          { name: "Plank", sets: 3, reps: 60 },
        ],
      },
      {
        id: "ul-3",
        name: "Upper Body B",
        duration: "45 mins",
        difficulty: "Medium",
        exercises: [
          { name: "Incline Bench Press", sets: 4, reps: 10 },
          { name: "Barbell Rows", sets: 4, reps: 10 },
          { name: "Lateral Raises", sets: 3, reps: 12 },
          { name: "Tricep Pushdowns", sets: 3, reps: 12 },
        ],
      },
      {
        id: "ul-4",
        name: "Lower Body B",
        duration: "45 mins",
        difficulty: "Hard",
        exercises: [
          { name: "Deadlifts", sets: 4, reps: 8 },
          { name: "Leg Extensions", sets: 3, reps: 12 },
          { name: "Lunges", sets: 3, reps: 10 },
          { name: "Russian Twists", sets: 3, reps: 20 },
        ],
      },
    ],
  },
  {
    id: "push-pull-legs",
    name: "Beginner Push/Pull/Legs (Gym Equipment) (3)",
    routines: [
      {
        id: "ppl-1",
        name: "Day 1: Push",
        duration: "35 mins",
        difficulty: "Easy",
        exercises: [
          { name: "Flat Bench Press", sets: 3, reps: 10 },
          { name: "Overhead Shoulder Press", sets: 3, reps: 12 },
          { name: "Incline Dumbbell Flyes", sets: 3, reps: 12 },
          { name: "Tricep Dips", sets: 3, reps: 10 },
        ],
      },
      {
        id: "ppl-2",
        name: "Day 2: Pull",
        duration: "35 mins",
        difficulty: "Easy",
        exercises: [
          { name: "Lat Pulldown", sets: 3, reps: 12 },
          { name: "Seated Cable Row", sets: 3, reps: 12 },
          { name: "Face Pulls", sets: 3, reps: 15 },
          { name: "Barbell Bicep Curls", sets: 3, reps: 12 },
        ],
      },
      {
        id: "ppl-3",
        name: "Day 3: Legs",
        duration: "40 mins",
        difficulty: "Medium",
        exercises: [
          { name: "Barbell Squats", sets: 4, reps: 10 },
          { name: "Leg Press Machine", sets: 3, reps: 12 },
          { name: "Lying Leg Curls", sets: 3, reps: 12 },
          { name: "Standing Calf Raises", sets: 4, reps: 15 },
        ],
      },
    ],
  },
  {
    id: "home-dumbbell",
    name: "Home Dumbbell Workouts (1)",
    routines: [
      {
        id: "hd-1",
        name: "Full Body DB",
        duration: "40 mins",
        difficulty: "Easy",
        exercises: [
          { name: "Goblet Squats", sets: 3, reps: 12 },
          { name: "DB Bench Press", sets: 3, reps: 12 },
          { name: "DB One-Arm Rows", sets: 3, reps: 12 },
          { name: "DB Shoulder Press", sets: 3, reps: 10 },
          { name: "DB Hammer Curls", sets: 3, reps: 12 },
        ],
      },
    ],
  },
  {
    id: "upper-lower-strength",
    name: "Upper/Lower Strength (1)",
    routines: [
      {
        id: "uls-1",
        name: "Strength Upper",
        duration: "50 mins",
        difficulty: "Hard",
        exercises: [
          { name: "Bench Press", sets: 5, reps: 5 },
          { name: "Barbell Rows", sets: 5, reps: 5 },
          { name: "Weighted Dips", sets: 3, reps: 8 },
        ],
      },
    ],
  },
  {
    id: "bro-split",
    name: "Modified Bro Split (1)",
    routines: [
      {
        id: "bs-1",
        name: "Chest & Triceps",
        duration: "40 mins",
        difficulty: "Medium",
        exercises: [
          { name: "Flat Bench Press", sets: 4, reps: 10 },
          { name: "Incline DB Press", sets: 3, reps: 12 },
          { name: "Cable Chest Flyes", sets: 3, reps: 12 },
          { name: "Tricep Pushdown", sets: 3, reps: 12 },
        ],
      },
    ],
  },
];

const difficultyColor: Record<string, string> = {
  Easy: "text-gym-green bg-gym-green/15",
  Medium: "text-gym-gold bg-gym-gold/15",
  Hard: "text-destructive bg-destructive/15",
  Expert: "text-purple-400 bg-purple-400/15",
};

const WorkoutDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<RoutineGroup[]>(defaultGroups);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "push-pull-legs": true, // Default open for demonstration
  });
  const [expandedRoutines, setExpandedRoutines] = useState<Record<string, boolean>>({});
  
  // Custom routine creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineGroup, setNewRoutineGroup] = useState("my-routines");
  const [newRoutineExercises, setNewRoutineExercises] = useState<Exercise[]>([
    { name: "", sets: 3, reps: 12 },
  ]);

  // Load custom routines from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ado-custom-routines");
    const customRoutines: Routine[] = saved ? JSON.parse(saved) : [
      {
        id: "custom-1",
        name: "My Core Blast",
        duration: "20 mins",
        difficulty: "Easy",
        exercises: [
          { name: "Plank Hold", sets: 3, reps: 60 },
          { name: "Bicycle Crunches", sets: 3, reps: 20 },
          { name: "Hanging Leg Raises", sets: 3, reps: 12 },
        ],
      },
      {
        id: "custom-2",
        name: "Quick Cardio Burn",
        duration: "15 mins",
        difficulty: "Medium",
        exercises: [
          { name: "Burpees", sets: 3, reps: 10 },
          { name: "Mountain Climbers", sets: 3, reps: 30 },
          { name: "Jump Squats", sets: 3, reps: 12 },
        ],
      },
    ];

    setGroups((prev) => {
      // Find if My Routines already exists
      const existingMyRoutinesIndex = prev.findIndex((g) => g.id === "my-routines");
      const myRoutinesGroup = {
        id: "my-routines",
        name: `My Routines (${customRoutines.length})`,
        routines: customRoutines,
      };

      if (existingMyRoutinesIndex > -1) {
        const next = [...prev];
        next[existingMyRoutinesIndex] = myRoutinesGroup;
        return next;
      } else {
        return [...prev, myRoutinesGroup];
      }
    });
  }, []);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleRoutine = (routineId: string) => {
    setExpandedRoutines((prev) => ({
      ...prev,
      [routineId]: !prev[routineId],
    }));
  };

  const startEmptyWorkout = () => {
    navigate("/workout-active", {
      state: {
        routineName: "Empty Workout",
        exercises: [{ name: "First Exercise", sets: 3, reps: 10, completed: false }],
      },
    });
    toast({ title: "Started empty workout!" });
  };

  const startRoutine = (routine: Routine) => {
    const activeExercises = routine.exercises.map((ex) => ({
      ...ex,
      completed: false,
    }));
    navigate("/workout-active", {
      state: {
        routineName: routine.name,
        exercises: activeExercises,
      },
    });
    toast({ title: `Started ${routine.name}!` });
  };

  const handleAddExerciseRow = () => {
    setNewRoutineExercises((prev) => [...prev, { name: "", sets: 3, reps: 12 }]);
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: any) => {
    setNewRoutineExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };

  const handleRemoveExerciseRow = (index: number) => {
    setNewRoutineExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateRoutine = () => {
    if (!newRoutineName.trim()) {
      toast({ title: "Routine name is required", variant: "destructive" });
      return;
    }
    const filteredExercises = newRoutineExercises.filter((ex) => ex.name.trim() !== "");
    if (filteredExercises.length === 0) {
      toast({ title: "Please add at least one exercise", variant: "destructive" });
      return;
    }

    const saved = localStorage.getItem("ado-custom-routines");
    const customRoutines: Routine[] = saved ? JSON.parse(saved) : [
      {
        id: "custom-1",
        name: "My Core Blast",
        duration: "20 mins",
        difficulty: "Easy",
        exercises: [
          { name: "Plank Hold", sets: 3, reps: 60 },
          { name: "Bicycle Crunches", sets: 3, reps: 20 },
          { name: "Hanging Leg Raises", sets: 3, reps: 12 },
        ],
      },
      {
        id: "custom-2",
        name: "Quick Cardio Burn",
        duration: "15 mins",
        difficulty: "Medium",
        exercises: [
          { name: "Burpees", sets: 3, reps: 10 },
          { name: "Mountain Climbers", sets: 3, reps: 30 },
          { name: "Jump Squats", sets: 3, reps: 12 },
        ],
      },
    ];

    const newRoutine: Routine = {
      id: `custom-${Date.now()}`,
      name: newRoutineName,
      duration: `${filteredExercises.length * 8} mins`,
      difficulty: "Medium",
      exercises: filteredExercises,
    };

    const nextCustoms = [newRoutine, ...customRoutines];
    localStorage.setItem("ado-custom-routines", JSON.stringify(nextCustoms));

    // Update list state
    setGroups((prev) =>
      prev.map((g) =>
        g.id === "my-routines"
          ? {
              ...g,
              name: `My Routines (${nextCustoms.length})`,
              routines: nextCustoms,
            }
          : g
      )
    );

    // Reset state & close
    setNewRoutineName("");
    setNewRoutineExercises([{ name: "", sets: 3, reps: 12 }]);
    setShowCreateModal(false);
    toast({ title: "Routine created successfully!" });
  };

  const deleteCustomRoutine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = localStorage.getItem("ado-custom-routines");
    if (!saved) return;
    const customs: Routine[] = JSON.parse(saved);
    const filtered = customs.filter((r) => r.id !== id);
    localStorage.setItem("ado-custom-routines", JSON.stringify(filtered));

    setGroups((prev) =>
      prev.map((g) =>
        g.id === "my-routines"
          ? {
              ...g,
              name: `My Routines (${filtered.length})`,
              routines: filtered,
            }
          : g
      )
    );
    toast({ title: "Routine deleted" });
  };

  return (
    <MobileLayout>
      <div className="animate-fade-in px-4 pt-6 pb-24 min-h-screen bg-background text-foreground">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Workout</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="h-9 w-9 rounded-full bg-card border border-border/40 flex items-center justify-center transition-transform active:scale-90"
          >
            <Plus className="h-5 w-5 text-primary" />
          </button>
        </div>

        {/* Quick Start Section */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Quick Start</h2>
          <button 
            onClick={startEmptyWorkout}
            className="w-full bg-card border border-border/40 hover:bg-secondary/40 rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-[0.98] text-left"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Start Empty Workout</p>
              <p className="text-[10px] text-muted-foreground">Log an ad-hoc session on the fly</p>
            </div>
          </button>
        </div>

        {/* Action Options */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Routines</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-card hover:bg-secondary/35 border border-border/40 rounded-2xl p-4 flex flex-col items-center gap-2 justify-center text-center transition-transform active:scale-95 py-5"
            >
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <FilePlus className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold">New Routine</p>
              <p className="text-[9px] text-muted-foreground">Build custom exercise set</p>
            </button>
            <button 
              onClick={() => navigate("/workouts")}
              className="bg-card hover:bg-secondary/35 border border-border/40 rounded-2xl p-4 flex flex-col items-center gap-2 justify-center text-center transition-transform active:scale-95 py-5"
            >
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Compass className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold">Explore</p>
              <p className="text-[9px] text-muted-foreground">Find curated workout programs</p>
            </button>
          </div>
          
          {/* Posture Coach Action Card */}
          <button 
            onClick={() => navigate("/posture-coach")}
            className="w-full mt-3 bg-gradient-to-r from-[#1C64F2]/10 to-transparent hover:from-[#1C64F2]/15 border border-[#1C64F2]/25 rounded-2xl p-4 flex items-center gap-3.5 transition-all active:scale-[0.98] text-left"
          >
            <div className="h-10 w-10 rounded-xl bg-[#1C64F2]/20 border border-[#1C64F2]/30 flex items-center justify-center text-[#4A85F6] shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold flex items-center gap-1.5 text-card-foreground">
                AI Posture Coach
                <span className="text-[8px] bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Live</span>
              </p>
              <p className="text-[9px] text-muted-foreground">Get real-time audio corrections & form checks</p>
            </div>
            <span className="text-xs text-muted-foreground font-bold">→</span>
          </button>
        </div>

        {/* Routines Collapsible Lists (Accordion format) */}
        <div className="space-y-2.5">
          {groups.map((group) => {
            const isGroupOpen = !!expandedGroups[group.id];
            return (
              <div key={group.id} className="border border-border/30 rounded-2xl bg-card overflow-hidden transition-all shadow-sm">
                
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isGroupOpen ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-muted/20'}`}>
                      {isGroupOpen ? <FolderOpen className="h-4.5 w-4.5" /> : <Folder className="h-4.5 w-4.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-card-foreground">{group.name}</p>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isGroupOpen ? "rotate-90" : ""}`} />
                </button>

                {/* Accordion Content */}
                {isGroupOpen && (
                  <div className="border-t border-border/40 bg-secondary/10 px-4 py-2 space-y-2 animate-fade-in">
                    {group.routines.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground text-center py-4">No routines found here yet.</p>
                    ) : (
                      group.routines.map((routine) => {
                        const isRoutineOpen = !!expandedRoutines[routine.id];
                        return (
                          <div key={routine.id} className="border border-border/20 rounded-xl bg-card overflow-hidden">
                            <button
                              onClick={() => toggleRoutine(routine.id)}
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/10"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold">{routine.name}</h4>
                                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold ${difficultyColor[routine.difficulty]}`}>{routine.difficulty}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[9px] text-muted-foreground">{routine.duration}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Dumbbell className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[9px] text-muted-foreground">{routine.exercises.length} Exercises</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {group.id === "my-routines" && (
                                  <button
                                    onClick={(e) => deleteCustomRoutine(routine.id, e)}
                                    className="p-1.5 rounded-full hover:bg-destructive/15 text-muted-foreground hover:text-destructive active:scale-90 transition-all"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startRoutine(routine);
                                  }}
                                  className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow active:scale-90 transition-transform"
                                >
                                  <Play className="h-3.5 w-3.5 fill-current" />
                                </button>
                                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isRoutineOpen ? "rotate-180" : ""}`} />
                              </div>
                            </button>

                            {/* Dropdown Exercise List (Drop down table as requested) */}
                            {isRoutineOpen && (
                              <div className="px-3 pb-3 border-t border-border/20 bg-secondary/5 animate-fade-in">
                                <table className="w-full mt-2 text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-border/30">
                                      <th className="text-[8px] font-bold uppercase text-muted-foreground py-1">Exercise</th>
                                      <th className="text-[8px] font-bold uppercase text-muted-foreground py-1 text-center w-12">Sets</th>
                                      <th className="text-[8px] font-bold uppercase text-muted-foreground py-1 text-center w-12">Reps</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {routine.exercises.map((ex, i) => (
                                      <tr key={i} className="border-b border-border/10 last:border-0 hover:bg-secondary/20">
                                        <td className="text-[10px] font-medium py-1.5">{ex.name}</td>
                                        <td className="text-[10px] py-1.5 text-center">{ex.sets}</td>
                                        <td className="text-[10px] py-1.5 text-center">{ex.reps}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <button
                                  onClick={() => startRoutine(routine)}
                                  className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[10px] font-bold text-primary-foreground active:scale-95 transition-transform"
                                >
                                  <Play className="h-3 w-3 fill-current" /> Start Routine
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Routine Creator Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60" onClick={() => setShowCreateModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full rounded-t-3xl bg-card p-5 pb-8 animate-fade-in max-h-[85vh] overflow-y-auto border-t border-border/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Create New Routine</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Routine Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arms & Chest, Core Builder"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  className="w-full mt-1.5 rounded-xl bg-secondary border border-border/40 px-3 py-2.5 text-xs font-semibold outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Exercises</label>
                  <button onClick={handleAddExerciseRow} className="text-[9px] font-bold text-primary flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Exercise
                  </button>
                </div>
                
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {newRoutineExercises.map((ex, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-secondary/30 p-2.5 rounded-xl border border-border/20">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={ex.name}
                        onChange={(e) => handleExerciseChange(idx, "name", e.target.value)}
                        className="flex-1 bg-transparent text-xs font-semibold outline-none text-foreground placeholder:text-muted-foreground"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="S"
                          value={ex.sets || ""}
                          onChange={(e) => handleExerciseChange(idx, "sets", parseInt(e.target.value) || 0)}
                          className="w-8 text-center bg-secondary border border-border/30 rounded py-1 text-[10px] font-bold outline-none text-foreground"
                          title="Sets"
                        />
                        <span className="text-[9px] text-muted-foreground">x</span>
                        <input
                          type="number"
                          placeholder="R"
                          value={ex.reps || ""}
                          onChange={(e) => handleExerciseChange(idx, "reps", parseInt(e.target.value) || 0)}
                          className="w-10 text-center bg-secondary border border-border/30 rounded py-1 text-[10px] font-bold outline-none text-foreground"
                          title="Reps"
                        />
                      </div>
                      {newRoutineExercises.length > 1 && (
                        <button onClick={() => handleRemoveExerciseRow(idx)} className="text-muted-foreground hover:text-destructive p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateRoutine}
                className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground active:scale-95 transition-transform shadow-lg shadow-primary/20"
              >
                Create and Save Routine
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default WorkoutDashboard;
