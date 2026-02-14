import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";
import { sanitizeProfile, sanitizeWhatsAppNumber } from "@/lib/validation";

export const dynamic = 'force-dynamic';

// GET: Get current user's profile
export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionUser = await getSessionUser(cookieStore);

    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const supabase = supabaseServer();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", sessionUser.userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Could not fetch profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

// POST: Update profile
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const sessionUser = await getSessionUser(cookieStore);

    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const sanitized = sanitizeProfile({
      anonymous_name: body.anonymous_name,
      bio: body.bio,
      gender: body.gender
    });

    if (!sanitized.anonymous_name) {
      return NextResponse.json(
        { error: "Anonymous name is required." },
        { status: 400 }
      );
    }

    // Validate gender is required and must be Male or Female
    if (!sanitized.gender || (sanitized.gender !== "Male" && sanitized.gender !== "Female")) {
      return NextResponse.json(
        { error: "Gender is required and must be Male or Female." },
        { status: 400 }
      );
    }

    // Sanitize and validate WhatsApp number
    const whatsappNumber = sanitizeWhatsAppNumber(body.whatsapp_number);
    
    // Get current user data
    const { data: currentUser } = await supabaseServer()
      .from("users")
      .select("whatsapp_number")
      .eq("id", sessionUser.userId)
      .single();

    const isOnboarding = !currentUser?.whatsapp_number;
    
    // WhatsApp number is required during onboarding
    if (isOnboarding && !whatsappNumber) {
      return NextResponse.json(
        { error: "WhatsApp number is required." },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Sanitize room number
    const roomNumber = typeof body.room_number === "string" ? body.room_number.trim().slice(0, 20) : null;

    // Check room number limit (max 2 people per room)
    if (roomNumber) {
      const { count, error: countError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("room_number", roomNumber)
        .neq("id", sessionUser.userId);

      // If there's a database error, just log it and continue (don't block the user)
      if (countError) {
        console.error("Error checking room number:", countError);
        // Continue anyway - allow the room number to be set
      } else if (count && count >= 2) {
        // Only block if we successfully checked and found 2+ people
        return NextResponse.json(
          { error: "This room is already occupied by 2 people. Rooms are shared by maximum 2 people." },
          { status: 400 }
        );
      }
    }

    // Validate and sanitize hobbies
    let hobbiesArray: string[] = [];
    if (Array.isArray(body.hobbies)) {
      hobbiesArray = body.hobbies
        .filter((h: any) => typeof h === "string" && h.trim().length > 0)
        .map((h: string) => h.trim())
        .slice(0, 20); // Max 20 hobbies
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        anonymous_name: sanitized.anonymous_name,
        bio: sanitized.bio,
        gender: sanitized.gender,
        display_name: body.display_name || null,
        avatar_url: body.avatar_url || null,
        whatsapp_number: whatsappNumber || null,
        room_number: roomNumber || null,
        hobbies: hobbiesArray.length > 0 ? hobbiesArray : null
      })
      .eq("id", sessionUser.userId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Could not update profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error while updating profile." },
      { status: 500 }
    );
  }
}
