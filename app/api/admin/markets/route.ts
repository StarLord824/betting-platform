import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify Admin Auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

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
      const market = await prisma.markets.update({
        where: { id },
        data: { is_active },
      });

      return NextResponse.json({ success: true, market });
    }

    if (action === "declare_result") {
      if (!winning_number) {
        return NextResponse.json(
          { error: "Winning number is required" },
          { status: 400 },
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Use a transaction for atomic result declaration
      const market = await prisma.$transaction(async (tx) => {
        // 1. Update the market with the winning number and deactivate it
        const updatedMarket = await tx.markets.update({
          where: { id },
          data: {
            today_winning_number: winning_number,
            is_active: false,
          },
        });

        // 2. Mark all today's pending bets for this market as 'lost' by default
        await tx.bets.updateMany({
          where: {
            market_id: id,
            status: "pending",
            created_at: { gte: today },
          },
          data: { status: "lost" },
        });

        // 3. Mark matching bets as 'won'
        await tx.bets.updateMany({
          where: {
            market_id: id,
            status: "lost", // They were just marked lost above
            number: winning_number,
            created_at: { gte: today },
          },
          data: { status: "won" },
        });

        return updatedMarket;
      });

      return NextResponse.json({ success: true, market });
    }

    if (action === "update_times") {
      const updateData: any = {};

      // Prisma DateTime objects need ISO strings, but if the client sends "HH:mm" we can
      // construct a full date object that sets the time portion for Postgres TIME columns
      if (open_time) {
        const [h, m] = open_time.split(":");
        const d = new Date();
        d.setUTCHours(parseInt(h), parseInt(m), 0, 0);
        updateData.open_time = d;
      }
      if (close_time) {
        const [h, m] = close_time.split(":");
        const d = new Date();
        d.setUTCHours(parseInt(h), parseInt(m), 0, 0);
        updateData.close_time = d;
      }

      const market = await prisma.markets.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ success: true, market });
    }

    if (action === "daily_reset") {
      // Reset winning number and reactivate market
      const market = await prisma.markets.update({
        where: { id },
        data: { today_winning_number: null, is_active: true },
      });

      return NextResponse.json({ success: true, market });
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
