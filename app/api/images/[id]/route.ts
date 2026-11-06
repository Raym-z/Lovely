import { NextResponse } from "next/server";
import { deleteOwnedImage } from "@/lib/image-store";
import { getAuthenticatedUserIdFromRequest } from "@/lib/lovely-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const ownerId = await getAuthenticatedUserIdFromRequest(request);

  if (!ownerId) {
    return NextResponse.json(
      { error: "Sign in to delete a photo from your library." },
      { status: 401 },
    );
  }

  try {
    const result = await deleteOwnedImage(ownerId, id);

    if (!result.ok) {
      if (result.reason === "not_found") {
        return NextResponse.json(
          { error: "That photo could not be found." },
          { status: 404 },
        );
      }

      if (result.reason === "forbidden") {
        return NextResponse.json(
          { error: "That photo belongs to another account." },
          { status: 403 },
        );
      }

      if (result.reason === "in_use") {
        return NextResponse.json(
          {
            error: `This photo is still used in ${result.references} place${
              result.references === 1 ? "" : "s"
            }. Remove it from those stories first.`,
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Photo storage is not configured." },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete Lovely image", error);
    return NextResponse.json(
      { error: "Could not delete this photo right now." },
      { status: 500 },
    );
  }
}
