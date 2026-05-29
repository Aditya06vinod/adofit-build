import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import SafeAreaView from "./ui/SafeAreaView";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

const MobileLayout = ({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) => {
  const { pathname } = useLocation();
  const { onTouchStart, onTouchEnd } = useSwipeNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div
        className={`flex-1 ${hideNav ? "" : "pb-24"}`}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default MobileLayout;

