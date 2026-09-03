"use client";

import { Share, Smartphone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

const DISMISS_KEY = "resonance-install-dismissed";
const MOBILE_QUERY = "(max-width: 1023px)";
const HINT_PATHS = new Set(["/collection", "/profile"]);

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface SafariNavigator extends Navigator {
  standalone?: boolean;
}

interface InstallEnvironment {
  isMobile: boolean;
  isStandalone: boolean;
  isIos: boolean;
  wasDismissed: boolean;
}

const SERVER_ENVIRONMENT: InstallEnvironment = {
  isMobile: false,
  isStandalone: true,
  isIos: false,
  wasDismissed: true,
};

let environmentCache: InstallEnvironment = SERVER_ENVIRONMENT;

function isStandaloneDisplay(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }

  if (window.matchMedia("(display-mode: fullscreen)").matches) {
    return true;
  }

  return Boolean((navigator as SafariNavigator).standalone);
}

function isIosDevice(): boolean {
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return true;
  }

  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function readDismissed(storage: Storage): boolean {
  try {
    return storage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function isDismissed(): boolean {
  try {
    return readDismissed(localStorage) || readDismissed(sessionStorage);
  } catch {
    return false;
  }
}

function persistDismiss(): void {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      return;
    }
  }
}

function readInstallEnvironment(): InstallEnvironment {
  const next: InstallEnvironment = {
    isMobile: window.matchMedia(MOBILE_QUERY).matches,
    isStandalone: isStandaloneDisplay(),
    isIos: isIosDevice(),
    wasDismissed: isDismissed(),
  };

  if (
    environmentCache.isMobile === next.isMobile &&
    environmentCache.isStandalone === next.isStandalone &&
    environmentCache.isIos === next.isIos &&
    environmentCache.wasDismissed === next.wasDismissed
  ) {
    return environmentCache;
  }

  environmentCache = next;
  return next;
}

function subscribeToInstallEnvironment(onStoreChange: () => void): () => void {
  const mobile = window.matchMedia(MOBILE_QUERY);
  const standalone = window.matchMedia("(display-mode: standalone)");
  const fullscreen = window.matchMedia("(display-mode: fullscreen)");

  mobile.addEventListener("change", onStoreChange);
  standalone.addEventListener("change", onStoreChange);
  fullscreen.addEventListener("change", onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    mobile.removeEventListener("change", onStoreChange);
    standalone.removeEventListener("change", onStoreChange);
    fullscreen.removeEventListener("change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function isBeforeInstallPromptEvent(event: Event): event is BeforeInstallPromptEvent {
  return "prompt" in event && typeof (event as BeforeInstallPromptEvent).prompt === "function";
}

export function InstallHint() {
  const t = useT();
  const pathname = usePathname();
  const titleId = useId();
  const environment = useSyncExternalStore(
    subscribeToInstallEnvironment,
    readInstallEnvironment,
    () => SERVER_ENVIRONMENT,
  );
  const [didDismiss, setDidDismiss] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPrompting, setIsPrompting] = useState(false);

  const dismiss = useCallback(() => {
    persistDismiss();
    setDidDismiss(true);
    setInstallPrompt(null);
  }, []);

  useEffect(() => {
    function onBeforeInstall(event: Event) {
      if (!isBeforeInstallPromptEvent(event)) {
        return;
      }

      event.preventDefault();
      setInstallPrompt(event);
    }

    function onInstalled() {
      persistDismiss();
      setDidDismiss(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function keepOnHomeScreen() {
    if (!installPrompt || isPrompting) {
      return;
    }

    setIsPrompting(true);

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      dismiss();
    } catch {
      dismiss();
    } finally {
      setIsPrompting(false);
    }
  }

  const canShowPath = HINT_PATHS.has(pathname);
  const canOfferInstall = environment.isIos || installPrompt !== null;
  const isVisible =
    environment.isMobile &&
    !environment.isStandalone &&
    !environment.wasDismissed &&
    !didDismiss &&
    canShowPath &&
    canOfferInstall;

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className="h-28 shrink-0 lg:hidden" aria-hidden />
      <aside
        className="fixed right-20 bottom-[calc(var(--rs-bottom-chrome)+max(0.75rem,env(safe-area-inset-bottom)))] left-4 z-30 rounded-rs-md border border-border bg-surface-elevated p-4 lg:hidden"
        aria-labelledby={titleId}
      >
        <div className="flex items-start gap-3">
          {environment.isIos ? (
            <Share className="mt-0.5 size-5 shrink-0 text-text-secondary" aria-hidden />
          ) : (
            <Smartphone className="mt-0.5 size-5 shrink-0 text-text-secondary" aria-hidden />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p id={titleId} className="text-sm font-semibold text-text">
              {t("install.title")}
            </p>
            <p className="text-sm leading-6 text-text-secondary">
              {environment.isIos ? t("install.ios") : t("install.android")}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("common.dismiss")}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary outline-none hover:bg-surface-pressed hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {environment.isIos ? null : (
          <Button
            type="button"
            className="mt-3 w-full min-h-11 px-4 text-sm"
            disabled={isPrompting}
            onClick={() => {
              void keepOnHomeScreen();
            }}
          >
            {t("install.keepHere")}
          </Button>
        )}
      </aside>
    </>
  );
}
