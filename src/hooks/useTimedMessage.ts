import { useEffect, useRef, useState } from "react";

export function useTimedMessage(durationMs: number) {
  const [message, setMessage] = useState("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  function showMessage(nextMessage: string) {
    setMessage(nextMessage);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setMessage("");
    }, durationMs);
  }

  function clearMessage() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setMessage("");
  }

  return { message, showMessage, clearMessage };
}
