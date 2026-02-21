"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Market {
  id: string;
  name: string;
  open_time: string;
  close_time: string;
  is_active: boolean;
}

export function MarketControls({
  initialMarkets,
}: {
  initialMarkets: Market[];
}) {
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleToggle = async (marketId: string, currentStatus: boolean) => {
    setIsLoading(marketId);
    const newStatus = !currentStatus;

    // Optimistic update
    setMarkets(
      markets.map((m) =>
        m.id === marketId ? { ...m, is_active: newStatus } : m,
      ),
    );

    try {
      const res = await fetch("/api/admin/markets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: marketId,
          is_active: newStatus,
          action: "toggle_status",
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success("Market status updated");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update market");
      // Revert optimistic update
      setMarkets(
        markets.map((m) =>
          m.id === marketId ? { ...m, is_active: currentStatus } : m,
        ),
      );
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {markets.map((market) => (
        <div
          key={market.id}
          className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 rounded-lg"
        >
          <div className="space-y-1">
            <Label className="text-base font-semibold text-white">
              {market.name}
            </Label>
            <p className="text-sm text-neutral-400">
              {market.open_time.substring(0, 5)} -{" "}
              {market.close_time.substring(0, 5)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${market.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-400"}`}
            >
              {market.is_active ? "OPEN" : "CLOSED"}
            </span>
            <Switch
              checked={market.is_active}
              onCheckedChange={() => handleToggle(market.id, market.is_active)}
              disabled={isLoading === market.id}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
