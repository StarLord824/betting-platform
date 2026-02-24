import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db";
import { MarketControls } from "@/components/dashboard/market-controls";
import { format } from "date-fns";
import { Activity, BarChart3, TrendingUp } from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch Markets
  const marketsRaw = await prisma.markets.findMany({
    orderBy: { open_time: "asc" },
  });

  const markets = marketsRaw.map((m) => ({
    ...m,
    is_active: m.is_active ?? false,
    open_time: m.open_time.toISOString().substring(11, 19),
    close_time: m.close_time.toISOString().substring(11, 19),
  }));

  // Fetch Today's Bets
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const betsRaw = await prisma.bets.findMany({
    where: { created_at: { gte: today } },
    orderBy: { created_at: "desc" },
    include: {
      profiles: { select: { phone_number: true } },
      markets: { select: { name: true } },
    },
  });

  const bets = betsRaw.map((b) => ({
    ...b,
    amount: Number(b.amount),
  }));

  const totalBetsAmount = bets?.reduce((sum, bet) => sum + bet.amount, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1
            className="text-3xl md:text-4xl tracking-wider"
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: "#8B5CF6" }}>DASHBOARD</span>{" "}
            <span className="text-white">OVERVIEW</span>
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--mykd-text-muted)" }}
          >
            Manage markets and monitor live activity
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div
            className="clip-notch-sm px-4 py-2.5"
            style={{
              backgroundColor: "var(--mykd-surface)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: "#8B5CF6" }} />
              <span
                className="text-xs uppercase tracking-wider"
                style={{
                  color: "var(--mykd-text-muted)",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                Volume Today
              </span>
            </div>
            <p
              className="text-xl font-bold text-white mt-1"
              style={{ fontFamily: "'Barlow', sans-serif" }}
            >
              ₹{totalBetsAmount.toLocaleString()}
            </p>
          </div>
          <div
            className="clip-notch-sm px-4 py-2.5"
            style={{
              backgroundColor: "var(--mykd-surface)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: "#8B5CF6" }} />
              <span
                className="text-xs uppercase tracking-wider"
                style={{
                  color: "var(--mykd-text-muted)",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                Total Bets
              </span>
            </div>
            <p
              className="text-xl font-bold text-white mt-1"
              style={{ fontFamily: "'Barlow', sans-serif" }}
            >
              {bets?.length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Markets */}
        <div className="lg:col-span-1">
          <div
            className="clip-notch overflow-hidden"
            style={{
              backgroundColor: "var(--mykd-surface)",
              border: "1px solid var(--mykd-border)",
            }}
          >
            {/* Top accent line */}
            <div
              className="h-[2px]"
              style={{
                background: "linear-gradient(90deg, #8B5CF6, transparent)",
              }}
            />
            <div className="p-5">
              <h2
                className="text-lg font-bold text-white mb-1 tracking-wider"
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Market Controls
              </h2>
              <p
                className="text-xs mb-4"
                style={{ color: "var(--mykd-text-muted)" }}
              >
                Open/close markets and declare winners.
              </p>
              <MarketControls initialMarkets={markets || []} />
            </div>
          </div>
        </div>

        {/* Right Column - Live Feed */}
        <div className="lg:col-span-2">
          <div
            className="clip-notch overflow-hidden"
            style={{
              backgroundColor: "var(--mykd-surface)",
              border: "1px solid var(--mykd-border)",
            }}
          >
            {/* Top accent line */}
            <div
              className="h-[2px]"
              style={{
                background: "linear-gradient(90deg, #8B5CF6, transparent)",
              }}
            />

            {/* Header */}
            <div
              className="p-5 flex justify-between items-center"
              style={{ borderBottom: "1px solid var(--mykd-border)" }}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: "#8B5CF6" }} />
                <h2
                  className="text-lg font-bold text-white tracking-wider"
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Live Feed
                </h2>
              </div>
              <span
                className="text-xs px-3 py-1 clip-notch-sm"
                style={{
                  backgroundColor: "var(--mykd-surface-2)",
                  color: "var(--mykd-text-muted)",
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                }}
              >
                {bets?.length || 0} bets today
              </span>
            </div>

            {/* Table */}
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full">
                <thead
                  className="sticky top-0 z-10"
                  style={{ backgroundColor: "var(--mykd-surface-2)" }}
                >
                  <tr>
                    {["Time", "User", "Market", "Game & Number", "Amount"].map(
                      (h, i) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${i === 4 ? "text-right" : "text-left"}`}
                          style={{
                            color: "var(--mykd-text-dim)",
                            fontFamily: "'Barlow', sans-serif",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {!bets?.length ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-12 text-sm"
                        style={{ color: "var(--mykd-text-dim)" }}
                      >
                        No bets placed today yet.
                      </td>
                    </tr>
                  ) : (
                    bets.map((bet: any) => (
                      <tr
                        key={bet.id}
                        className="transition-colors hover:bg-[#182029] border-b border-[#1F2935]"
                      >
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: "var(--mykd-text-muted)" }}
                        >
                          {format(new Date(bet.created_at), "HH:mm:ss")}
                        </td>
                        <td
                          className="px-4 py-3 font-mono text-sm"
                          style={{ color: "var(--mykd-text-muted)" }}
                        >
                          {bet.profiles?.phone_number || "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {bet.markets?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span
                              className="text-[10px] uppercase tracking-wider"
                              style={{
                                color: "var(--mykd-text-dim)",
                                fontFamily: "'Barlow', sans-serif",
                              }}
                            >
                              {bet.game_type.replace("_", " ")}
                            </span>
                            <span
                              className="font-mono font-bold tracking-widest"
                              style={{ color: "#45F882" }}
                            >
                              {bet.number}
                            </span>
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 text-right font-bold text-white"
                          style={{ fontFamily: "'Barlow', sans-serif" }}
                        >
                          ₹{Number(bet.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
