import { describe, expect, it } from "vitest";

import { isMainNavActive, sidebarSubNavKind } from "@/components/ui/main-nav";

describe("isMainNavActive", () => {
  it("marks a tab and its nested pages", () => {
    expect(isMainNavActive("/collection", "/collection")).toBe(true);
    expect(isMainNavActive("/collection/abc", "/collection")).toBe(true);
    expect(isMainNavActive("/explorer/add/12", "/explorer")).toBe(true);
    expect(isMainNavActive("/explorer/manual", "/explorer")).toBe(true);
  });

  it("does not light another tab", () => {
    expect(isMainNavActive("/profile", "/collection")).toBe(false);
    expect(isMainNavActive("/explorer", "/collection")).toBe(false);
  });
});

describe("sidebarSubNavKind", () => {
  it("keeps formats under Collection from any room", () => {
    expect(sidebarSubNavKind("/collection")).toBe("collection");
  });

  it("keeps profile listens under Profile from any room", () => {
    expect(sidebarSubNavKind("/profile")).toBe("profile");
  });

  it("does not nest Explorer", () => {
    expect(sidebarSubNavKind("/explorer")).toBeNull();
  });
});
