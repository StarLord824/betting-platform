"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  closeTime: string; // "HH:MM" or "HH:MM:SS" format
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

  const segments = timeLeft.split(":");
  const labels = ["HRS", "MIN", "SEC"];

  return (
    <div
      className="flex items-center gap-2 mt-3 pt-3"
      style={{ borderTop: "1px solid var(--mykd-border)" }}
    >
      <span
        className="text-xs uppercase tracking-wider mr-1"
        style={{
          color: "var(--mykd-text-dim)",
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 600,
        }}
      >
        Ends in
      </span>
      <div className="flex items-center gap-1">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className="px-2 py-1 text-center clip-notch-sm"
              style={{
                backgroundColor: "var(--mykd-surface-2)",
                border: "1px solid rgba(69, 248, 130, 0.2)",
                minWidth: "36px",
              }}
            >
              <span
                className="font-mono font-bold text-sm"
                style={{ color: "#45F882" }}
              >
                {segment}
              </span>
            </div>
            <span
              className="text-[9px] uppercase"
              style={{
                color: "var(--mykd-text-dim)",
                fontFamily: "'Barlow', sans-serif",
              }}
            >
              {labels[i]}
            </span>
            {i < 2 && (
              <span
                className="mx-0.5 text-xs"
                style={{ color: "var(--mykd-text-dim)" }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
