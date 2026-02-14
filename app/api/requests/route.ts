import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";
import type { Request as RequestType } from "@/lib/types";

export const dynamic = 'force-dynamic';

// GET: Get all requests (sent and received)
export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionUser = await getSessionUser(cookieStore);

    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const supabase = supabaseServer();

    // Get requests sent by current user
    const { data: sentRequests, error: sentError } = await supabase
      .from("requests")
      .select(`
        id,
        receiver_id,
        status,
        created_at,
        receiver:users!requests_receiver_id_fkey(id, anonymous_name, bio)
      `)
      .eq("sender_id", sessionUser.userId)
      .order("created_at", { ascending: false });

    // Get requests received by current user
    const { data: receivedRequests, error: receivedError } = await supabase
      .from("requests")
      .select(`
        id,
        sender_id,
        status,
        created_at,
        sender:users!requests_sender_id_fkey(id, anonymous_name, bio)
      `)
      .eq("receiver_id", sessionUser.userId)
      .order("created_at", { ascending: false });

    if (sentError || receivedError) {
      console.error("Error fetching requests:", sentError || receivedError);
      return NextResponse.json(
        { error: "Could not fetch requests." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sent: sentRequests || [],
      received: receivedRequests || []
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

// POST: Send a request to another user
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const sessionUser = await getSessionUser(cookieStore);

    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const receiverId = body.receiver_id;

    if (!receiverId || receiverId === sessionUser.userId) {
      return NextResponse.json(
        { error: "Invalid receiver ID." },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Check if request already exists
    const { data: existing } = await supabase
      .from("requests")
      .select("id, status")
      .eq("sender_id", sessionUser.userId)
      .eq("receiver_id", receiverId)
      .single();

    if (existing) {
      if (existing.status === "cancelled") {
        // Reactivate cancelled request
        const { error: updateError } = await supabase
          .from("requests")
          .update({ status: "pending" })
          .eq("id", existing.id);

        if (updateError) {
          return NextResponse.json(
            { error: "Could not send request." },
            { status: 500 }
          );
        }
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json(
        { error: "Request already sent." },
        { status: 400 }
      );
    }

    // Check if there's a reverse request (mutual match!)
    const { data: reverseRequest } = await supabase
      .from("requests")
      .select("id")
      .eq("sender_id", receiverId)
      .eq("receiver_id", sessionUser.userId)
      .eq("status", "pending")
      .single();

    // Create new request
    const { data: newRequest, error: insertError } = await supabase
      .from("requests")
      .insert({
        sender_id: sessionUser.userId,
        receiver_id: receiverId,
        status: "pending"
      })
      .select("*")
      .single<RequestType>();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Could not send request." },
        { status: 500 }
      );
    }

    // If reverse request exists, create a match!
    if (reverseRequest) {
      // Update both requests to "matched"
      await supabase
        .from("requests")
        .update({ status: "matched" })
        .in("id", [newRequest.id, reverseRequest.id]);

      // Create match (ensure user_a < user_b for consistency)
      const [userA, userB] = [sessionUser.userId, receiverId].sort();
      const { error: matchError } = await supabase
        .from("matches")
        .insert({
          user_a: userA,
          user_b: userB,
          reveal_a: false,
          reveal_b: false
        });

      if (matchError) {
        console.error("Match creation error:", matchError);
        // Continue anyway - request was sent
      }
    }

    return NextResponse.json({ ok: true, matched: !!reverseRequest });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

// DELETE: Cancel a request
export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies();
    const sessionUser = await getSessionUser(cookieStore);

    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("id");

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID required." },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Only allow cancelling requests sent by current user
    const { error } = await supabase
      .from("requests")
      .update({ status: "cancelled" })
      .eq("id", requestId)
      .eq("sender_id", sessionUser.userId)
      .eq("status", "pending");

    if (error) {
      return NextResponse.json(
        { error: "Could not cancel request." },
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

