import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";
import { sanitizeMessage } from "@/lib/validation";
import type { Message } from "@/lib/types";

export const dynamic = 'force-dynamic';

// GET: Get messages for a match
export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const sessionUser = await getSessionUser(cookieStore);

    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("match_id");

    if (!matchId) {
      return NextResponse.json(
        { error: "Match ID required." },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify user is part of this match
    const { data: match } = await supabase
      .from("matches")
      .select("user_a, user_b")
      .eq("id", matchId)
      .single();

    if (!match || (match.user_a !== sessionUser.userId && match.user_b !== sessionUser.userId)) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 403 }
      );
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json(
        { error: "Could not fetch messages." },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

// POST: Send a message
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const sessionUser = await getSessionUser(cookieStore);

    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const matchId = body.match_id;
    const content = sanitizeMessage(body.content);

    if (!matchId || !content) {
      return NextResponse.json(
        { error: "Match ID and message content required." },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify user is part of this match
    const { data: match } = await supabase
      .from("matches")
      .select("user_a, user_b")
      .eq("id", matchId)
      .single();

    if (!match || (match.user_a !== sessionUser.userId && match.user_b !== sessionUser.userId)) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 403 }
      );
    }

    // Create message
    const { data: newMessage, error: insertError } = await supabase
      .from("messages")
      .insert({
        match_id: matchId,
        sender_id: sessionUser.userId,
        content
      })
      .select("*")
      .single<Message>();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Could not send message." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

