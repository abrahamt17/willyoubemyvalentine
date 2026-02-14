import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";
import type { Match } from "@/lib/types";

export const dynamic = 'force-dynamic';

// GET: Get all matches for current user
export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionUser = await getSessionUser(cookieStore);

    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const supabase = supabaseServer();

    // Get matches where user is user_a or user_b
    const { data: matches, error } = await supabase
      .from("matches")
      .select(`
        id,
        user_a,
        user_b,
        reveal_a,
        reveal_b,
        created_at,
            user_a_data:users!matches_user_a_fkey(id, anonymous_name, display_name, bio, avatar_url, whatsapp_number, room_number, hobbies),
            user_b_data:users!matches_user_b_fkey(id, anonymous_name, display_name, bio, avatar_url, whatsapp_number, room_number, hobbies)
      `)
      .or(`user_a.eq.${sessionUser.userId},user_b.eq.${sessionUser.userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching matches:", error);
      return NextResponse.json(
        { error: "Could not fetch matches." },
        { status: 500 }
      );
    }

    // Format matches to show the other user's info
    const formattedMatches = (matches || []).map((match: any) => {
      const isUserA = match.user_a === sessionUser.userId;
      const otherUser = isUserA ? match.user_b_data : match.user_a_data;
      const myReveal = isUserA ? match.reveal_a : match.reveal_b;
      const theirReveal = isUserA ? match.reveal_b : match.reveal_a;
      const revealType = isUserA ? (match.reveal_type_b || "none") : (match.reveal_type_a || "none");

      return {
        id: match.id,
        other_user: {
          id: otherUser?.id || "",
          anonymous_name: otherUser?.anonymous_name || "",
          display_name: theirReveal ? otherUser?.display_name : null,
          bio: otherUser?.bio || null,
          avatar_url: theirReveal ? otherUser?.avatar_url : null,
          whatsapp_number: (theirReveal && (revealType === "whatsapp" || revealType === "both")) ? (otherUser?.whatsapp_number || null) : null,
          room_number: (theirReveal && (revealType === "room" || revealType === "both")) ? (otherUser?.room_number || null) : null
        },
        my_reveal: myReveal,
        their_reveal: theirReveal,
        created_at: match.created_at
      };
    });

    return NextResponse.json({ matches: formattedMatches });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

