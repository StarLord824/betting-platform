"use client";

import { useState, useEffect } from "react";
import { sortPanna, validateGameInput } from "@/lib/game-logic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Coins } from "lucide-react";

// Smart autocomplete suggestions for given input
function getPannaSuggestions(input: string, gameType: string): string[] {
  if (
    !input ||
    input.length >= 3 ||
    !["single_panna", "double_panna", "triple_panna"].includes(gameType)
  )
    return [];

  const suggestions: string[] = [];
  const base = input;

  // Find valid 3-digit combinations starting with the input
  for (let i = 0; i <= 9; i++) {
    for (let j = 0; j <= 9; j++) {
      const candidate =
        base + i.toString() + (base.length === 1 ? j.toString() : "");
      if (candidate.length === 3 && validateGameInput(gameType, candidate)) {
        suggestions.push(sortPanna(candidate));
      }
    }
  }

  // Return unique, sorted suggestions (max 5)
  return Array.from(new Set(suggestions)).sort().slice(0, 5);
}

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
  const [gameType, setGameType] = useState<string>("single_digit");
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Update suggestions when number changes
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

    // Sort Panna if applicable
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

      if (onSuccess && data.new_balance !== undefined) {
        onSuccess(data.new_balance);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 bg-neutral-900 border border-neutral-800 p-4 sm:p-6 rounded-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative">
          <Label className="text-neutral-400">Game Type</Label>
          <Select
            value={gameType}
            onValueChange={(val) => {
              setGameType(val);
              setNumber("");
            }}
          >
            <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white focus:ring-emerald-500">
              <SelectValue placeholder="Select a game" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-neutral-800 text-white">
              <SelectItem value="single_digit">Single Digit (0-9)</SelectItem>
              <SelectItem value="jodi">Jodi (00-99)</SelectItem>
              <SelectItem value="single_panna">
                Single Panna (e.g. 123)
              </SelectItem>
              <SelectItem value="double_panna">
                Double Panna (e.g. 112)
              </SelectItem>
              <SelectItem value="triple_panna">
                Triple Panna (e.g. 777)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 relative">
          <Label className="text-neutral-400">Number</Label>
          <div className="relative">
            <Input
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
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))} // numbers only
              maxLength={
                gameType.includes("panna") ? 3 : gameType === "jodi" ? 2 : 1
              }
              className="bg-neutral-950 border-neutral-800 text-white text-lg font-mono focus-visible:ring-emerald-500"
              disabled={isLoading}
            />
          </div>

          {/* Smart Autocomplete Suggestions */}
          {suggestions.length > 0 && number.length < 3 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setNumber(sug)}
                  className="px-3 py-1 bg-neutral-800 text-emerald-400 border border-emerald-500/30 text-sm font-mono rounded-md hover:bg-neutral-700 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 relative">
          <Label className="text-neutral-400">Bet Amount (₹)</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              <Coins className="w-4 h-4" />
            </div>
            <Input
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-neutral-950 border-neutral-800 text-white pl-9 text-lg focus-visible:ring-emerald-500"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.6)] transition-all"
        disabled={isLoading || !number || !amount}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          "PLACE BET"
        )}
      </Button>
    </form>
  );
}
