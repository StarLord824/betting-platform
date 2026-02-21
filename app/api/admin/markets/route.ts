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
    const { id, is_active, action } = body;

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

    // Future expansion: handle 'declare_result' action here

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
