"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  closeTime: string; // "HH:MM:SS" format
}

export function CountdownTimer({ closeTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function calculateTimeLeft() {
      const now = new Date();
      const [hours, minutes] = closeTime.split(":").map(Number);

      const close = new Date();
      close.setHours(hours, minutes, 0, 0);

      const diff = close.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      );
    }

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [closeTime]);

  if (!timeLeft || timeLeft === "00:00:00") return null;

  return (
    <div className="flex items-center gap-1.5 mt-2">
      <div className="flex items-center gap-0.5 font-mono text-sm">
        {timeLeft.split(":").map((segment, i) => (
          <span key={i} className="flex items-center">
            <span className="bg-neutral-800 text-emerald-400 px-1.5 py-0.5 rounded text-xs font-bold tracking-wider">
              {segment}
            </span>
            {i < 2 && (
              <span className="text-neutral-600 mx-0.5 text-xs">:</span>
            )}
          </span>
        ))}
      </div>
      <span className="text-neutral-500 text-xs ml-1">left</span>
    </div>
  );
}
