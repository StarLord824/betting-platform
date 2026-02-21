import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Clock, Play, AlertCircle } from "lucide-react";

export const revalidate = 0; // always fetch fresh markets data

interface Market {
  id: string;
  name: string;
  open_time: string;
  close_time: string;
  is_active: boolean;
}

function isMarketOpen(openTime: string, closeTime: string, isActive: boolean) {
  if (!isActive) return false;

  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  const openTimeStr = openTime.split(":");
  const closeTimeStr = closeTime.split(":");

  const openVal = parseInt(openTimeStr[0]) * 100 + parseInt(openTimeStr[1]);
  const closeVal = parseInt(closeTimeStr[0]) * 100 + parseInt(closeTimeStr[1]);

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

  const { data: markets, error } = await supabase
    .from("markets")
    .select("*")
    .order("open_time", { ascending: true });

  if (error || !markets) {
    return <div>Error loading markets</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">
          Live Markets
        </h1>
        <p className="text-neutral-400">Select a market to place your bets.</p>
      </div>

      <div className="grid gap-4">
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
              className={`
                relative p-5 rounded-2xl border transition-all overflow-hidden group
                ${
                  isOpen
                    ? "bg-neutral-900 border-emerald-500/30 hover:border-emerald-500 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
                    : "bg-neutral-900/50 border-neutral-800 opacity-75 cursor-not-allowed"
                }
              `}
            >
              {isOpen && (
                <div className="absolute top-0 right-0 p-1">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3
                    className={`text-xl font-bold ${isOpen ? "text-white" : "text-neutral-400"}`}
                  >
                    {market.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-neutral-400">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTime(market.open_time)} -{" "}
                      {formatTime(market.close_time)}
                    </span>
                  </div>
                </div>

                {isOpen ? (
                  <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Play className="w-3 h-3 fill-current" />
                    PLAY NOW
                  </div>
                ) : (
                  <div className="bg-neutral-800 text-neutral-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    CLOSED
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
