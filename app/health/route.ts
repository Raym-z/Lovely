import { NextResponse } from "next/server";
import {
  HealthCheckError,
  HealthConfigurationError,
  runHealthCheck,
} from "@/lib/health";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export const maxDuration = 30;

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const report = await runHealthCheck();

    return NextResponse.json(report, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    if (error instanceof HealthConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof HealthCheckError) {
      console.error("Lovely health check failed", error.message);
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    console.error(
      "Lovely health check failed",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      { error: "Health check could not complete. Check the server logs." },
      { status: 500 },
    );
  }
}
