import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionUser = await getSessionUser(cookieStore);

    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    // Check if user has completed onboarding (has anonymous_name and gender)
    const supabase = supabaseServer();
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("anonymous_name, gender, whatsapp_number")
      .eq("id", sessionUser.userId)
      .single();

    // If user doesn't exist or query failed, they haven't completed onboarding
    if (userError || !user) {
      return NextResponse.json({ 
        userId: sessionUser.userId,
        user: null,
        hasCompletedOnboarding: false
      });
    }

    // User has completed onboarding if they have anonymous_name, gender, and whatsapp_number
    const hasCompleted = !!(user.anonymous_name && user.anonymous_name.trim() && user.gender && user.whatsapp_number);

    return NextResponse.json({ 
      userId: sessionUser.userId,
      user: user,
      hasCompletedOnboarding: hasCompleted
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

