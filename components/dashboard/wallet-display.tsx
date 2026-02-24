"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet } from "lucide-react";

interface WalletDisplayProps {
  initialBalance: number;
}

export function WalletDisplay({ initialBalance }: WalletDisplayProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [deduction, setDeduction] = useState<number | null>(null);

  // Expose a method to update balance via a global event
  if (typeof window !== "undefined") {
    (window as any).__updateWalletBalance = (newBalance: number) => {
      const diff = balance - newBalance;
      if (diff > 0) {
        setDeduction(diff);
        setTimeout(() => setDeduction(null), 2000);
      }
      setBalance(newBalance);
    };
  }

  return (
    <div
      className="relative flex items-center gap-2 px-3 py-1.5 clip-notch-sm"
      style={{
        backgroundColor: "var(--mykd-surface-2)",
        border: "1px solid rgba(255, 184, 0, 0.2)",
      }}
    >
      <Wallet className="h-4 w-4" style={{ color: "#FFB800" }} />
      <motion.span
        key={balance}
        initial={{ scale: 1.15, color: "#ef4444" }}
        animate={{ scale: 1, color: "#FFB800" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="font-bold text-sm"
        style={{ fontFamily: "'Barlow', sans-serif" }}
      >
        ₹{balance.toLocaleString()}
      </motion.span>

      {/* Floating deduction animation */}
      <AnimatePresence>
        {deduction && (
          <motion.span
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute -top-3 right-0 text-xs font-bold"
            style={{ color: "#ef4444", fontFamily: "'Barlow', sans-serif" }}
          >
            -₹{deduction.toLocaleString()}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
