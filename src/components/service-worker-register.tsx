"use client";

import { useEffect } from "react";

interface ServiceWorkerRegisterProps {
  enabled: boolean;
}

export function ServiceWorkerRegister({ enabled }: ServiceWorkerRegisterProps) {
  useEffect(() => {
    try {
      sessionStorage.removeItem("resonance-boot-handoff");
    } catch {
      // Private mode can block sessionStorage.
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (!enabled) {
      void clearServiceWorker();
      return;
    }

    void navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((registration) => {
        void registration.update();
      })
      .catch(() => undefined);
  }, [enabled]);

  return null;
}

async function clearServiceWorker() {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const registration of registrations) {
      await registration.unregister();
    }

    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith("resonance-")).map((key) => caches.delete(key)),
    );
  } catch {
    return;
  }
}
