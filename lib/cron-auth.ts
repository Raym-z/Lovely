import "server-only";

import crypto from "node:crypto";

/**
 * Shared check for routes triggered by an external scheduler. Vercel Cron and
 * cron-job.org both send the secret as `Authorization: Bearer <CRON_SECRET>`.
 */
export function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const provided = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}
