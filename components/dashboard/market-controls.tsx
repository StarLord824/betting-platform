"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trophy, RotateCcw, Loader2, Power } from "lucide-react";

interface Market {
  id: string;
  name: string;
  open_time: string;
  close_time: string;
  is_active: boolean;
  today_winning_number: string | null;
}

export function MarketControls({
  initialMarkets,
}: {
  initialMarkets: Market[];
}) {
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [winningNumbers, setWinningNumbers] = useState<Record<string, string>>(
    {},
  );
  const router = useRouter();

  const handleApiCall = async (marketId: string, body: any) => {
    setIsLoading(marketId);
    try {
      const res = await fetch("/api/admin/markets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Operation failed");
      }

      return await res.json();
    } catch (error: any) {
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(null);
    }
  };

  const handleToggle = async (marketId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setMarkets(
      markets.map((m) =>
        m.id === marketId ? { ...m, is_active: newStatus } : m,
      ),
    );

    const result = await handleApiCall(marketId, {
      id: marketId,
      is_active: newStatus,
      action: "toggle_status",
    });

    if (result) {
      toast.success(`Market ${newStatus ? "opened" : "closed"}`);
      router.refresh();
    } else {
      setMarkets(
        markets.map((m) =>
          m.id === marketId ? { ...m, is_active: currentStatus } : m,
        ),
      );
    }
  };

  const handleDeclareResult = async (marketId: string) => {
    const winning = winningNumbers[marketId];
    if (!winning) {
      toast.error("Please enter a winning number");
      return;
    }

    const result = await handleApiCall(marketId, {
      id: marketId,
      winning_number: winning,
      action: "declare_result",
    });

    if (result) {
      toast.success("Result declared! Bets have been settled.");
      setMarkets(
        markets.map((m) =>
          m.id === marketId
            ? { ...m, today_winning_number: winning, is_active: false }
            : m,
        ),
      );
      setWinningNumbers((prev) => ({ ...prev, [marketId]: "" }));
      router.refresh();
    }
  };

  const handleDailyReset = async (marketId: string) => {
    const result = await handleApiCall(marketId, {
      id: marketId,
      action: "daily_reset",
    });

    if (result) {
      toast.success("Market reset for new day!");
      setMarkets(
        markets.map((m) =>
          m.id === marketId
            ? { ...m, today_winning_number: null, is_active: true }
            : m,
        ),
      );
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      {markets.map((market) => (
        <div
          key={market.id}
          className="clip-notch-sm p-4 space-y-3"
          style={{
            backgroundColor: "var(--mykd-surface-2)",
            border: `1px solid ${market.is_active ? "rgba(139, 92, 246, 0.3)" : "var(--mykd-border)"}`,
          }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <h3
                className="text-sm font-bold text-white tracking-wider"
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  textTransform: "uppercase",
                }}
              >
                {market.name}
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--mykd-text-dim)" }}
              >
                {market.open_time.substring(0, 5)} –{" "}
                {market.close_time.substring(0, 5)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold px-2 py-0.5 clip-notch-sm uppercase tracking-wider"
                style={{
                  backgroundColor: market.is_active
                    ? "rgba(69, 248, 130, 0.15)"
                    : "rgba(107, 114, 128, 0.15)",
                  color: market.is_active ? "#45F882" : "var(--mykd-text-dim)",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                {market.is_active ? "OPEN" : "CLOSED"}
              </span>
              <button
                onClick={() => handleToggle(market.id, market.is_active)}
                disabled={isLoading === market.id}
                className="w-8 h-8 flex items-center justify-center clip-notch-sm transition-colors"
                style={{
                  backgroundColor: market.is_active
                    ? "rgba(69, 248, 130, 0.15)"
                    : "var(--mykd-surface)",
                  border: `1px solid ${market.is_active ? "rgba(69, 248, 130, 0.3)" : "var(--mykd-border)"}`,
                  color: market.is_active ? "#45F882" : "var(--mykd-text-dim)",
                }}
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Winning number status */}
          {market.today_winning_number && (
            <div
              className="flex items-center gap-2 px-3 py-2 clip-notch-sm"
              style={{
                backgroundColor: "rgba(255, 184, 0, 0.1)",
                border: "1px solid rgba(255, 184, 0, 0.2)",
              }}
            >
              <Trophy className="w-3.5 h-3.5" style={{ color: "#FFB800" }} />
              <span className="text-xs" style={{ color: "#FFB800" }}>
                Result:{" "}
                <span className="font-bold tracking-widest">
                  {market.today_winning_number}
                </span>
              </span>
            </div>
          )}

          {/* Result Declaration */}
          {!market.today_winning_number && (
            <div className="flex gap-2">
              <input
                placeholder="Winning #"
                value={winningNumbers[market.id] || ""}
                onChange={(e) =>
                  setWinningNumbers((prev) => ({
                    ...prev,
                    [market.id]: e.target.value.replace(/\D/g, ""),
                  }))
                }
                className="flex-1 px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none clip-notch-sm"
                style={{
                  backgroundColor: "var(--mykd-surface)",
                  border: "1px solid var(--mykd-border)",
                }}
                disabled={isLoading === market.id}
              />
              <button
                onClick={() => handleDeclareResult(market.id)}
                disabled={isLoading === market.id || !winningNumbers[market.id]}
                className="px-3 py-2 text-xs font-bold uppercase tracking-wider clip-notch-sm disabled:opacity-50 flex items-center gap-1"
                style={{
                  backgroundColor: "rgba(255, 184, 0, 0.15)",
                  border: "1px solid rgba(255, 184, 0, 0.3)",
                  color: "#FFB800",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                {isLoading === market.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Trophy className="h-3 w-3" />
                    Declare
                  </>
                )}
              </button>
            </div>
          )}

          {/* Daily Reset */}
          {market.today_winning_number && (
            <button
              onClick={() => handleDailyReset(market.id)}
              disabled={isLoading === market.id}
              className="w-full py-2 text-xs font-bold uppercase tracking-wider clip-notch-sm disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--mykd-border)",
                color: "var(--mykd-text-muted)",
                fontFamily: "'Barlow', sans-serif",
              }}
            >
              {isLoading === market.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCcw className="h-3 w-3" />
              )}
              Reset for New Day
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
