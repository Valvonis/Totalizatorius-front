import { useEffect, useRef } from "react";

/**
 * Calls `callback` every `intervalMs` while the browser tab is visible.
 * Pauses when the tab is hidden to avoid wasted requests.
 */
export function useAutoRefresh(callback: () => void, intervalMs: number) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    const start = () => {
      timer = setInterval(() => savedCallback.current(), intervalMs);
    };

    const handleVisibility = () => {
      clearInterval(timer);
      if (document.visibilityState === "visible") {
        savedCallback.current(); // refresh immediately when tab becomes visible
        start();
      }
    };

    if (document.visibilityState === "visible") {
      start();
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intervalMs]);
}
