import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { getSessionUser, createSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET: Get all accounts for a user (by anonymous_name and gender)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const anonymousName = searchParams.get("anonymous_name");
    const gender = searchParams.get("gender");

    if (!anonymousName || !gender) {
      return NextResponse.json({ error: "Anonymous name and gender required." }, { status: 400 });
    }

    const supabase = supabaseServer();

    // Find users matching the anonymous name and gender
    const { data: users, error } = await supabase
      .from("users")
      .select("id, anonymous_name, gender, created_at")
      .eq("anonymous_name", anonymousName.trim())
      .eq("gender", gender)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching accounts:", error);
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

// POST: Login to an existing account
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const body = await request.json().catch(() => ({}));
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required." },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify user exists
    const { data: user, error } = await supabase
      .from("users")
      .select("id, anonymous_name, gender")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    // Create session for this user
    await createSession(userId, cookieStore);

    return NextResponse.json({ 
      ok: true,
      user: {
        id: user.id,
        anonymous_name: user.anonymous_name,
        gender: user.gender
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

