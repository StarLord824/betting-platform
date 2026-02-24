"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trophy, RotateCcw, Loader2 } from "lucide-react";

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
      toast.success("Market status updated");
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
    <div className="space-y-6">
      {markets.map((market) => (
        <div
          key={market.id}
          className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4"
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold text-white">
                {market.name}
              </Label>
              <p className="text-sm text-neutral-400">
                {market.open_time.substring(0, 5)} –{" "}
                {market.close_time.substring(0, 5)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  market.is_active
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {market.is_active ? "OPEN" : "CLOSED"}
              </span>
              <Switch
                checked={market.is_active}
                onCheckedChange={() =>
                  handleToggle(market.id, market.is_active)
                }
                disabled={isLoading === market.id}
              />
            </div>
          </div>

          {/* Winning number status */}
          {market.today_winning_number && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400">
                Today&apos;s Result:{" "}
                <span className="font-bold tracking-widest">
                  {market.today_winning_number}
                </span>
              </span>
            </div>
          )}

          {/* Result Declaration */}
          {!market.today_winning_number && (
            <div className="flex gap-2">
              <Input
                placeholder="Winning number"
                value={winningNumbers[market.id] || ""}
                onChange={(e) =>
                  setWinningNumbers((prev) => ({
                    ...prev,
                    [market.id]: e.target.value.replace(/\D/g, ""),
                  }))
                }
                className="bg-neutral-900 border-neutral-700 text-white flex-1"
                disabled={isLoading === market.id}
              />
              <Button
                onClick={() => handleDeclareResult(market.id)}
                disabled={isLoading === market.id || !winningNumbers[market.id]}
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-white"
              >
                {isLoading === market.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trophy className="h-4 w-4 mr-1" />
                    Declare
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Daily Reset */}
          {market.today_winning_number && (
            <Button
              onClick={() => handleDailyReset(market.id)}
              disabled={isLoading === market.id}
              variant="outline"
              size="sm"
              className="w-full border-neutral-700 text-neutral-300 hover:text-white"
            >
              {isLoading === market.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Reset for New Day
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
