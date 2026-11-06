import { NextResponse } from "next/server";
import { decompressConfig } from "@/lib/compression";
import {
  getAuthenticatedUserIdFromRequest,
  getPagesByOwner,
} from "@/lib/lovely-store";
import { validateLovelyContent } from "@/lib/lovely-schema";

export async function GET(request: Request) {
  const ownerId = await getAuthenticatedUserIdFromRequest(request);

  if (!ownerId) {
    return NextResponse.json(
      { error: "Sign in to view your Lovely pages." },
      { status: 401 },
    );
  }

  try {
    const pages = await getPagesByOwner(ownerId);

    return NextResponse.json(
      {
        pages: pages.map((page) => {
          try {
            const parsed = validateLovelyContent(
              decompressConfig(page.config),
            );

            if (parsed.success) {
              return {
                uid: page.uid,
                recipient: parsed.data.recipient,
                tagline: parsed.data.tagline,
                title: parsed.data.invitation.title,
                updatedAt: page.updatedAt,
              };
            }
          } catch {
            // Fall through to the summary without page copy.
          }

          return {
            uid: page.uid,
            recipient: "",
            tagline: "",
            title: "",
            updatedAt: page.updatedAt,
          };
        }),
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Failed to list Lovely pages", error);
    const migrationRequired =
      error instanceof Error &&
      error.message.includes("Account ownership is not enabled");

    return NextResponse.json(
      {
        error: migrationRequired
          ? error.message
          : "Could not load your Lovely pages right now.",
      },
      { status: migrationRequired ? 503 : 500 },
    );
  }
}
