"use client";

import { PenLine, ScanBarcode, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import { Button, ButtonLink } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { useT } from "@/components/locale-provider";
import {
  PREFERRED_BARCODE_FORMATS,
  cameraIssueFromError,
  canRequestCamera,
  getBarcodeDetector,
  requestBarcodeCamera,
  type CameraIssue,
} from "@/lib/discogs/scan-barcode";

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

interface BarcodeScanDialogProps {
  onClose: () => void;
}

export function BarcodeScanDialog({ onClose }: BarcodeScanDialogProps) {
  const t = useT();
  const router = useRouter();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const zxingStopRef = useRef<(() => void) | null>(null);
  const readingRef = useRef(false);
  const foundRef = useRef(false);
  const ignoreBackdropClose = useRef(false);
  const [hasStream, setHasStream] = useState(false);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [issue, setIssue] = useState<CameraIssue | null>(null);
  const [typedCode, setTypedCode] = useState("");

  const stopCamera = useCallback(() => {
    foundRef.current = false;
    readingRef.current = false;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    zxingStopRef.current?.();
    zxingStopRef.current = null;

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
    onClose();
  }, [onClose, stopCamera]);

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
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      if (!canRequestCamera()) {
        setHasStream(false);
        setIssue("unsupported");
        return;
      }

      try {
        const stream = await requestBarcodeCamera();

        if (cancelled) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          return;
        }

        streamRef.current = stream;
        setHasStream(true);
        setIssue(null);
      } catch (error) {
        if (!cancelled) {
          setHasStream(false);
          setIssue(cameraIssueFromError(error));
        }
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
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
  }, [close]);

  useEffect(() => {
    if (!hasStream || !videoEl) {
      return;
    }

    const previewEl = videoEl;
    const stream = streamRef.current;

    if (!stream) {
      return;
    }

    let cancelled = false;

    previewEl.setAttribute("playsinline", "true");
    previewEl.setAttribute("webkit-playsinline", "true");
    previewEl.muted = true;
    previewEl.srcObject = stream;
    void previewEl.play().catch(() => {
      // iOS can delay play until the element is visible; the decode loop waits.
    });

    async function startNativeLoop(detectorSource: NonNullable<ReturnType<typeof getBarcodeDetector>>) {
      const supported =
        typeof detectorSource.getSupportedFormats === "function"
          ? await detectorSource.getSupportedFormats()
          : [...PREFERRED_BARCODE_FORMATS];
      const formats = PREFERRED_BARCODE_FORMATS.filter((format) => supported.includes(format));
      const detector = new detectorSource(formats.length > 0 ? { formats: [...formats] } : undefined);

      const tick = async () => {
        if (cancelled || foundRef.current) {
          return;
        }

        if (document.hidden || previewEl.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          rafRef.current = requestAnimationFrame(() => {
            void tick();
          });
          return;
        }

        try {
          const detected = await detector.detect(previewEl);
          const value = detected[0]?.rawValue?.trim();

          if (value && value.length > 0) {
            foundRef.current = true;
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
    }

    async function startZxingLoop() {
      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
        import("@zxing/browser"),
        import("@zxing/library"),
      ]);

      if (cancelled || !streamRef.current) {
        return;
      }

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
      ]);
      const reader = new BrowserMultiFormatReader(hints);
      const controls = await reader.decodeFromVideoElement(previewEl, (result) => {
        const text = result?.getText()?.trim();

        if (!text || foundRef.current) {
          return;
        }

        foundRef.current = true;
        goToSearch(text);
      });

      if (cancelled) {
        controls.stop();
        return;
      }

      zxingStopRef.current = () => {
        controls.stop();
      };
    }

    async function startReading() {
      if (readingRef.current) {
        return;
      }

      readingRef.current = true;
      const Detector = getBarcodeDetector();

      try {
        if (Detector) {
          await startNativeLoop(Detector);
          return;
        }

        await startZxingLoop();
      } catch {
        if (!cancelled) {
          stopCamera();
          setHasStream(false);
          setIssue("unsupported");
        }
      }
    }

    void startReading();

    return () => {
      cancelled = true;
      readingRef.current = false;

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      zxingStopRef.current?.();
      zxingStopRef.current = null;
    };
  }, [goToSearch, hasStream, stopCamera, videoEl]);

  function onManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    goToSearch(typedCode);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4 sm:items-center"
      onClick={() => {
        if (ignoreBackdropClose.current) {
          return;
        }

        close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-rs-lg bg-surface-elevated p-5"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={() => {
          ignoreBackdropClose.current = true;
          window.setTimeout(() => {
            ignoreBackdropClose.current = false;
          }, 400);
        }}
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

        {hasStream ? (
          <video
            ref={(node) => {
              videoRef.current = node;
              setVideoEl(node);
            }}
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
            enterKeyHint="search"
            autoComplete="off"
            label={t("explorer.scanType")}
            value={typedCode}
            onChange={(event) => setTypedCode(event.target.value)}
            placeholder="0123456789012"
          />
          <Button type="button" onClick={() => goToSearch(typedCode)}>
            <Search className="size-4 shrink-0" aria-hidden />
            {t("explorer.scanLookup")}
          </Button>
          <p className="text-sm leading-6 text-text-secondary">{t("explorer.noBarcode")}</p>
          <ButtonLink href="/explorer/manual" variant="ghost" className="self-start">
            <PenLine className="size-4 shrink-0" aria-hidden />
            {t("explorer.writeIn")}
          </ButtonLink>
        </form>
      </div>
    </div>,
    document.body,
  );
}
