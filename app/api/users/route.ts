import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";
import type { User } from "@/lib/types";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionUser = await getSessionUser(cookieStore);

    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const supabase = supabaseServer();

    // Get all users except current user, who have completed onboarding (have anonymous_name)
    const { data: users, error } = await supabase
      .from("users")
      .select("id, anonymous_name, bio, gender, hobbies, created_at")
      .neq("id", sessionUser.userId)
      .neq("anonymous_name", "")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Could not fetch users." },
        { status: 500 }
      );
    }

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

