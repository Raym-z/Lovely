import "server-only";

import {
  getAuthenticatedUserIdFromRequest,
  getPage,
  verifyPageEditKey,
} from "@/lib/lovely-store";

export type ImageAuthorization =
  | {
      ok: true;
      ownerId: string | null;
      pageId: string | null;
      uploaderUserId: string | null;
      method: "owner_session" | "edit_key";
      pageOwnerId: string | null;
    }
  | {
      ok: false;
      status: 401 | 403 | 404;
      error: string;
    };

export async function authorizeImageRequest({
  request,
  pageId,
  editKey,
}: {
  request: Request;
  pageId?: string | null;
  editKey?: string | null;
}): Promise<ImageAuthorization> {
  const uploaderUserId = await getAuthenticatedUserIdFromRequest(request);

  if (!pageId) {
    if (!uploaderUserId) {
      return {
        ok: false,
        status: 401,
        error: "Sign in to manage your photo library.",
      };
    }

    return {
      ok: true,
      ownerId: uploaderUserId,
      pageId: null,
      uploaderUserId,
      method: "owner_session",
      pageOwnerId: null,
    };
  }

  const page = await getPage(pageId);
  if (!page) {
    return {
      ok: false,
      status: 404,
      error: "This Lovely page could not be found.",
    };
  }

  if (uploaderUserId && page.ownerId === uploaderUserId) {
    return {
      ok: true,
      ownerId: page.ownerId,
      pageId,
      uploaderUserId,
      method: "owner_session",
      pageOwnerId: page.ownerId,
    };
  }

  if (editKey) {
    const keyMatchedPage = await verifyPageEditKey(pageId, editKey);
    if (keyMatchedPage) {
      return {
        ok: true,
        ownerId: keyMatchedPage.ownerId,
        pageId,
        uploaderUserId,
        method: "edit_key",
        pageOwnerId: keyMatchedPage.ownerId,
      };
    }
  }

  return {
    ok: false,
    status: 403,
    error: "This page's edit key is not valid.",
  };
}
