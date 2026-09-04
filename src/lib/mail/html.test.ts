import { describe, expect, it } from "vitest";

import { escapeHtml } from "@/lib/mail/html";

describe("escapeHtml", () => {
  it("keeps a quiet name intact", () => {
    expect(escapeHtml("Miles")).toBe("Miles");
  });

  it("does not let markup through", () => {
    expect(escapeHtml(`<a href="https://evil.example">x</a>`)).toBe(
      "&lt;a href=&quot;https://evil.example&quot;&gt;x&lt;/a&gt;",
    );
  });
});
