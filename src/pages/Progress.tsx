import { ChevronLeft, BarChart3, TrendingUp, Flame, Clock, Scale, Calendar, Sparkles, Activity } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import MobileLayout from "@/components/MobileLayout";

interface WorkoutLog {
  id: string;
  name: string;
  date: string;
  duration: number;
  calories: number;
  exercisesCompleted: number;
  totalExercises: number;
}

interface DietLog {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface WeightLog {
  date: string;
  weight: number;
}

// Generate realistic mock data for past N days
const generateMockWorkouts = (days: number): WorkoutLog[] => {
  const workoutNames = ["Push Day", "Pull Day", "Leg Day Crusher", "Core Destroyer", "Cardio HIIT", "Upper Body Blast"];
  const logs: WorkoutLog[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    // 60% chance of working out on any given day
    if (Math.random() > 0.4) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const duration = Math.floor(Math.random() * 25) + 20; // 20-45 mins
      logs.push({
        id: `mock-w-${i}`,
        name: workoutNames[Math.floor(Math.random() * workoutNames.length)],
        date: dateStr,
        duration,
        calories: duration * 8, // ~8 cals per minute
        exercisesCompleted: Math.floor(Math.random() * 4) + 4,
        totalExercises: 8
      });
    }
  }
  return logs;
};

const generateMockDiet = (days: number, targetCal: number): DietLog[] => {
  const logs: DietLog[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    // Fluctuate around target
    const calories = Math.round(targetCal + (Math.random() * 400 - 200));
    logs.push({
      date: dateStr,
      calories,
      protein: Math.round(calories * 0.3 / 4),
      carbs: Math.round(calories * 0.45 / 4),
      fat: Math.round(calories * 0.25 / 9),
      fiber: Math.floor(Math.random() * 15) + 15
    });
  }
  return logs;
};

const generateMockWeight = (days: number, currentWeight: number, goal: string): WeightLog[] => {
  const logs: WeightLog[] = [];
  const now = new Date();
  let weight = currentWeight + (goal === "lose" ? 1.8 : goal === "gain" ? -1.5 : 0.2); // Start weight based on goal
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    // Weight trend over time with small random fluctuations
    const change = goal === "lose" 
      ? -(Math.random() * 0.15 + 0.02) // steadily lose
      : goal === "gain"
      ? (Math.random() * 0.15 + 0.02) // steadily gain
      : (Math.random() * 0.2 - 0.1); // stable
      
    weight += change;
    logs.push({
      date: dateStr,
      weight: Math.round(weight * 10) / 10
    });
  }
  return logs;
};

const Progress = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");

  // Get user parameters
  const userGoal = localStorage.getItem("ado-user-goal") || "lose";
  const userWeight = parseFloat(localStorage.getItem("ado-user-weight") || "70");
  const targetWeight = parseFloat(localStorage.getItem("ado-user-target-weight") || "65");
  const baseTarget = userWeight * 30;
  const goalAdjust: Record<string, number> = { lose: -500, gain: 300, maintain: 0, strength: 400 };
  const dailyDietTarget = baseTarget + (goalAdjust[userGoal] || 0);

  // Load logs from localStorage or use generated mock data
  const workoutLogs = useMemo(() => {
    const saved = localStorage.getItem("ado-workout-log");
    if (saved) {
      const logs: WorkoutLog[] = JSON.parse(saved);
      if (logs.length > 0) return logs;
    }
    return generateMockWorkouts(30);
  }, []);

  const dietLogs = useMemo(() => {
    const saved = localStorage.getItem("ado-diet-log");
    if (saved) {
      const logs: DietLog[] = JSON.parse(saved);
      if (logs.length > 0) return logs;
    }
    return generateMockDiet(30, dailyDietTarget);
  }, [dailyDietTarget]);

  const weightLogs = useMemo(() => {
    const saved = localStorage.getItem("ado-weight-history");
    if (saved) {
      const logs: WeightLog[] = JSON.parse(saved);
      if (logs.length > 0) return logs;
    }
    return generateMockWeight(30, userWeight, userGoal);
  }, [userWeight, userGoal]);

  const rangeDays = timeRange === "week" ? 7 : 30;

  // Process data for the charts
  const statsData = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - rangeDays);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    // Filter logs in range
    const workoutsInRange = workoutLogs.filter(l => l.date >= cutoffStr);
    const dietInRange = dietLogs.filter(l => l.date >= cutoffStr);

    const totalWorkouts = workoutsInRange.length;
    const totalMinutes = workoutsInRange.reduce((sum, l) => sum + l.duration, 0);
    const totalBurned = workoutsInRange.reduce((sum, l) => sum + l.calories, 0);
    
    const avgConsumed = dietInRange.length > 0
      ? Math.round(dietInRange.reduce((sum, l) => sum + l.calories, 0) / dietInRange.length)
      : 0;

    return {
      totalWorkouts,
      totalMinutes,
      totalBurned,
      avgConsumed
    };
  }, [workoutLogs, dietLogs, rangeDays]);

  // Chart data for daily values
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      // Find logs for this specific date
      const daysWorkouts = workoutLogs.filter(l => l.date === dateStr);
      const dayDiet = dietLogs.find(l => l.date === dateStr);
      const dayWeight = weightLogs.find(l => l.date === dateStr);

      const caloriesBurned = daysWorkouts.reduce((sum, l) => sum + l.calories, 0);
      const activeMinutes = daysWorkouts.reduce((sum, l) => sum + l.duration, 0);
      const caloriesConsumed = dayDiet ? dayDiet.calories : 0;
      const currentWeight = dayWeight ? dayWeight.weight : userWeight;

      const label = timeRange === "week"
        ? d.toLocaleDateString("en-US", { weekday: "short" })
        : `${d.getDate()}`;

      data.push({
        day: label,
        date: dateStr,
        Burned: caloriesBurned,
        Minutes: activeMinutes,
        Consumed: caloriesConsumed,
        Weight: currentWeight
      });
    }
    return data;
  }, [workoutLogs, dietLogs, weightLogs, rangeDays, timeRange, userWeight]);

  return (
    <MobileLayout>
      <div className="animate-fade-in px-4 pt-6 pb-24 min-h-screen bg-background text-foreground">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Analytics & Progress
          </h1>
          <div className="w-6" />
        </div>

        {/* Timeframe Toggle */}
        <div className="flex rounded-xl bg-secondary p-1 mb-5">
          {(["week", "month"] as const).map(r => (
            <button 
              key={r} 
              onClick={() => setTimeRange(r)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                timeRange === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {r === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold">ACTIVE TIME</p>
              <p className="text-sm font-bold text-card-foreground">{statsData.totalMinutes} mins</p>
              <p className="text-[8px] text-muted-foreground">{statsData.totalWorkouts} sessions total</p>
            </div>
          </div>

          <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
              <Flame className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold">CALORIES BURNED</p>
              <p className="text-sm font-bold text-card-foreground">{statsData.totalBurned} kcal</p>
              <p className="text-[8px] text-muted-foreground">Est. workout burn</p>
            </div>
          </div>

          <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold">AVG CALS INTAKE</p>
              <p className="text-sm font-bold text-card-foreground">{statsData.avgConsumed} kcal</p>
              <p className="text-[8px] text-muted-foreground">Target: {Math.round(dailyDietTarget)} kcal</p>
            </div>
          </div>

          <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
              <Scale className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold">BODY WEIGHT</p>
              <p className="text-sm font-bold text-card-foreground">{userWeight} kg</p>
              <p className="text-[8px] text-muted-foreground">Target: {targetWeight} kg</p>
            </div>
          </div>
        </div>

        {/* Chart 1: Calorie Balance Burned vs Consumed */}
        <div className="bg-card border border-border/30 rounded-2xl p-4 mb-5 shadow-sm">
          <h3 className="text-xs font-bold text-card-foreground flex items-center gap-1.5 mb-1">
            <Activity className="h-4 w-4 text-orange-500" /> Calorie Balance
          </h3>
          <p className="text-[9px] text-muted-foreground mb-4">Comparison between calorie consumption and estimated workout burn</p>
          <div className="h-48 text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                <Bar dataKey="Consumed" name="Consumed Intake" fill="#58D66D" radius={[3, 3, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Burned" name="Burned Workouts" fill="#FF8A4C" radius={[3, 3, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weight Trend */}
        <div className="bg-card border border-border/30 rounded-2xl p-4 mb-5 shadow-sm">
          <h3 className="text-xs font-bold text-card-foreground flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-4 w-4 text-purple-500" /> Weight Progress
          </h3>
          <p className="text-[9px] text-muted-foreground mb-4">Body weight changes over time against target weight ({targetWeight} kg)</p>
          <div className="h-48 text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  tickLine={false} 
                  axisLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Weight" 
                  name="Weight (kg)" 
                  stroke="#4A85F6" 
                  strokeWidth={2.5} 
                  dot={{ r: timeRange === "week" ? 4 : 2 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Active Time Area Chart */}
        <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-card-foreground flex items-center gap-1.5 mb-1">
            <Clock className="h-4 w-4 text-blue-500" /> Daily Active Minutes
          </h3>
          <p className="text-[9px] text-muted-foreground mb-4">Daily total minutes spent doing custom or predefined workouts</p>
          <div className="h-44 text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="activeMinutesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A85F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4A85F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Minutes" 
                  name="Active Minutes" 
                  stroke="#4A85F6" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#activeMinutesGrad)" 
                  dot={{ r: timeRange === "week" ? 3 : 0 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>



      </div>
    </MobileLayout>
  );
};

export default Progress;
