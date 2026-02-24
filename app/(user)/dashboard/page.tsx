import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db";
import Link from "next/link";
import { Clock, Play, Lock, Trophy } from "lucide-react";
import { CountdownTimer } from "@/components/dashboard/countdown-timer";

export const revalidate = 0;

interface Market {
  id: string;
  name: string;
  open_time: string;
  close_time: string;
  is_active: boolean;
  today_winning_number: string | null;
}

function isMarketOpen(openTime: string, closeTime: string, isActive: boolean) {
  if (!isActive) return false;

  // Convert current UTC time to IST (UTC+5:30)
  const now = new Date();
  const istOffset = 330; // 5.5 hours in minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const currentTime = (utcMinutes + istOffset) % (24 * 60);

  const openTimeStr = openTime.split(":");
  const closeTimeStr = closeTime.split(":");

  const openVal = parseInt(openTimeStr[0]) * 60 + parseInt(openTimeStr[1]);
  const closeVal = parseInt(closeTimeStr[0]) * 60 + parseInt(closeTimeStr[1]);

  return currentTime >= openVal && currentTime < closeVal;
}

function formatTime(timeString: string) {
  const [hours, minutes] = timeString.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const marketsRaw = await prisma.markets.findMany({
    orderBy: { open_time: "asc" },
  });

  if (!marketsRaw) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p style={{ color: "var(--mykd-text-muted)" }}>
          Failed to load markets. Please try again.
        </p>
      </div>
    );
  }

  const markets = marketsRaw.map((m) => ({
    ...m,
    is_active: m.is_active ?? false,
    open_time: m.open_time.toISOString().substring(11, 16),
    close_time: m.close_time.toISOString().substring(11, 16),
  }));

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1
          className="text-3xl md:text-4xl tracking-wider"
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: "#45F882" }}>LIVE</span>{" "}
          <span className="text-white">MARKETS</span>
        </h1>
        <p className="text-sm" style={{ color: "var(--mykd-text-muted)" }}>
          Select a market to place your bets
        </p>
      </div>

      {/* Market Grid */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {markets.map((market: Market) => {
          const isOpen = isMarketOpen(
            market.open_time,
            market.close_time,
            market.is_active,
          );

          return (
            <Link
              key={market.id}
              href={isOpen ? `/market/${market.id}` : "#"}
              className={`group relative block transition-all duration-300 ${
                isOpen ? "cursor-pointer" : "cursor-not-allowed"
              }`}
            >
              {/* Card */}
              <div
                className={`clip-notch relative overflow-hidden p-5 md:p-6 transition-all duration-300 ${
                  isOpen ? "neon-glow-sm group-hover:-translate-y-0.5" : ""
                }`}
                style={{
                  backgroundColor: "var(--mykd-surface)",
                  border: `1px solid ${isOpen ? "rgba(69, 248, 130, 0.3)" : "var(--mykd-border)"}`,
                  opacity: isOpen ? 1 : 0.6,
                }}
              >
                {/* Top accent line */}
                {isOpen && (
                  <div
                    className="absolute top-0 left-0 right-[14px] h-[2px]"
                    style={{
                      background:
                        "linear-gradient(90deg, #45F882, transparent)",
                    }}
                  />
                )}

                {/* Decorative glow */}
                {isOpen && (
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
                    style={{
                      backgroundColor: "rgba(69, 248, 130, 0.08)",
                      filter: "blur(40px)",
                    }}
                  />
                )}

                <div className="flex justify-between items-start mb-4 relative">
                  <div>
                    <h3
                      className="text-lg md:text-xl font-bold text-white mb-1"
                      style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 700,
                      }}
                    >
                      {market.name}
                    </h3>
                    <div
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: "var(--mykd-text-muted)" }}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {formatTime(market.open_time)} –{" "}
                        {formatTime(market.close_time)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isOpen ? (
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 clip-notch-sm text-xs font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: "rgba(69, 248, 130, 0.15)",
                        color: "#45F882",
                        fontFamily: "'Barlow', sans-serif",
                      }}
                    >
                      <span className="relative flex h-2 w-2">
                        <span
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ backgroundColor: "#45F882" }}
                        />
                        <span
                          className="relative inline-flex rounded-full h-2 w-2"
                          style={{ backgroundColor: "#45F882" }}
                        />
                      </span>
                      <Play className="w-3 h-3 fill-current" />
                      LIVE
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 clip-notch-sm text-xs font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: "var(--mykd-surface-2)",
                        color: "var(--mykd-text-dim)",
                        fontFamily: "'Barlow', sans-serif",
                      }}
                    >
                      <Lock className="w-3 h-3" />
                      CLOSED
                    </div>
                  )}
                </div>

                {/* Countdown Timer */}
                {isOpen && <CountdownTimer closeTime={market.close_time} />}

                {/* Result display */}
                {!isOpen && market.today_winning_number && (
                  <div
                    className="flex items-center gap-2 mt-3 pt-3"
                    style={{ borderTop: "1px solid var(--mykd-border)" }}
                  >
                    <Trophy
                      className="w-3.5 h-3.5"
                      style={{ color: "#FFB800" }}
                    />
                    <span
                      className="text-xs uppercase tracking-wider"
                      style={{ color: "var(--mykd-text-dim)" }}
                    >
                      Result:
                    </span>
                    <span
                      className="font-mono font-bold tracking-widest text-sm"
                      style={{ color: "#FFB800" }}
                    >
                      {market.today_winning_number}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
