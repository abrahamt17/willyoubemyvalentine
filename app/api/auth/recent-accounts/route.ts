import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// GET: Get account details for multiple user IDs (for recent accounts)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdsParam = searchParams.get("user_ids");

    if (!userIdsParam) {
      return NextResponse.json({ error: "User IDs required." }, { status: 400 });
    }

    const userIds = userIdsParam.split(",").filter(id => id.trim());

    if (userIds.length === 0) {
      return NextResponse.json({ accounts: [] });
    }

    const supabase = supabaseServer();

    // Get users who have completed onboarding
    const { data: users, error } = await supabase
      .from("users")
      .select("id, anonymous_name, gender, avatar_url, display_name, created_at")
      .in("id", userIds)
      .not("anonymous_name", "eq", "")
      .not("gender", "is", null)
      .not("whatsapp_number", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recent accounts:", error);
      return NextResponse.json(
        { error: "Could not fetch accounts." },
        { status: 500 }
      );
    }

    return NextResponse.json({ accounts: users || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

