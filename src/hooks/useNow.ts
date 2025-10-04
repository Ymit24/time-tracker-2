import { useState, useEffect } from "react";

/**
 * Hook that returns the current time and updates it every second
 */
export function useNow(): Date {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return now;
}
