const BARCODE_DIGITS = /^(?:\d{8}|\d{12,14})$/;

export function normalizeBarcode(value: string): string {
  return value.replace(/\D/g, "");
}

export function isBarcodeQuery(value: string): boolean {
  return BARCODE_DIGITS.test(normalizeBarcode(value));
}
