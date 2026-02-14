import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionUser = await getSessionUser(cookieStore);

    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const supabase = supabaseServer();

    // Get pending requests count (requests sent to current user)
    const { count: pendingRequestsCount } = await supabase
      .from("requests")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", sessionUser.userId)
      .eq("status", "pending");

    // Get unread messages count (messages in matches where user is not the sender)
    // We'll count messages from the last 24 hours that the user hasn't seen
    const { data: matches } = await supabase
      .from("matches")
      .select("id")
      .or(`user_a.eq.${sessionUser.userId},user_b.eq.${sessionUser.userId}`);

    const matchIds = (matches || []).map((m: any) => m.id);
    
    let unreadMessagesCount = 0;
    if (matchIds.length > 0) {
      // Count messages from other users in the last 24 hours
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("match_id", matchIds)
        .neq("sender_id", sessionUser.userId)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      unreadMessagesCount = count || 0;
    }

    // Get new matches count (matches created in last 24 hours)
    const { count: newMatchesCount } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .or(`user_a.eq.${sessionUser.userId},user_b.eq.${sessionUser.userId}`)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    return NextResponse.json({
      pendingRequests: pendingRequestsCount || 0,
      unreadMessages: unreadMessagesCount,
      newMatches: newMatchesCount || 0
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

