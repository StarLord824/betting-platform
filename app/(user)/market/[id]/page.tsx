import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { BettingForm } from "@/components/betting/betting-form";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import prisma from "@/lib/db";

export const revalidate = 0;

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

export default async function MarketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const marketRaw = await prisma.markets.findUnique({
    where: { id },
  });

  if (!marketRaw) {
    notFound();
  }

  const market = {
    ...marketRaw,
    is_active: marketRaw.is_active ?? false,
    open_time: marketRaw.open_time.toISOString().substring(11, 19),
    close_time: marketRaw.close_time.toISOString().substring(11, 19),
  };

  const isOpen = isMarketOpen(
    market.open_time,
    market.close_time,
    market.is_active,
  );

  if (!isOpen) {
    redirect("/");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { balance: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="p-2 transition-colors clip-notch-sm"
          style={{
            backgroundColor: "var(--mykd-surface)",
            border: "1px solid var(--mykd-border)",
            color: "var(--mykd-text-muted)",
          }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold text-white tracking-wider"
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            {market.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
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
            <span
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#45F882", fontFamily: "'Barlow', sans-serif" }}
            >
              Market Open
            </span>
          </div>
        </div>
      </div>

      <BettingForm marketId={market.id} marketName={market.name} />
    </div>
  );
}
