import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify Admin Auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Parse Request
    const body = await request.json();
    const { id, is_active, action, winning_number, open_time, close_time } =
      body;

    if (!id)
      return NextResponse.json(
        { error: "Market ID required" },
        { status: 400 },
      );

    // 3. Handle Actions
    if (action === "toggle_status") {
      const { data, error } = await supabase
        .from("markets")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, market: data });
    }

    if (action === "declare_result") {
      if (!winning_number) {
        return NextResponse.json(
          { error: "Winning number is required" },
          { status: 400 },
        );
      }

      // 1. Update the market with the winning number and deactivate it
      const { data: market, error: marketError } = await supabase
        .from("markets")
        .update({
          today_winning_number: winning_number,
          is_active: false,
        })
        .eq("id", id)
        .select()
        .single();

      if (marketError) throw marketError;

      // 2. Mark all today's pending bets for this market as 'lost' by default
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { error: lostError } = await supabase
        .from("bets")
        .update({ status: "lost" })
        .eq("market_id", id)
        .eq("status", "pending")
        .gte("created_at", today.toISOString());

      if (lostError) console.error("Failed to mark losing bets:", lostError);

      // 3. Mark matching bets as 'won'
      // For single_digit bets, the winning number's last digit matches
      // For other types, exact number match
      const { error: wonError } = await supabase
        .from("bets")
        .update({ status: "won" })
        .eq("market_id", id)
        .eq("number", winning_number)
        .eq("status", "lost")
        .gte("created_at", today.toISOString());

      if (wonError) console.error("Failed to mark winning bets:", wonError);

      return NextResponse.json({ success: true, market });
    }

    if (action === "update_times") {
      const updateData: any = {};
      if (open_time) updateData.open_time = open_time;
      if (close_time) updateData.close_time = close_time;

      const { data, error } = await supabase
        .from("markets")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, market: data });
    }

    if (action === "daily_reset") {
      // Reset winning number and reactivate market
      const { data, error } = await supabase
        .from("markets")
        .update({ today_winning_number: null, is_active: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, market: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
