import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { BettingForm } from "@/components/betting/betting-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
  params: { id: string };
}) {
  const supabase = await createClient();

  const marketRaw = await prisma.markets.findUnique({
    where: { id: params.id },
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
    // Prevent entry to closed markets entirely
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
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {market.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-400">
              Market Open
            </span>
          </div>
        </div>
      </div>

      <BettingForm marketId={market.id} marketName={market.name} />
    </div>
  );
}
