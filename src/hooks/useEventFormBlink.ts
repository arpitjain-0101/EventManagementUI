import { useEffect, useRef, useState } from "react";

export function useEventFormBlink(blinkDurationMs: number) {
  const eventFormContainerRef = useRef<HTMLDivElement | null>(null);
  const blinkTimerRef = useRef<number | null>(null);
  const [isFormBlinking, setIsFormBlinking] = useState(false);

  useEffect(() => {
    return () => {
      if (blinkTimerRef.current !== null) {
        window.clearTimeout(blinkTimerRef.current);
      }
    };
  }, []);

  function focusAndBlinkEventForm() {
    const container = eventFormContainerRef.current;
    if (!container) return;

    container.scrollIntoView({ behavior: "smooth", block: "start" });

    const firstInput = container.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;
    firstInput?.focus();

    setIsFormBlinking(false);
    requestAnimationFrame(() => {
      setIsFormBlinking(true);
    });

    if (blinkTimerRef.current !== null) {
      window.clearTimeout(blinkTimerRef.current);
    }

    blinkTimerRef.current = window.setTimeout(() => {
      setIsFormBlinking(false);
    }, blinkDurationMs);
  }

  return { eventFormContainerRef, isFormBlinking, focusAndBlinkEventForm };
}
