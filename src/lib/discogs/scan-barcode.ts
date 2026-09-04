export type CameraIssue = "unsupported" | "permission" | "missing" | "unknown";

interface BarcodeDetectorInstance {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
  getSupportedFormats?: () => Promise<string[]>;
}

export const PREFERRED_BARCODE_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] as const;

export function cameraIssueFromError(error: unknown): CameraIssue {
  if (typeof error !== "object" || error === null || !("name" in error)) {
    return "unknown";
  }

  const name = String(error.name);

  if (name === "NotAllowedError" || name === "SecurityError") {
    return "permission";
  }

  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "missing";
  }

  return "unknown";
}

export function canRequestCamera(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
}

export function getBarcodeDetector(): BarcodeDetectorConstructor | undefined {
  if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
    return undefined;
  }

  return (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
}

export async function requestBarcodeCamera(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "environment" } },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "OverconstrainedError"
    ) {
      return navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    }

    throw error;
  }
}
