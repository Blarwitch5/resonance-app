"use client";

import { ScanBarcode } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { BarcodeScanDialog } from "@/app/explorer/barcode-scan-dialog";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

const BarcodeScanContext = createContext<(() => void) | null>(null);

export function useBarcodeScan(): () => void {
  const open = useContext(BarcodeScanContext);

  if (!open) {
    throw new Error("BarcodeScanProvider is missing.");
  }

  return open;
}

export function BarcodeScanProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <BarcodeScanContext.Provider value={open}>
      {children}
      {isOpen ? <BarcodeScanDialog onClose={close} /> : null}
    </BarcodeScanContext.Provider>
  );
}

export function BarcodeScanButton() {
  const t = useT();
  const open = useBarcodeScan();

  return (
    <Button
      type="button"
      variant="ghost"
      className="min-w-12 shrink-0 gap-2 px-4"
      aria-label={t("explorer.scanAria")}
      onClick={open}
    >
      <ScanBarcode className="size-4 shrink-0" aria-hidden />
      <span className="hidden sm:inline">{t("explorer.scan")}</span>
    </Button>
  );
}
