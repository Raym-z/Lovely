import { NextResponse } from "next/server";
import {
  getAuthenticatedUserFromRequest,
  getSupabaseAdminClient,
  getUserFromAccessToken,
} from "@/lib/lovely-store";

type TransferResult = {
  status:
    | "completed"
    | "already_completed"
    | "nothing_to_transfer"
    | "noop";
  pages: number;
  images: number;
  destination_user_uid?: string;
};

function errorStatus(message: string) {
  if (
    message.includes("GUEST_ALREADY_TRANSFERRED") ||
    message.includes("SOURCE_NOT_ANONYMOUS") ||
    message.includes("DESTINATION_ANONYMOUS")
  ) {
    return 409;
  }

  if (
    message.includes("INVALID_IDENTITIES") ||
    message.includes("SAME_IDENTITY")
  ) {
    return 400;
  }

  return 500;
}

export async function POST(request: Request) {
  const destinationUser = await getAuthenticatedUserFromRequest(request);

  if (!destinationUser) {
    return NextResponse.json(
      { error: "Sign in to the account that should receive the pages." },
      { status: 401 },
    );
  }

  if (destinationUser.is_anonymous) {
    return NextResponse.json(
      { error: "Sign in to a permanent account to receive the guest pages." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid transfer request." },
      { status: 400 },
    );
  }

  const guestAccessToken = (
    body as { guestAccessToken?: unknown } | null
  )?.guestAccessToken;

  if (typeof guestAccessToken !== "string" || !guestAccessToken) {
    return NextResponse.json(
      { error: "The original guest session is missing." },
      { status: 400 },
    );
  }

  const guestUser = await getUserFromAccessToken(guestAccessToken);

  if (!guestUser) {
    return NextResponse.json(
      {
        error:
          "The original guest session has expired. Use the page's edit key to recover it.",
      },
      { status: 401 },
    );
  }

  if (!guestUser.is_anonymous) {
    return NextResponse.json(
      { error: "Only data owned by an anonymous guest can be transferred." },
      { status: 403 },
    );
  }

  if (guestUser.id === destinationUser.id) {
    return NextResponse.json({
      status: "noop",
      pages: 0,
      images: 0,
      destination_user_uid: destinationUser.id,
    } satisfies TransferResult);
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Ownership transfer is not configured." },
      { status: 503 },
    );
  }

  try {
    const { data, error } = await supabase.rpc("transfer_guest_ownership", {
      p_source_guest: guestUser.id,
      p_destination_user: destinationUser.id,
    });

    if (error) {
      console.error("Guest ownership transfer failed", error.message);
      return NextResponse.json(
        {
          error:
            error.message.includes("GUEST_ALREADY_TRANSFERRED")
              ? "This guest data has already been moved to another account."
              : error.message.includes("SOURCE_NOT_ANONYMOUS")
                ? "This guest account has already been upgraded."
                : "Could not move the guest pages to this account yet.",
        },
        { status: errorStatus(error.message) },
      );
    }

    return NextResponse.json((data ?? {
      status: "nothing_to_transfer",
      pages: 0,
      images: 0,
      destination_user_uid: destinationUser.id,
    }) as TransferResult);
  } catch (error) {
    console.error("Guest ownership transfer failed", error);
    return NextResponse.json(
      { error: "Could not move the guest pages to this account yet." },
      { status: 500 },
    );
  }
}
