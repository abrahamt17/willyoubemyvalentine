import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { createSession, getSessionUser } from "@/lib/auth";
import { sanitizeInviteCode } from "@/lib/validation";
import type { InviteCode, User } from "@/lib/types";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    
    // Check if user is already logged in
    const existingUser = await getSessionUser(cookieStore);
    if (existingUser) {
      // User already has an account, redirect to dashboard
      return NextResponse.json({ ok: true, alreadyLoggedIn: true });
    }

    const body = await request.json().catch(() => ({}));
    const code = sanitizeInviteCode(body.code);

    if (!code) {
      return NextResponse.json(
        { error: "Invalid invite code format." },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Check if invite code exists (but don't check if it's "used" - codes can be reused!)
    const { data: invite, error: inviteError } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("code", code)
      .single<InviteCode>();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "This invite code is not valid." },
        { status: 400 }
      );
    }

    // Create user minimal profile
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        invite_code_id: invite.id,
        anonymous_name: "",
        display_name: null,
        avatar_url: null,
        bio: null,
        gender: null
      })
      .select("*")
      .single<User>();

    if (userError || !newUser) {
      return NextResponse.json(
        { error: "Could not create user for this invite." },
        { status: 500 }
      );
    }

    // Don't mark the code as "used" - it can be reused by other classmates!
    // Each person gets their own account, but they all use the same code.

    await createSession(newUser.id, cookieStore);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error while validating invite." },
      { status: 500 }
    );
  }
}


