import { NextResponse } from "next/server";
import {
  deletePageRecord,
  getAuthenticatedUserFromRequest,
  getPage,
  isValidUid,
} from "@/lib/lovely-store";
import { isRegisteredUnverified } from "@/lib/auth-verification";

type RouteContext = {
  params: Promise<{ uid: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUserFromRequest(_request);

  if (!user) {
    return NextResponse.json(
      { error: "Sign in to delete this Lovely." },
      { status: 401 },
    );
  }

  if (isRegisteredUnverified(user)) {
    return NextResponse.json(
      { error: "Verify your email before managing your Lovely pages." },
      { status: 403 },
    );
  }

  const { uid } = await context.params;
  if (!isValidUid(uid)) {
    return NextResponse.json(
      { error: "This Lovely could not be found." },
      { status: 404 },
    );
  }

  try {
    const page = await getPage(uid);

    if (!page) {
      return NextResponse.json(
        { error: "This Lovely could not be found." },
        { status: 404 },
      );
    }

    if (page.ownerId !== user.id) {
      return NextResponse.json(
        { error: "This Lovely belongs to another account." },
        { status: 403 },
      );
    }

    await deletePageRecord(uid);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete Lovely page", error);
    return NextResponse.json(
      { error: "Could not delete this Lovely right now." },
      { status: 500 },
    );
  }
}
