import { ChevronLeft, UtensilsCrossed, Dumbbell, Droplets, Scale, History, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";

const quickActions = [
  { icon: UtensilsCrossed, label: "Log Food", desc: "Track meals & snacks", path: "/diet", color: "from-orange-500/20 to-amber-500/20", emoji: "🍛" },
  { icon: Dumbbell, label: "Log Workout", desc: "Record your exercises", path: "/workout", color: "from-blue-500/20 to-cyan-500/20", emoji: "💪" },
  { icon: Droplets, label: "Log Water", desc: "Track hydration", path: null, color: "from-sky-500/20 to-blue-500/20", emoji: "💧" },
  { icon: Scale, label: "Log Weight", desc: "Update body weight", path: null, color: "from-purple-500/20 to-pink-500/20", emoji: "⚖️" },
];

const recentLogs = [
  { type: "food", emoji: "🍛", label: "Dal Chawal", detail: "1 plate · 380 kcal", time: "1:00 PM" },
  { type: "workout", emoji: "💪", label: "Upper Body Blast", detail: "35 min · 280 cal", time: "7:00 AM" },
  { type: "water", emoji: "💧", label: "Water", detail: "500 ml", time: "10:30 AM" },
  { type: "food", emoji: "🫓", label: "Aloo Paratha", detail: "1 paratha · 320 kcal", time: "8:00 AM" },
];

const Log = () => {
  const navigate = useNavigate();
  const [waterGlasses, setWaterGlasses] = useState(() => {
    return parseInt(localStorage.getItem("ado-water-today") || "0");
  });
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weight, setWeight] = useState(localStorage.getItem("ado-user-weight") || "70");

  const addWater = () => {
    const next = waterGlasses + 1;
    setWaterGlasses(next);
    localStorage.setItem("ado-water-today", next.toString());
  };

  const saveWeight = () => {
    localStorage.setItem("ado-user-weight", weight);
    setShowWeightInput(false);
  };

  return (
    <MobileLayout>
      <div className="animate-fade-in px-4 pt-4 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold">Quick Log</h1>
          <div className="w-6" />
        </div>

        {/* Quick Actions Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                if (action.path) navigate(action.path);
                else if (action.label === "Log Water") addWater();
                else if (action.label === "Log Weight") setShowWeightInput(true);
              }}
              className={`flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br ${action.color} p-5 transition-all active:scale-95`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                {action.emoji}
              </div>
              <p className="text-sm font-bold">{action.label}</p>
              <p className="text-[10px] text-muted-foreground">{action.desc}</p>
            </button>
          ))}
        </div>

        {/* Water Tracker */}
        <div className="mt-5 rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💧</span>
              <div>
                <p className="text-sm font-bold">Water Today</p>
                <p className="text-[10px] text-muted-foreground">{waterGlasses} glasses ({waterGlasses * 250} ml)</p>
              </div>
            </div>
            <button onClick={addWater} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 active:scale-90 transition-transform">
              <Plus className="h-4 w-4 text-primary" />
            </button>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < waterGlasses ? "bg-blue-400" : "bg-secondary"
                }`}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[9px] text-muted-foreground text-center">
            {waterGlasses >= 8 ? "🎉 Goal reached!" : `${8 - waterGlasses} more glasses to go`}
          </p>
        </div>

        {/* Recent Activity */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-bold">Recent Activity</h2>
            </div>
          </div>
          <div className="space-y-2">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
                  {log.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{log.label}</p>
                  <p className="text-[10px] text-muted-foreground">{log.detail}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weight Input Modal */}
      {showWeightInput && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={() => setShowWeightInput(false)}>
          <div onClick={e => e.stopPropagation()} className="w-72 rounded-2xl bg-card p-6 animate-scale-in">
            <h3 className="text-sm font-bold text-center">Update Weight</h3>
            <div className="mt-4 flex items-center justify-center gap-2">
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-24 rounded-xl bg-secondary px-3 py-2.5 text-center text-lg font-bold text-foreground outline-none"
              />
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
            <button onClick={saveWeight} className="mt-4 w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground active:scale-95 transition-transform">
              Save
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Log;
