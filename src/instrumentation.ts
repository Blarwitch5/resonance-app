export function onRequestError(
  error: unknown,
  request: { path: string; method: string },
  context: { routePath: string; routeType: string; renderSource?: string },
): void {
  const message = error instanceof Error ? error.message : String(error);
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;
  const cause =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : undefined;

  console.error("Resonance request error", {
    method: request.method,
    path: request.path,
    route: context.routePath,
    type: context.routeType,
    source: context.renderSource,
    digest,
    message,
    cause,
  });
}
