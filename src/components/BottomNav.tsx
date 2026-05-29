import { Home, Dumbbell, Plus, BarChart3, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Dumbbell, label: "Workouts", path: "/workout" },
  { icon: Plus, label: "Log", path: "/log", isCenter: true },
  { icon: BarChart3, label: "Progress", path: "/progress" },
  { icon: User, label: "Profile", path: "/profile" },
];

const triggerHaptic = (intensity: number = 10) => {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(intensity);
  }
};

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-[#111111]/95 backdrop-blur-lg">
      <div className="flex items-center justify-around py-1.5 pb-[env(safe-area-inset-bottom,8px)]">
        {navItems.map((item) => {
          const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => {
                triggerHaptic(item.isCenter ? 20 : 10);
                navigate(item.path);
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-all ${
                item.isCenter ? "relative -mt-6" : ""
              } ${isActive && !item.isCenter ? "text-[#4A85F6]" : !item.isCenter ? "text-muted-foreground" : ""}`}
            >
              {item.isCenter ? (
                <div className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-90 bg-[#1C64F2] text-white shadow-blue-500/20`}>
                  <item.icon className="h-6 w-6" strokeWidth={2.5} />
                </div>
              ) : (
                <item.icon className={`h-5 w-5 ${isActive ? "text-[#4A85F6]" : "text-muted-foreground"}`} />
              )}
              <span className={`text-[10px] font-medium mt-0.5 ${item.isCenter ? "text-muted-foreground" : (isActive ? "text-[#4A85F6]" : "text-muted-foreground")}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
