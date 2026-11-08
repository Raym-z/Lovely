import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/lovely-store";

const USER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WATCH_TOKEN_PATTERN = /^[0-9a-f]{64}$/i;

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, max-age=0",
  };
}

function matches(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid verification request." },
      { status: 400, headers: noStoreHeaders() },
    );
  }

  const userId = (body as { userId?: unknown } | null)?.userId;
  const watchToken = (body as { watchToken?: unknown } | null)?.watchToken;

  if (
    typeof userId !== "string" ||
    !USER_ID_PATTERN.test(userId) ||
    typeof watchToken !== "string" ||
    !WATCH_TOKEN_PATTERN.test(watchToken)
  ) {
    return NextResponse.json(
      { error: "This verification check could not be found." },
      { status: 404, headers: noStoreHeaders() },
    );
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Verification checks are not configured." },
      { status: 503, headers: noStoreHeaders() },
    );
  }

  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    const user = data.user;
    const storedWatch = user?.user_metadata?.lovely_email_watch;

    if (
      error ||
      !user ||
      typeof storedWatch !== "string" ||
      !matches(storedWatch, watchToken)
    ) {
      return NextResponse.json(
        { error: "This verification check could not be found." },
        { status: 404, headers: noStoreHeaders() },
      );
    }

    return NextResponse.json(
      {
        verified: Boolean(
          !user.is_anonymous &&
          (user.email_confirmed_at || user.confirmed_at),
        ),
      },
      { headers: noStoreHeaders() },
    );
  } catch (verificationError) {
    console.error("Failed to check email verification status", verificationError);
    return NextResponse.json(
      { error: "Could not check the verification status right now." },
      { status: 500, headers: noStoreHeaders() },
    );
  }
}
