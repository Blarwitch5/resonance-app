"use client";

import { ScanBarcode, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { useT } from "@/components/locale-provider";

type CameraIssue = "unsupported" | "permission" | "missing" | "unknown";

interface DetectedBarcode {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect: (source: ImageBitmapSource) => Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
  getSupportedFormats?: () => Promise<string[]>;
}

const PREFERRED_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"];

function getBarcodeDetector(): BarcodeDetectorConstructor | undefined {
  if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
    return undefined;
  }

  return (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
}

function cameraIssueFromError(error: unknown): CameraIssue {
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

function cameraIssueCopy(issue: CameraIssue, t: (path: string) => string): string {
  if (issue === "unsupported") {
    return t("explorer.scanUnsupported");
  }

  if (issue === "permission") {
    return t("explorer.scanPermission");
  }

  if (issue === "missing") {
    return t("explorer.scanMissing");
  }

  return t("explorer.scanUnknown");
}

export function BarcodeScanner() {
  const t = useT();
  const router = useRouter();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [issue, setIssue] = useState<CameraIssue | null>(null);
  const [typedCode, setTypedCode] = useState("");

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;

    const video = videoRef.current;

    if (video) {
      video.srcObject = null;
    }
  }, []);

  const close = useCallback(() => {
    stopCamera();
    setIsOpen(false);
    setIssue(null);
    setTypedCode("");
  }, [stopCamera]);

  const goToSearch = useCallback(
    (code: string) => {
      const trimmed = code.trim();

      if (trimmed.length === 0) {
        return;
      }

      close();
      router.push(`/explorer?q=${encodeURIComponent(trimmed)}`);
    },
    [close, router],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((node) => !node.hasAttribute("disabled"));

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;

      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    };
  }, [close, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    async function startCamera() {
      const Detector = getBarcodeDetector();

      if (!Detector) {
        setIssue("unsupported");
        return;
      }

      try {
        const supported =
          typeof Detector.getSupportedFormats === "function"
            ? await Detector.getSupportedFormats()
            : PREFERRED_FORMATS;
        const formats = PREFERRED_FORMATS.filter((format) => supported.includes(format));
        const detector = new Detector(formats.length > 0 ? { formats } : undefined);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;

        if (!video) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          return;
        }

        video.srcObject = stream;
        await video.play();

        const tick = async () => {
          if (cancelled || document.hidden || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            if (!cancelled) {
              rafRef.current = requestAnimationFrame(() => {
                void tick();
              });
            }
            return;
          }

          try {
            const detected = await detector.detect(video);
            const value = detected[0]?.rawValue?.trim();

            if (value && value.length > 0) {
              goToSearch(value);
              return;
            }
          } catch {
            // Frame skipped — keep listening.
          }

          if (!cancelled) {
            rafRef.current = requestAnimationFrame(() => {
              void tick();
            });
          }
        };

        rafRef.current = requestAnimationFrame(() => {
          void tick();
        });
      } catch (error) {
        if (!cancelled) {
          setIssue(cameraIssueFromError(error));
        }
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [goToSearch, isOpen, stopCamera]);

  function onManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToSearch(typedCode);
  }

  const dialog =
    isOpen && isMounted
      ? createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4 sm:items-center">
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              aria-label={t("explorer.scanClose")}
              onClick={close}
            />
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative z-10 w-full max-w-md rounded-rs-lg bg-surface-elevated p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 id={titleId} className="flex items-center gap-2 text-lg font-semibold text-text">
                  <ScanBarcode className="size-5 shrink-0 text-text-secondary" aria-hidden />
                  {t("explorer.scanTitle")}
                </h2>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  aria-label={t("common.close")}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary outline-none hover:bg-surface-pressed hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              {issue === null ? (
                <video
                  ref={videoRef}
                  className="mt-4 aspect-3/4 max-h-[50vh] w-full rounded-rs-sm bg-surface-pressed object-cover"
                  playsInline
                  muted
                  autoPlay
                />
              ) : null}

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {issue ? cameraIssueCopy(issue, t) : t("explorer.scanHold")}
              </p>

              <form onSubmit={onManualSubmit} className="mt-4 flex flex-col gap-3">
                <TextField
                  id="typed-barcode"
                  name="barcode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  label={t("explorer.scanType")}
                  value={typedCode}
                  onChange={(event) => setTypedCode(event.target.value)}
                  placeholder="0123456789012"
                />
                <Button type="submit">
                  <Search className="size-4 shrink-0" aria-hidden />
                  {t("explorer.scanLookup")}
                </Button>
              </form>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className="min-w-12 shrink-0 gap-2 px-4"
        aria-label={t("explorer.scanAria")}
        onClick={() => setIsOpen(true)}
      >
        <ScanBarcode className="size-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">{t("explorer.scan")}</span>
      </Button>
      {dialog}
    </>
  );
}
