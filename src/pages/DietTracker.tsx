import { ChevronLeft, MoreVertical, ChevronRight, ChevronDown, Plus, Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { indianFoods, getDefaultMeals, type FoodItem, type MealSlot, type MealEntry } from "@/data/indianFoods";

const DietTracker = () => {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<MealSlot[]>(() => {
    const saved = localStorage.getItem("ado-diary-meals");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return getDefaultMeals();
  });

  const [dayOffset, setDayOffset] = useState(0);
  const [showAddFood, setShowAddFood] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Save meals to localStorage
  const saveMeals = (updated: MealSlot[]) => {
    setMeals(updated);
    localStorage.setItem("ado-diary-meals", JSON.stringify(updated));
  };

  // Day label
  const dayLabel = dayOffset === 0 ? "Today" : dayOffset === -1 ? "Yesterday" : dayOffset === 1 ? "Tomorrow" : (() => {
    const d = new Date(); d.setDate(d.getDate() + dayOffset); return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  })();

  // Calculate totals
  const totals = useMemo(() => {
    let eaten = 0, protein = 0, carbs = 0, fat = 0;
    meals.forEach(m => m.entries.forEach(e => {
      eaten += e.food.calories * e.quantity;
      protein += e.food.protein * e.quantity;
      carbs += e.food.carbs * e.quantity;
      fat += e.food.fat * e.quantity;
    }));
    return { eaten, protein, carbs, fat };
  }, [meals]);

  const userWeight = parseInt(localStorage.getItem("ado-user-weight") || "70");
  const userGoal = localStorage.getItem("ado-user-goal") || "";
  const goalAdjust: Record<string, number> = { lose: -500, gain: 300, maintain: 0, endurance: 200, flexibility: -200, strength: 400 };
  const dailyGoal = userWeight * 30 + (goalAdjust[userGoal] || 0) || 2500;
  const burned = 420;
  const remaining = dailyGoal - totals.eaten + burned;
  const net = totals.eaten - burned;
  const calorieProgress = Math.min(100, (totals.eaten / dailyGoal) * 100);

  // Macro targets
  const proteinTarget = Math.round(userWeight * 2);
  const carbsTarget = Math.round((dailyGoal * 0.5) / 4);
  const fatTarget = Math.round((dailyGoal * 0.25) / 9);
  const proteinPct = Math.min(100, Math.round((totals.protein / proteinTarget) * 100));
  const carbsPct = Math.min(100, Math.round((totals.carbs / carbsTarget) * 100));
  const fatPct = Math.min(100, Math.round((totals.fat / fatTarget) * 100));

  // Get meal total calories
  const mealCalories = (m: MealSlot) => m.entries.reduce((s, e) => s + e.food.calories * e.quantity, 0);

  // Filtered food search
  const filteredFoods = useMemo(() => {
    return indianFoods.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "all" || f.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  const addFoodToMeal = (mealIndex: number, food: FoodItem) => {
    const updated = [...meals];
    const existing = updated[mealIndex].entries.findIndex(e => e.food.id === food.id);
    if (existing >= 0) {
      updated[mealIndex].entries[existing].quantity += 1;
    } else {
      updated[mealIndex].entries.push({ food, quantity: 1 });
    }
    saveMeals(updated);
    setShowAddFood(null);
    setSearch("");

    // Also log to diet-log for other pages
    const today = new Date().toISOString().split("T")[0];
    const dietLog = JSON.parse(localStorage.getItem("ado-diet-log") || "[]");
    dietLog.push({ date: today, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, fiber: food.fiber });
    localStorage.setItem("ado-diet-log", JSON.stringify(dietLog));
  };

  const removeFoodFromMeal = (mealIndex: number, entryIndex: number) => {
    const updated = [...meals];
    updated[mealIndex].entries.splice(entryIndex, 1);
    saveMeals(updated);
  };

  const categories = [
    { id: "all", label: "All" },
    { id: "breakfast", label: "Breakfast" },
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "snack", label: "Snacks" },
    { id: "fruit", label: "Fruits" },
    { id: "vegetable", label: "Vegetables" },
    { id: "grain", label: "Grains" },
    { id: "dairy", label: "Dairy" },
    { id: "beverage", label: "Drinks" },
  ];

  // Circular progress ring component
  const MacroRing = ({ pct, label, value, total, color }: { pct: number; label: string; value: number; total: number; color: string }) => {
    const r = 28, c = 2 * Math.PI * r;
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 68 68" className="w-full h-full -rotate-90">
            <circle cx="34" cy="34" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
            <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="5"
              strokeLinecap="round" strokeDasharray={`${c}`}
              strokeDashoffset={`${c * (1 - pct / 100)}`}
              style={{ transition: "stroke-dashoffset 0.8s ease" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold">{pct}%</span>
          </div>
        </div>
        <span className="text-xs font-semibold">{label}</span>
        <span className="text-[10px] text-muted-foreground">{value}/{total}g</span>
      </div>
    );
  };

  return (
    <MobileLayout>
      <div className="animate-fade-in px-4 pt-4 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold">Diary</h1>
          <button className="p-1">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Day Navigator */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button onClick={() => setDayOffset(d => d - 1)} className="p-1.5 rounded-full bg-secondary active:scale-90 transition-transform">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
            <span className="text-lg">📅</span>
            <span className="text-sm font-bold">{dayLabel}</span>
          </div>
          <button onClick={() => setDayOffset(d => d + 1)} className="p-1.5 rounded-full bg-secondary active:scale-90 transition-transform">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Calories Remaining Card */}
        <div className="mt-5 rounded-2xl border border-border p-5 gym-gradient-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold">Calories Remaining</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">DAILY GOAL</span>
                <span className="text-sm font-semibold">{dailyGoal.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-primary">{Math.max(0, remaining).toLocaleString()}</p>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Kcal Left</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-lg font-bold">{totals.eaten.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Eaten</p>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold">{burned}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Burned</p>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-primary">{net.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${calorieProgress}%` }}
            />
          </div>
        </div>

        {/* Macro Circles */}
        <div className="mt-5 flex justify-around">
          <MacroRing pct={proteinPct} label="Protein" value={Math.round(totals.protein)} total={proteinTarget} color="hsl(var(--primary))" />
          <MacroRing pct={carbsPct} label="Carbs" value={Math.round(totals.carbs)} total={carbsTarget} color="hsl(var(--gym-green))" />
          <MacroRing pct={fatPct} label="Fats" value={Math.round(totals.fat)} total={fatTarget} color="hsl(var(--gym-gold))" />
        </div>

        {/* Meals Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Meals</h2>
            <button className="text-xs font-semibold text-primary">Edit</button>
          </div>

          <div className="mt-3 space-y-3">
            {meals.map((meal, mealIndex) => (
              <div key={mealIndex} className="rounded-2xl border border-border overflow-hidden">
                {/* Meal Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meal.emoji}</span>
                    <span className="text-xs font-bold uppercase tracking-wider">{meal.name}</span>
                  </div>
                  <span className="text-sm font-bold">{mealCalories(meal)} kcal</span>
                </div>

                {/* Food Entries */}
                {meal.entries.map((entry, ei) => (
                  <div key={ei} className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30 last:border-b-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
                      {entry.food.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{entry.food.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {entry.customServing || entry.food.serving}
                        {entry.food.tags[0] && <> · <span className="text-primary/70">{entry.food.tags[0]}</span></>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{entry.food.calories * entry.quantity} kcal</span>
                      <button onClick={() => removeFoodFromMeal(mealIndex, ei)} className="p-0.5 rounded-full hover:bg-destructive/10 transition-colors">
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Food Button */}
                <button
                  onClick={() => setShowAddFood(showAddFood === mealIndex ? null : mealIndex)}
                  className="flex w-full items-center justify-center gap-1 py-2.5 text-[11px] font-semibold text-primary active:bg-primary/5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Food
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* View Full Diary Details Button */}
        <button
          onClick={() => navigate("/diet-insight")}
          className="mt-5 w-full rounded-2xl bg-primary/10 py-3.5 text-center text-xs font-bold text-primary active:scale-[0.98] transition-transform"
        >
          View Full Diary Details
        </button>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowAddFood(0)}
          className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 text-primary-foreground active:scale-90 transition-transform"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Add Food Modal */}
      {showAddFood !== null && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60" onClick={() => { setShowAddFood(null); setSearch(""); }}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-card p-5 pb-8 animate-fade-in max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold">Add to {meals[showAddFood]?.name || "Meal"}</h2>
              <button onClick={() => { setShowAddFood(null); setSearch(""); }} className="p-1">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 mb-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Indian foods, fruits, veggies..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                autoFocus
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2 mb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Food List */}
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {filteredFoods.slice(0, 50).map(food => (
                <button
                  key={food.id}
                  onClick={() => addFoodToMeal(showAddFood, food)}
                  className="flex w-full items-center gap-3 rounded-xl bg-secondary/50 p-3 text-left active:scale-[0.98] transition-all hover:bg-secondary"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">
                    {food.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{food.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-muted-foreground">{food.serving}</span>
                      <span className="text-[9px] font-semibold text-primary">{food.calories} kcal</span>
                    </div>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-[8px] text-muted-foreground">P:{food.protein}g</span>
                      <span className="text-[8px] text-muted-foreground">C:{food.carbs}g</span>
                      <span className="text-[8px] text-muted-foreground">F:{food.fat}g</span>
                    </div>
                  </div>
                  <Plus className="h-4 w-4 shrink-0 text-primary" />
                </button>
              ))}
              {filteredFoods.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No foods found</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default DietTracker;
