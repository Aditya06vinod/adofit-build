import { useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Main tab pages in order (matches BottomNav)
const TAB_PATHS = ["/", "/workout", "/log", "/progress", "/profile"];

const SWIPE_THRESHOLD = 60; // minimum px to register a swipe
const SWIPE_VELOCITY_THRESHOLD = 0.3; // px/ms for fast swipes
const MAX_VERTICAL_RATIO = 1.5; // horizontal must be > vertical / this ratio

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
  isSwiping: boolean;
}

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const swipeRef = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isSwiping: false,
  });

  const currentTabIndex = TAB_PATHS.indexOf(location.pathname);
  const isTabPage = currentTabIndex !== -1;

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isTabPage) return;
      const touch = e.touches[0];
      swipeRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        isSwiping: true,
      };
    },
    [isTabPage]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isTabPage || !swipeRef.current.isSwiping) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeRef.current.startX;
      const deltaY = touch.clientY - swipeRef.current.startY;
      const elapsed = Date.now() - swipeRef.current.startTime;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      const velocity = absDeltaX / elapsed;

      swipeRef.current.isSwiping = false;

      // Must be more horizontal than vertical
      if (absDeltaY > absDeltaX * MAX_VERTICAL_RATIO) return;

      // Must exceed threshold (either distance or velocity)
      const passesThreshold =
        absDeltaX >= SWIPE_THRESHOLD || velocity >= SWIPE_VELOCITY_THRESHOLD;
      if (!passesThreshold) return;

      if (deltaX < 0) {
        // Swipe LEFT → go to NEXT tab
        const nextIndex = currentTabIndex + 1;
        if (nextIndex < TAB_PATHS.length) {
          navigate(TAB_PATHS[nextIndex]);
        }
      } else {
        // Swipe RIGHT → go to PREVIOUS tab
        const prevIndex = currentTabIndex - 1;
        if (prevIndex >= 0) {
          navigate(TAB_PATHS[prevIndex]);
        }
      }
    },
    [isTabPage, currentTabIndex, navigate]
  );

  return { onTouchStart, onTouchEnd, isTabPage };
}
