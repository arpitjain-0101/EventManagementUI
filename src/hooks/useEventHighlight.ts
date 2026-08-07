import { useEffect, useRef, useState } from "react";
import type { EventDto } from "../api";

export function useEventHighlight(durationMs: number) {
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  function highlightEvent(event: EventDto) {
    const eventKey = String(event.id);
    setHighlightedEventId(null);
    requestAnimationFrame(() => {
      setHighlightedEventId(eventKey);
    });

    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
    }

    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedEventId(null);
    }, durationMs);
  }

  return { highlightedEventId, highlightEvent };
}
