import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// POST: Reveal identity to matched user
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const sessionUser = await getSessionUser(cookieStore);

    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const matchId = body.match_id;
    const revealType = body.reveal_type || "both"; // whatsapp, room, or both

    if (!matchId) {
      return NextResponse.json(
        { error: "Match ID required." },
        { status: 400 }
      );
    }

    if (!["whatsapp", "room", "both"].includes(revealType)) {
      return NextResponse.json(
        { error: "Invalid reveal type. Must be 'whatsapp', 'room', or 'both'." },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Get the match
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: "Match not found." },
        { status: 404 }
      );
    }

    // Verify user is part of this match
    if (match.user_a !== sessionUser.userId && match.user_b !== sessionUser.userId) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 403 }
      );
    }

    // Update reveal flag and type
    const isUserA = match.user_a === sessionUser.userId;
    const revealField = isUserA ? "reveal_a" : "reveal_b";
    const revealTypeField = isUserA ? "reveal_type_a" : "reveal_type_b";

    const { error: updateError } = await supabase
      .from("matches")
      .update({ 
        [revealField]: true,
        [revealTypeField]: revealType
      })
      .eq("id", matchId);

    if (updateError) {
      return NextResponse.json(
        { error: "Could not update reveal status." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

