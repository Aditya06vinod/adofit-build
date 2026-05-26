import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import SafeAreaView from "./ui/SafeAreaView";

const MobileLayout = ({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <SafeAreaView className="bg-background">
      <div className={`flex-1 ${hideNav ? "" : "pb-20"}`}>{children}</div>
      {!hideNav && <BottomNav />}
    </SafeAreaView>
  );
};

export default MobileLayout;
