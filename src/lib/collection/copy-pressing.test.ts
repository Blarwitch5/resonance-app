import { describe, expect, it } from "vitest";

import { pressingCopyVoice } from "@/lib/collection/copy-pressing";

describe("pressingCopyVoice", () => {
  it("names a barcode waiting to be copied", () => {
    expect(pressingCopyVoice("barcode", "07464405791", false)).toEqual({
      ariaLabel: "Copy barcode 07464405791",
      label: "07464405791",
      kind: "Barcode",
      hint: "The code printed on the sleeve.",
      error: "That barcode could not be copied.",
    });
  });

  it("names a catalog number waiting to be copied", () => {
    expect(pressingCopyVoice("catalog", "CL 1355", false)).toEqual({
      ariaLabel: "Copy catalog CL 1355",
      label: "CL 1355",
      kind: "Catalog",
      hint: "The number this pressing wears from its label.",
      error: "That catalog number could not be copied.",
    });
  });

  it("quiets the label after a copy", () => {
    expect(pressingCopyVoice("barcode", "07464405791", true).ariaLabel).toBe("Barcode copied");
    expect(pressingCopyVoice("catalog", "CL 1355", true).ariaLabel).toBe("Catalog copied");
    expect(pressingCopyVoice("catalog", "CL 1355", true).label).toBe("Copied");
  });
});
