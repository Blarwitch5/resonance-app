import { describe, expect, it } from "vitest";

import { safeNextHref, signInHref, signUpHref } from "@/lib/auth-path";

describe("safeNextHref", () => {
  it("falls back to the shelf", () => {
    expect(safeNextHref(undefined)).toBe("/collection");
    expect(safeNextHref(null)).toBe("/collection");
    expect(safeNextHref("")).toBe("/collection");
    expect(safeNextHref("   ")).toBe("/collection");
  });

  it("keeps quiet paths inside Resonance", () => {
    expect(safeNextHref("/collection")).toBe("/collection");
    expect(safeNextHref("/collection/abc?wave=1")).toBe("/collection/abc?wave=1");
    expect(safeNextHref("/explorer?q=Miles")).toBe("/explorer?q=Miles");
    expect(safeNextHref("/explorer/add/123")).toBe("/explorer/add/123");
    expect(safeNextHref("/profile?settings=1")).toBe("/profile?settings=1");
    expect(safeNextHref("/welcome")).toBe("/welcome");
  });

  it("refuses to leave the shelf", () => {
    expect(safeNextHref("https://evil.example/collection")).toBe("/collection");
    expect(safeNextHref("//evil.example")).toBe("/collection");
    expect(safeNextHref("/sign-in")).toBe("/collection");
    expect(safeNextHref("/sign-up")).toBe("/collection");
    expect(safeNextHref("/api/auth/ok")).toBe("/collection");
    expect(safeNextHref("/dev/tokens")).toBe("/collection");
  });
});

describe("signInHref", () => {
  it("stays on sign-in when the shelf is already home", () => {
    expect(signInHref(undefined)).toBe("/sign-in");
    expect(signInHref("/collection")).toBe("/sign-in");
    expect(signInHref("https://evil.example")).toBe("/sign-in");
  });

  it("keeps the listen you were about to hear", () => {
    expect(signInHref("/collection/abc?wave=1")).toBe(
      "/sign-in?next=%2Fcollection%2Fabc%3Fwave%3D1",
    );
    expect(signInHref("/profile?settings=1")).toBe("/sign-in?next=%2Fprofile%3Fsettings%3D1");
    expect(signInHref("/explorer?q=Miles")).toBe("/sign-in?next=%2Fexplorer%3Fq%3DMiles");
  });
});

describe("signUpHref", () => {
  it("stays on sign-up when the shelf is already home", () => {
    expect(signUpHref(undefined)).toBe("/sign-up");
    expect(signUpHref("/collection")).toBe("/sign-up");
    expect(signUpHref("https://evil.example")).toBe("/sign-up");
  });

  it("keeps the listen across the door", () => {
    expect(signUpHref("/collection/abc?wave=1")).toBe(
      "/sign-up?next=%2Fcollection%2Fabc%3Fwave%3D1",
    );
    expect(signUpHref("/profile?settings=1")).toBe("/sign-up?next=%2Fprofile%3Fsettings%3D1");
  });
});
