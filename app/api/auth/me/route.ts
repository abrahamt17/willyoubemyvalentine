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

    // Check if user has completed onboarding (has anonymous_name)
    const supabase = supabaseServer();
    const { data: user } = await supabase
      .from("users")
      .select("anonymous_name")
      .eq("id", sessionUser.userId)
      .single();

    return NextResponse.json({ 
      userId: sessionUser.userId,
      user: user,
      hasCompletedOnboarding: !!user?.anonymous_name
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

