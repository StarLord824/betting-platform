import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { marketId, gameType, number, amount } = body;

    if (!marketId || !gameType || !number || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const market = await tx.markets.findUnique({
          where: { id: marketId },
        });

        if (!market) {
          throw new Error("Market not found");
        }

        if (!market.is_active) {
          throw new Error("Market is closed for betting");
        }

        // Server-side time validation: ensure current time is within market hours
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const openTime = market.open_time;
        const closeTime = market.close_time;
        const openMinutes = openTime.getHours() * 60 + openTime.getMinutes();
        const closeMinutes = closeTime.getHours() * 60 + closeTime.getMinutes();

        if (currentMinutes < openMinutes || currentMinutes >= closeMinutes) {
          throw new Error("Market is outside of operating hours");
        }

        const profile = await tx.profiles.update({
          where: { id: user.id },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });

        if (Number(profile.balance) < 0) {
          throw new Error("Insufficient wallet balance");
        }

        const bet = await tx.bets.create({
          data: {
            user_id: user.id,
            market_id: marketId,
            game_type: gameType,
            number: number,
            amount: amount,
            status: "pending",
          },
        });

        return {
          bet_id: bet.id,
          new_balance: Number(profile.balance),
        };
      });

      return NextResponse.json({
        success: true,
        bet: result,
      });
    } catch (error: any) {
      console.error("Bet placement error:", error);

      if (
        error.message.includes("Insufficient wallet balance") ||
        error.message.includes("Market is closed for betting") ||
        error.message.includes("Market is outside of operating hours")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json(
        { error: "Failed to place bet. Please try again." },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
