import { Bell, Flame, Clock, UtensilsCrossed, Dumbbell, Check, Sparkles, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import MobileLayout from "@/components/MobileLayout";
import { animalAvatars } from "@/data/avatars";

interface TodayWorkout {
  title: string;
  subtitle: string;
  image: string;
  exercises: { name: string; sets: number; reps: number }[];
}

const workoutSchedule: TodayWorkout[] = [
  {
    title: "Rest & Stretch",
    subtitle: "20 mins • Easy • 5 Exercises",
    image: "/cardio_workout.png",
    exercises: [
      { name: "Hamstring Stretch", sets: 2, reps: 30 },
      { name: "Quad Stretch", sets: 2, reps: 30 },
      { name: "Child's Pose", sets: 1, reps: 60 },
      { name: "Cat-Cow Flow", sets: 1, reps: 10 },
      { name: "Sun Salutation", sets: 5, reps: 1 },
    ]
  },
  {
    title: "Chest & Triceps",
    subtitle: "40 mins • Intermediate • 4 Exercises",
    image: "/chest_workout.png",
    exercises: [
      { name: "Flat Bench Press", sets: 4, reps: 10 },
      { name: "Incline DB Press", sets: 3, reps: 12 },
      { name: "Cable Chest Flyes", sets: 3, reps: 12 },
      { name: "Tricep Pushdowns", sets: 3, reps: 12 },
    ]
  },
  {
    title: "Back & Biceps",
    subtitle: "45 mins • Intermediate • 4 Exercises",
    image: "/back_workout.png",
    exercises: [
      { name: "Lat Pulldown", sets: 4, reps: 12 },
      { name: "Seated Cable Row", sets: 3, reps: 12 },
      { name: "Barbell Bicep Curls", sets: 3, reps: 12 },
      { name: "Hammer Curls", sets: 3, reps: 12 },
    ]
  },
  {
    title: "Cardio HIIT",
    subtitle: "25 mins • Hard • 5 Exercises",
    image: "/cardio_workout.png",
    exercises: [
      { name: "Burpees", sets: 4, reps: 10 },
      { name: "Jump Squats", sets: 4, reps: 12 },
      { name: "High Knees", sets: 3, reps: 30 },
      { name: "Sprint Intervals", sets: 5, reps: 20 },
      { name: "Jump Rope", sets: 3, reps: 60 },
    ]
  },
  {
    title: "Leg Day Crusher",
    subtitle: "45 mins • Intermediate • 5 Exercises",
    image: "/leg_workout.png",
    exercises: [
      { name: "Squats", sets: 4, reps: 12 },
      { name: "Lunges", sets: 3, reps: 10 },
      { name: "Leg Press", sets: 4, reps: 10 },
      { name: "Calf Raises", sets: 4, reps: 20 },
      { name: "Deadlifts", sets: 4, reps: 8 },
    ]
  },
  {
    title: "Shoulder Shred",
    subtitle: "35 mins • Hard • 5 Exercises",
    image: "/chest_workout.png",
    exercises: [
      { name: "Military Press", sets: 4, reps: 8 },
      { name: "Arnold Press", sets: 3, reps: 10 },
      { name: "Lateral Raises", sets: 4, reps: 12 },
      { name: "Rear Delt Fly", sets: 3, reps: 12 },
      { name: "Shrugs", sets: 4, reps: 15 },
    ]
  },
  {
    title: "Core Destroyer",
    subtitle: "20 mins • Medium • 5 Exercises",
    image: "/cardio_workout.png",
    exercises: [
      { name: "Plank Hold", sets: 3, reps: 60 },
      { name: "Crunches", sets: 3, reps: 20 },
      { name: "Russian Twists", sets: 3, reps: 15 },
      { name: "Leg Raises", sets: 3, reps: 15 },
      { name: "Mountain Climbers", sets: 3, reps: 30 },
    ]
  }
];

const calculateStreak = (activeDays: string[]): number => {
  if (activeDays.length === 0) return 0;
  const sorted = [...activeDays].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  const todayStr = new Date().toISOString().split("T")[0];

  let currentCheck = new Date();
  if (!sorted.includes(todayStr)) {
    currentCheck.setDate(currentCheck.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = currentCheck.toISOString().split("T")[0];
    if (sorted.includes(dateStr)) {
      streak++;
    } else {
      break;
    }
    currentCheck.setDate(currentCheck.getDate() - 1);
  }
  return streak;
};

const getThisWeekDateStrings = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(now.setDate(diff));

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

const triggerHaptic = (intensity: number = 15) => {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(intensity);
  }
};

const Index = () => {
  const navigate = useNavigate();
  const [selectedAvatar] = useState(() => localStorage.getItem("ado-avatar") || "wolf");
  const currentAvatar = animalAvatars.find(a => a.id === selectedAvatar) || animalAvatars[0];
  const userName = localStorage.getItem("ado-user-name") || "Alex Johnson";

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  const dayOfWeekIndex = today.getDay();
  
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekDates = useMemo(() => getThisWeekDateStrings(), []);

  const [activeDays, setActiveDays] = useState<string[]>(() => {
    const saved = localStorage.getItem("ado-active-days");
    return saved ? JSON.parse(saved) : [];
  });

  const streak = useMemo(() => calculateStreak(activeDays), [activeDays]);

  const toggleDay = (index: number) => {
    triggerHaptic();

    const dateStr = weekDates[index];
    const isFuture = dateStr > new Date().toISOString().split("T")[0];
    if (isFuture) return;

    setActiveDays(prev => {
      const next = prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr];
      localStorage.setItem("ado-active-days", JSON.stringify(next));
      return next;
    });
  };

  const progressPercent = 0.75;
  const angle = (progressPercent * 360 - 90) * (Math.PI / 180);
  const dotX = 50 + 40 * Math.cos(angle);
  const dotY = 50 + 40 * Math.sin(angle);

  const todayWorkout = workoutSchedule[dayOfWeekIndex];

  return (
    <MobileLayout>
      <div className="min-h-screen bg-background text-foreground px-5 pt-12 pb-28 font-sans animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden border border-border bg-card flex items-center justify-center text-2xl">
              {currentAvatar.emoji}
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider">{dateString}</p>
              <h1 className="text-lg font-bold">Hello, {userName}</h1>
            </div>
          </div>
          <button
            onClick={() => triggerHaptic(10)}
            className="h-10 w-10 rounded-full bg-card flex items-center justify-center border border-border/40 active:scale-95 transition-transform"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Daily Goal Card */}
        <div className="bg-card rounded-[24px] p-6 mb-4 flex items-center justify-between shadow-sm border border-border/30">
          <div>
            <p className="text-[10px] text-muted-foreground font-bold tracking-wider mb-1">DAILY GOAL</p>
            <h2 className="text-[42px] font-extrabold leading-none mb-3">{Math.round(progressPercent * 100)}%</h2>
            <div className="bg-[#2D452B] text-[#58D66D] text-[10px] font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <Flame className="h-3 w-3" fill="currentColor" />
              {streak} Day Streak
            </div>
          </div>

          <div className="relative h-[110px] w-[110px] filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <defs>
                <linearGradient id="goalRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#58D66D" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="40" className="stroke-muted/20" fill="none" strokeWidth="10" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="url(#goalRingGrad)" 
                fill="none" 
                strokeWidth="10" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 * (1 - progressPercent)} 
                strokeLinecap="round" 
              />
              <circle
                cx={dotX} 
                cy={dotY} 
                r="5.5" 
                fill="#58D66D" 
                className="shadow-lg animate-pulse" 
                style={{ filter: "drop-shadow(0px 0px 4px #58D66D)" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="16" height="24" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.6292 9.07185C14.7354 8.89512 14.686 8.64731 14.5204 8.50853L1.51733 0.203875C1.1963 -0.0653556 0.702737 0.170566 0.718919 0.585521L1.24044 14.0487C1.24838 14.2541 1.4587 14.394 1.64417 14.3168L6.46743 12.3087C6.67139 12.2238 6.90159 12.3276 6.98399 12.5312L10.3546 20.8407C10.4578 21.0954 10.8288 21.1118 10.9547 20.8679L14.6292 9.07185Z" stroke="#58D66D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Calories & Active Time */}
        <div className="space-y-3 mb-8">
          <div 
            onClick={() => { triggerHaptic(10); navigate('/diet'); }}
            className="bg-card rounded-[20px] p-5 border border-border/30 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
            title="Tap to log food"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-[#FF8A4C]" fill="currentColor" />
                <span className="font-bold text-sm">Calories Burned</span>
              </div>
              <span className="text-xs"><span className="font-bold text-sm">450</span><span className="text-muted-foreground">/600 kcal</span></span>
            </div>
            <div className="h-2 w-full bg-[#2A231E] rounded-full overflow-hidden">
              <div className="h-full bg-[#FF8A4C] rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div 
            onClick={() => { triggerHaptic(10); navigate('/diet'); }}
            className="bg-card rounded-[20px] p-5 border border-border/30 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
            title="Tap to log food"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#A5C0F3]" />
                <span className="font-bold text-sm">Active Time</span>
              </div>
              <span className="text-xs"><span className="font-bold text-sm">48</span><span className="text-muted-foreground">/60 min</span></span>
            </div>
            <div className="h-2 w-full bg-[#202532] rounded-full overflow-hidden">
              <div className="h-full bg-[#A5C0F3] rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>

        {/* Today's Nutrition */}
        <div className="mb-8">
          <h2 className="text-[17px] font-bold mb-4">Today's Nutrition</h2>
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => { triggerHaptic(10); navigate('/diet'); }}
              className="bg-card rounded-[20px] p-5 pb-6 border border-border/30 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
              title="Tap to log food"
            >
              <div className="h-10 w-10 rounded-xl bg-[#2A1E18] flex items-center justify-center mb-5">
                <UtensilsCrossed className="h-5 w-5 text-[#FF8A4C]" fill="currentColor" />
              </div>
              <p className="text-[28px] font-extrabold leading-none mb-1.5">1,840</p>
              <p className="text-[11px] text-muted-foreground">Calories (kcal)</p>
            </div>
            <div 
              onClick={() => { triggerHaptic(10); navigate('/diet'); }}
              className="bg-card rounded-[20px] p-5 pb-6 border border-border/30 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
              title="Tap to log food"
            >
              <div className="h-10 w-10 rounded-xl bg-[#1C253C] flex items-center justify-center mb-5">
                <Dumbbell className="h-5 w-5 text-[#4A85F6]" fill="currentColor" />
              </div>
              <p className="text-[28px] font-extrabold leading-none mb-1.5">142g</p>
              <p className="text-[11px] text-muted-foreground">Protein (Target 160g)</p>
            </div>
          </div>
        </div>

        {/* Last 7 Days Streak */}
        <div className="mb-8 bg-card rounded-[24px] p-5 border border-border/30 shadow-sm">
          <h2 className="text-[17px] font-bold mb-4">Last 7 Days Streak</h2>
          <div className="flex justify-between items-center px-1">
            {daysOfWeek.map((day, i) => {
              const dateStr = weekDates[i];
              const isChecked = activeDays.includes(dateStr);
              return (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className="flex flex-col items-center gap-2 group outline-none"
                  title={`Toggle ${day}`}
                >
                  <span className="text-xs text-muted-foreground font-semibold group-hover:text-foreground transition-colors">{day}</span>
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isChecked
                      ? 'bg-[#1C64F2] border-[#1C64F2] text-white scale-105 shadow-md shadow-blue-500/20 active:scale-95'
                      : 'bg-secondary/40 border-border hover:border-muted-foreground/45 active:scale-90'
                  }`}>
                    {isChecked ? (
                      <Check className="h-6 w-6 text-white" strokeWidth={3.5} />
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-muted-foreground/60 transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's Session */}
        <div className="mb-4">
          <div className="bg-card rounded-[24px] p-6 relative overflow-hidden flex flex-col min-h-[220px] border border-border/30 shadow-sm">
            <div className="z-10 w-3/5">
              <p className="text-[10px] text-muted-foreground font-bold tracking-[0.15em] mb-2 uppercase">TODAY'S SESSION</p>
              <h2 className="text-[30px] font-bold leading-[1.1] mb-2">{todayWorkout.title}</h2>
              <p className="text-[12px] text-muted-foreground mb-8 mt-1">{todayWorkout.subtitle}</p>
            </div>
            <button 
              onClick={() => { triggerHaptic(); navigate('/workout-active', {
                state: {
                  routineName: todayWorkout.title,
                  exercises: todayWorkout.exercises.map(ex => ({ ...ex, completed: false }))
                }
              }); }}
              className="z-10 bg-[#1C64F2] text-white text-[15px] font-bold py-3.5 px-8 rounded-full w-32 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
            >
              Start
            </button>
            
            <div className="absolute right-0 bottom-0 top-0 h-full w-[45%] pointer-events-none overflow-hidden rounded-r-[24px]">
              <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-card to-transparent z-10" />
              <div className="absolute inset-0 bg-card/25 z-10" />
              <img src={todayWorkout.image} alt={todayWorkout.title} className="h-full w-full object-cover object-center" />
            </div>
          </div>
        </div>

        {/* AI Food Scanner Card */}
        <div className="mb-4">
          <div
            onClick={() => { triggerHaptic(); navigate('/food-scanner'); }}
            className="bg-gradient-to-br from-[#FF8A4C]/10 via-[#F59E0B]/5 to-transparent border border-[#FF8A4C]/20 rounded-[24px] p-6 relative overflow-hidden flex flex-col min-h-[170px] shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="z-10 w-3/4">
              <div className="flex items-center gap-1 bg-[#FF8A4C]/15 border border-[#FF8A4C]/25 text-[#FF8A4C] text-[8px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full w-fit mb-3">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>AI Nutrition Analysis</span>
              </div>
              <h2 className="text-xl font-bold leading-tight mb-1 text-card-foreground">AI Food Scanner</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 mb-4">
                Scan your meal or upload a photo to instantly identify food items and track calories using Gemini AI.
              </p>
            </div>

            <div className="absolute right-6 top-1/2 -translate-y-1/2 h-16 w-16 rounded-2xl bg-[#FF8A4C]/10 border border-[#FF8A4C]/20 flex items-center justify-center text-[#FF8A4C]">
              <Camera className="h-8 w-8 animate-bounce" />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF8A4C] mt-auto z-10 hover:underline">
              <span>Scan My Meal</span>
              <span className="text-sm">→</span>
            </div>
          </div>
        </div>

        {/* AI Posture Coach Banner Card */}
        <div className="mb-4">
          <div 
            onClick={() => { triggerHaptic(); navigate('/posture-coach'); }}
            className="bg-gradient-to-br from-[#1C64F2]/10 via-[#10B981]/5 to-transparent border border-[#1C64F2]/20 rounded-[24px] p-6 relative overflow-hidden flex flex-col min-h-[170px] shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="z-10 w-3/4">
              <div className="flex items-center gap-1 bg-[#1C64F2]/15 border border-[#1C64F2]/25 text-[#4A85F6] text-[8px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full w-fit mb-3">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>AI Voice Coaching</span>
              </div>
              <h2 className="text-xl font-bold leading-tight mb-1 text-card-foreground">AI Posture Coach</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 mb-4">
                Track your squats, curls, and push-ups in real-time with automatic skeletal tracking and spoken audio form cues.
              </p>
            </div>
            
            <div className="absolute right-6 top-1/2 -translate-y-1/2 h-16 w-16 rounded-2xl bg-[#1C64F2]/10 border border-[#1C64F2]/20 flex items-center justify-center text-[#4A85F6]">
              <Camera className="h-8 w-8 animate-bounce" />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A85F6] mt-auto z-10 hover:underline">
              <span>Start AI Training</span>
              <span className="text-sm">→</span>
            </div>
          </div>
        </div>

      </div>
    </MobileLayout>
  );
};

export default Index;
