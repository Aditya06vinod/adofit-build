import { ChevronLeft, SlidersHorizontal, ChevronDown, ChevronRight, Play, Timer, Flame, Dumbbell } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { useToast } from "@/hooks/use-toast";

interface Routine {
  name: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  exercises: { name: string; sets: number; reps: number }[];
}

interface Program {
  id: string;
  name: string;
  typeText: "PUSH PULL LEGS" | "FULL BODY" | "CORE BLAST" | "STRETCH";
  equipment: string;
  routinesCount: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  routines: Routine[];
}

const explorePrograms: Program[] = [
  {
    id: "prog-1",
    name: "Beginner Push/Pull/Legs (Gym Equipment)",
    typeText: "PUSH PULL LEGS",
    equipment: "Gym Equipment",
    routinesCount: 3,
    level: "Beginner",
    routines: [
      {
        name: "Push Day (Chest, Shoulders & Triceps)",
        duration: "35 mins",
        difficulty: "Easy",
        exercises: [
          { name: "Flat Dumbbell Press", sets: 3, reps: 10 },
          { name: "Overhead Dumbbell Press", sets: 3, reps: 12 },
          { name: "Tricep Pushdown", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Pull Day (Back & Biceps)",
        duration: "35 mins",
        difficulty: "Easy",
        exercises: [
          { name: "Lat Pulldown", sets: 3, reps: 12 },
          { name: "Seated Cable Row", sets: 3, reps: 12 },
          { name: "Hammer Curls", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Legs Day (Quads, Hamstrings & Calves)",
        duration: "40 mins",
        difficulty: "Medium",
        exercises: [
          { name: "Goblet Squats", sets: 3, reps: 12 },
          { name: "Lying Leg Curls", sets: 3, reps: 12 },
          { name: "Standing Calf Raises", sets: 4, reps: 15 },
        ],
      },
    ],
  },
  {
    id: "prog-2",
    name: "Intermediate Full-Body (Gym Equipment)",
    typeText: "FULL BODY",
    equipment: "Gym Equipment",
    routinesCount: 3,
    level: "Intermediate",
    routines: [
      {
        name: "Full Body A (Strength Focus)",
        duration: "45 mins",
        difficulty: "Medium",
        exercises: [
          { name: "Barbell Squats", sets: 4, reps: 8 },
          { name: "Bench Press", sets: 4, reps: 8 },
          { name: "Barbell Rows", sets: 4, reps: 10 },
        ],
      },
      {
        name: "Full Body B (Hypertrophy Focus)",
        duration: "45 mins",
        difficulty: "Medium",
        exercises: [
          { name: "Romanian Deadlifts", sets: 3, reps: 10 },
          { name: "Incline DB Press", sets: 3, reps: 12 },
          { name: "Lat Pulldown", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Full Body C (Conditioning Focus)",
        duration: "40 mins",
        difficulty: "Hard",
        exercises: [
          { name: "Leg Press", sets: 3, reps: 15 },
          { name: "Lateral Raises", sets: 3, reps: 15 },
          { name: "Plank Hold", sets: 3, reps: 60 },
        ],
      },
    ],
  },
  {
    id: "prog-3",
    name: "Intermediate Push/Pull/Legs (Gym Equipment)",
    typeText: "PUSH PULL LEGS",
    equipment: "Gym Equipment",
    routinesCount: 3,
    level: "Intermediate",
    routines: [
      {
        name: "Push Day (Heavy Bench focus)",
        duration: "45 mins",
        difficulty: "Medium",
        exercises: [
          { name: "Barbell Bench Press", sets: 4, reps: 8 },
          { name: "Arnold Shoulder Press", sets: 3, reps: 10 },
          { name: "Cable Flyes", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Pull Day (Deadlift focus)",
        duration: "45 mins",
        difficulty: "Medium",
        exercises: [
          { name: "Conventional Deadlifts", sets: 3, reps: 6 },
          { name: "Pull Ups", sets: 3, reps: 8 },
          { name: "Barbell Bicep Curls", sets: 3, reps: 10 },
        ],
      },
      {
        name: "Legs Day (Heavy Squat focus)",
        duration: "50 mins",
        difficulty: "Hard",
        exercises: [
          { name: "Barbell Squats", sets: 4, reps: 8 },
          { name: "Bulgarian Split Squats", sets: 3, reps: 10 },
          { name: "Romanian Deadlifts", sets: 3, reps: 10 },
        ],
      },
    ],
  },
  {
    id: "prog-4",
    name: "Beginner Full-Body (Equipment-Free)",
    typeText: "FULL BODY",
    equipment: "Equipment-Free",
    routinesCount: 3,
    level: "Beginner",
    routines: [
      {
        name: "Bodyweight Routine A",
        duration: "25 mins",
        difficulty: "Easy",
        exercises: [
          { name: "Push Ups", sets: 3, reps: 12 },
          { name: "Bodyweight Squats", sets: 3, reps: 15 },
          { name: "Plank", sets: 3, reps: 45 },
        ],
      },
      {
        name: "Bodyweight Routine B",
        duration: "25 mins",
        difficulty: "Easy",
        exercises: [
          { name: "Incline Push Ups", sets: 3, reps: 12 },
          { name: "Glute Bridges", sets: 3, reps: 15 },
          { name: "Superman Hold", sets: 3, reps: 10 },
        ],
      },
    ],
  },
];

const Workouts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [selectedGoal, setSelectedGoal] = useState<string>("All");
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);

  const filteredPrograms = explorePrograms.filter((p) => {
    const matchLevel = selectedLevel === "All" || p.level === selectedLevel;
    const matchGoal = selectedGoal === "All" || 
      (selectedGoal === "Strength" && p.level !== "Beginner") || 
      (selectedGoal === "Tone" && p.level === "Beginner");
    return matchLevel && matchGoal;
  });

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

  return (
    <MobileLayout>
      <div className="animate-fade-in px-4 pt-6 pb-24 min-h-screen bg-background text-foreground">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="h-9 w-9 rounded-full bg-card border border-border/40 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Explore</h1>
        </div>

        {/* Filters pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button className="flex items-center gap-1 bg-card hover:bg-secondary/40 border border-border/40 rounded-full px-4 py-2 text-[11px] font-bold text-muted-foreground">
            <SlidersHorizontal className="h-3 w-3" /> Filters
          </button>

          {/* Level Dropdown */}
          <div className="relative">
            <select 
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="appearance-none bg-card hover:bg-secondary/40 border border-border/40 rounded-full px-4 py-2 pr-8 text-[11px] font-bold text-muted-foreground outline-none cursor-pointer"
            >
              <option value="All">Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Goal Dropdown */}
          <div className="relative">
            <select 
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
              className="appearance-none bg-card hover:bg-secondary/40 border border-border/40 rounded-full px-4 py-2 pr-8 text-[11px] font-bold text-muted-foreground outline-none cursor-pointer"
            >
              <option value="All">Goal</option>
              <option value="Strength">Build Strength</option>
              <option value="Tone">Get Toned</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Programs List */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Programs</h2>
          <div className="space-y-3">
            {filteredPrograms.map((program) => {
              const isExpanded = expandedProgramId === program.id;
              return (
                <div 
                  key={program.id}
                  className="bg-card border border-border/30 rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  <button 
                    onClick={() => setExpandedProgramId(isExpanded ? null : program.id)}
                    className="w-full flex items-center p-3 text-left hover:bg-secondary/15 transition-colors gap-3"
                  >
                    {/* Left Graphic Block */}
                    <div className="w-[100px] h-[72px] shrink-0 rounded-xl bg-gradient-to-br from-[#1C64F2]/10 to-[#1C64F2]/5 border border-[#1C64F2]/20 flex flex-col justify-between p-2 overflow-hidden relative">
                      <p className="text-[9px] font-black italic tracking-tighter text-[#1C64F2] leading-tight select-none">
                        {program.typeText.split(" ").map((word, i) => (
                          <span key={i} className="block">{word}</span>
                        ))}
                      </p>
                      
                      {/* Mini gym equipment illustration */}
                      <div className="absolute right-1 bottom-1 text-2xl opacity-60">
                        {program.typeText === "PUSH PULL LEGS" ? "🏋️" : "🤸"}
                      </div>
                    </div>

                    {/* Right text info */}
                    <div className="flex-1">
                      <h3 className="text-xs font-bold leading-snug pr-4">{program.name}</h3>
                      <p className="text-[9px] text-muted-foreground mt-1">{program.routinesCount} routines · {program.level}</p>
                    </div>

                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                  </button>

                  {/* Collapsible Routine List in Program */}
                  {isExpanded && (
                    <div className="border-t border-border/40 bg-secondary/10 px-3 py-3.5 space-y-2 animate-fade-in">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Routines In Program</p>
                      {program.routines.map((routine, idx) => (
                        <div key={idx} className="bg-card rounded-xl p-3 border border-border/20 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold">{routine.name}</p>
                            <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
                              <span className="flex items-center gap-0.5"><Timer className="h-3 w-3" /> {routine.duration}</span>
                              <span className="flex items-center gap-0.5"><Dumbbell className="h-3 w-3" /> {routine.exercises.length} ex</span>
                            </div>
                          </div>
                          <button
                            onClick={() => startRoutine(routine)}
                            className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md active:scale-90 transition-transform shrink-0"
                          >
                            <Play className="h-4 w-4 fill-current ml-0.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button className="w-full mt-4 bg-secondary/30 hover:bg-secondary/50 border border-border/30 rounded-xl py-3 text-xs font-bold text-muted-foreground transition-colors">
            Show all 26 programs
          </button>
        </div>



      </div>
    </MobileLayout>
  );
};

export default Workouts;
