import { NextRequest, NextResponse } from "next/server";

import { fetchDeezerPreview } from "@/lib/deezer/client";
import { isDeezerPreviewUrl } from "@/lib/deezer/preview";
import { DeezerError } from "@/lib/errors";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  const src = request.nextUrl.searchParams.get("src") ?? "";

  if (!isDeezerPreviewUrl(src)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const upstream = await fetchDeezerPreview(src, request.headers.get("range"));
    const headers = new Headers();
    const contentType = upstream.headers.get("content-type")?.trim() || "audio/mpeg";
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "private, max-age=3600");

    const contentLength = upstream.headers.get("content-length");

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    const contentRange = upstream.headers.get("content-range");

    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    const acceptRanges = upstream.headers.get("accept-ranges");

    if (acceptRanges) {
      headers.set("Accept-Ranges", acceptRanges);
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    const status = error instanceof DeezerError ? error.statusCode : 502;
    return new NextResponse(null, { status });
  }
}
