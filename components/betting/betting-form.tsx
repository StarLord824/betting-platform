"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sortPanna, validateGameInput } from "@/lib/game-logic";
import { toast } from "sonner";
import { Loader2, Coins, Zap } from "lucide-react";

// Smart autocomplete suggestions
function getPannaSuggestions(input: string, gameType: string): string[] {
  if (
    !input ||
    input.length >= 3 ||
    !["single_panna", "double_panna", "triple_panna"].includes(gameType)
  )
    return [];

  const suggestions: string[] = [];
  const base = input;

  for (let i = 0; i <= 9; i++) {
    for (let j = 0; j <= 9; j++) {
      const candidate =
        base + i.toString() + (base.length === 1 ? j.toString() : "");
      if (candidate.length === 3 && validateGameInput(gameType, candidate)) {
        suggestions.push(sortPanna(candidate));
      }
    }
  }

  return Array.from(new Set(suggestions)).sort().slice(0, 8);
}

const GAME_TYPES = [
  { value: "single_digit", label: "Single Digit", hint: "0-9" },
  { value: "jodi", label: "Jodi", hint: "00-99" },
  { value: "single_panna", label: "Single Panna", hint: "e.g. 123" },
  { value: "double_panna", label: "Double Panna", hint: "e.g. 112" },
  { value: "triple_panna", label: "Triple Panna", hint: "e.g. 777" },
];

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

interface BettingFormProps {
  marketId: string;
  marketName: string;
  onSuccess?: (newBalance: number) => void;
}

export function BettingForm({
  marketId,
  marketName,
  onSuccess,
}: BettingFormProps) {
  const router = useRouter();
  const [gameType, setGameType] = useState<string>("single_digit");
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setSuggestions(getPannaSuggestions(number, gameType));
  }, [number, gameType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateGameInput(gameType, number)) {
      return toast.error("Invalid number format for selected game type");
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    setIsLoading(true);

    const finalNumber = [
      "single_panna",
      "double_panna",
      "triple_panna",
    ].includes(gameType)
      ? sortPanna(number)
      : number;

    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId,
          gameType,
          number: finalNumber,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place bet");
      }

      toast.success("Bet placed successfully!");
      setNumber("");
      setAmount("");

      if (
        typeof window !== "undefined" &&
        (window as any).__updateWalletBalance &&
        data.bet?.new_balance !== undefined
      ) {
        (window as any).__updateWalletBalance(data.bet.new_balance);
      }

      if (onSuccess && data.bet?.new_balance !== undefined) {
        onSuccess(data.bet.new_balance);
      }

      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Game Type Selector */}
      <div
        className="clip-notch p-5 md:p-6 space-y-5"
        style={{
          backgroundColor: "var(--mykd-surface)",
          border: "1px solid var(--mykd-border)",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-[14px] h-[2px]"
          style={{ background: "linear-gradient(90deg, #45F882, transparent)" }}
        />

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-3"
            style={{
              color: "var(--mykd-text-muted)",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            Game Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {GAME_TYPES.map((gt) => (
              <button
                key={gt.value}
                type="button"
                onClick={() => {
                  setGameType(gt.value);
                  setNumber("");
                }}
                className="py-2.5 px-3 text-center transition-all clip-notch-sm text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor:
                    gameType === gt.value
                      ? "rgba(69, 248, 130, 0.15)"
                      : "var(--mykd-surface-2)",
                  border: `1px solid ${gameType === gt.value ? "rgba(69, 248, 130, 0.4)" : "var(--mykd-border)"}`,
                  color:
                    gameType === gt.value
                      ? "#45F882"
                      : "var(--mykd-text-muted)",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                <div>{gt.label}</div>
                <div className="text-[10px] mt-0.5 opacity-60">{gt.hint}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Number Input */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{
              color: "var(--mykd-text-muted)",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            Your Number
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder={
              gameType.includes("panna")
                ? "Enter 3 digits"
                : gameType === "jodi"
                  ? "Enter 2 digits"
                  : "Enter 1 digit"
            }
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
            maxLength={
              gameType.includes("panna") ? 3 : gameType === "jodi" ? 2 : 1
            }
            className="w-full px-4 py-3 text-xl font-mono text-white tracking-widest placeholder:text-gray-600 outline-none focus:ring-2 transition-all clip-notch-sm"
            style={{
              backgroundColor: "var(--mykd-surface-2)",
              border: "1px solid var(--mykd-border)",
            }}
            disabled={isLoading}
          />

          {/* Smart Autocomplete */}
          {suggestions.length > 0 && number.length < 3 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setNumber(sug)}
                  className="px-3 py-1.5 font-mono text-sm font-bold tracking-wider transition-all clip-notch-sm btn-lift"
                  style={{
                    backgroundColor: "rgba(69, 248, 130, 0.1)",
                    border: "1px solid rgba(69, 248, 130, 0.3)",
                    color: "#45F882",
                  }}
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{
              color: "var(--mykd-text-muted)",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            Bet Amount (₹)
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Coins className="w-4 h-4" style={{ color: "#FFB800" }} />
            </div>
            <input
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-lg text-white font-semibold placeholder:text-gray-600 outline-none focus:ring-2 transition-all clip-notch-sm"
              style={{
                backgroundColor: "var(--mykd-surface-2)",
                border: "1px solid var(--mykd-border)",
              }}
              disabled={isLoading}
            />
          </div>

          {/* Quick amount buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {QUICK_AMOUNTS.map((qa) => (
              <button
                key={qa}
                type="button"
                onClick={() => setAmount(qa.toString())}
                className="px-3 py-1.5 text-xs font-bold tracking-wider transition-all clip-notch-sm"
                style={{
                  backgroundColor:
                    amount === qa.toString()
                      ? "rgba(255, 184, 0, 0.15)"
                      : "var(--mykd-surface-2)",
                  border: `1px solid ${amount === qa.toString() ? "rgba(255, 184, 0, 0.4)" : "var(--mykd-border)"}`,
                  color:
                    amount === qa.toString()
                      ? "#FFB800"
                      : "var(--mykd-text-dim)",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                ₹{qa.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Place Bet Button */}
      <button
        type="submit"
        className="w-full py-4 text-base font-bold uppercase tracking-wider clip-notch btn-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: "#45F882",
          color: "#0F161B",
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 800,
          boxShadow:
            "0 0 25px rgba(69, 248, 130, 0.3), 0 0 50px rgba(69, 248, 130, 0.1)",
        }}
        disabled={isLoading || !number || !amount}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Zap className="h-5 w-5" />
            Place Bet
          </>
        )}
      </button>
    </form>
  );
}
