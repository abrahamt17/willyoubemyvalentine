import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = cookies();
    await clearSession(cookieStore);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

