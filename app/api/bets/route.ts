import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    // Call the postgres function to handle the transaction atomically
    const { data, error } = await supabase.rpc("place_bet", {
      p_user_id: user.id,
      p_market_id: marketId,
      p_game_type: gameType,
      p_number: number,
      p_amount: amount,
    });

    if (error) {
      console.error("Bet placement error:", error);
      // Customize error message for better UX
      if (error.message.includes("Insufficient balance")) {
        return NextResponse.json(
          { error: "Insufficient wallet balance" },
          { status: 400 },
        );
      }
      if (error.message.includes("Market is inactive")) {
        return NextResponse.json(
          { error: "Market is closed for betting" },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Failed to place bet. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      bet: data,
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
