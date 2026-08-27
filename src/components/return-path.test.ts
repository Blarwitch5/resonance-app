import { describe, expect, it } from "vitest";

import {
  hrefPathname,
  isReturnPath,
  listBackHref,
  listBackLabel,
  listPathForDetail,
  listReturnFromLocation,
  parseStoredReturn,
  resolvedBackHref,
  returnStorageKey,
  withListReturn,
  detailBackHref,
  mainNavHref,
} from "@/components/return-path";

describe("return path", () => {
  it("only remembers Collection, Explorer, and Profile lists", () => {
    expect(isReturnPath("/collection")).toBe(true);
    expect(isReturnPath("/explorer")).toBe(true);
    expect(isReturnPath("/profile")).toBe(true);
    expect(isReturnPath("/collection/abc")).toBe(false);
    expect(returnStorageKey("/collection")).toBe("resonance-return:/collection");
  });

  it("keeps a stored list href on the same path", () => {
    expect(parseStoredReturn("/collection", "/collection?q=Miles")).toBe("/collection?q=Miles");
    expect(parseStoredReturn("/collection", "/collection")).toBe("/collection");
    expect(parseStoredReturn("/collection", "/explorer?q=Miles")).toBeNull();
    expect(parseStoredReturn("/profile", "/profile?tab=close")).toBe("/profile?tab=close");
    expect(parseStoredReturn("/profile", "/profile")).toBe("/profile");
    expect(parseStoredReturn("/profile", "/collection?q=Miles")).toBeNull();
    expect(parseStoredReturn("/collection", "https://evil.example/collection")).toBeNull();
    expect(parseStoredReturn("/collection", "//evil.example")).toBeNull();
  });

  it("maps a journal or confirm page back to its list", () => {
    expect(listPathForDetail("/collection/abc")).toBe("/collection");
    expect(listPathForDetail("/explorer/add/123")).toBe("/explorer");
    expect(listPathForDetail("/collection")).toBeNull();
    expect(listPathForDetail("/profile")).toBeNull();
  });

  it("reads a local pathname from an href", () => {
    expect(hrefPathname("/collection?q=Miles")).toBe("/collection");
    expect(hrefPathname("https://example.com/collection")).toBeNull();
    expect(hrefPathname("//example.com")).toBeNull();
  });

  it("prefers an explicit list href over a stored one", () => {
    expect(resolvedBackHref("/explorer?q=Nirvana", "/explorer?q=old")).toBe("/explorer?q=Nirvana");
    expect(resolvedBackHref("/explorer", "/explorer?q=Miles")).toBe("/explorer?q=Miles");
    expect(resolvedBackHref("/explorer", null)).toBe("/explorer");
  });

  it("carries a list listen onto a journal or confirm page", () => {
    expect(withListReturn("/collection/abc", "/explorer?q=Nirvana")).toBe(
      "/collection/abc?from=%2Fexplorer%3Fq%3DNirvana",
    );
    expect(withListReturn("/collection/abc?wave=1", "/explorer?q=Nirvana")).toBe(
      "/collection/abc?wave=1&from=%2Fexplorer%3Fq%3DNirvana",
    );
    expect(withListReturn("/collection/abc", "https://evil.example")).toBe("/collection/abc");
    expect(withListReturn("/collection/abc", "/collection")).toBe("/collection/abc");
    expect(withListReturn("/collection/abc", "/explorer")).toBe("/collection/abc?from=%2Fexplorer");
    expect(withListReturn("/collection/abc", "/collection?q=Miles")).toBe(
      "/collection/abc?from=%2Fcollection%3Fq%3DMiles",
    );
    expect(withListReturn("/collection/abc", "/profile")).toBe("/collection/abc?from=%2Fprofile");
    expect(withListReturn("/collection/abc", "/profile?tab=waiting&q=Blue")).toBe(
      "/collection/abc?from=%2Fprofile%3Ftab%3Dwaiting%26q%3DBlue",
    );
  });

  it("names the list waiting behind a detail page", () => {
    expect(listBackHref("/explorer?q=Nirvana", "/collection")).toBe("/explorer?q=Nirvana");
    expect(listBackHref(undefined, "/collection")).toBe("/collection");
    expect(listBackLabel("/explorer?q=Nirvana")).toBe("Back to Explorer");
    expect(listBackLabel("/collection")).toBe("Back to Collection");
    expect(listBackLabel("/profile?tab=close")).toBe("Back to Profile");
  });

  it("follows from= off a journal or confirm page", () => {
    expect(detailBackHref("/collection/abc", "?from=%2Fexplorer%3Fq%3DNirvana")).toBe("/explorer?q=Nirvana");
    expect(detailBackHref("/explorer/add/123", "?from=%2Fexplorer%3Fq%3DNirvana")).toBe(
      "/explorer?q=Nirvana",
    );
    expect(detailBackHref("/collection/abc", "?from=%2Fprofile%3Ftab%3Dclose")).toBe("/profile?tab=close");
  });
});

describe("listReturnFromLocation", () => {
  it("hears the list you are already on", () => {
    expect(listReturnFromLocation("/explorer", "q=Nirvana")).toBe("/explorer?q=Nirvana");
    expect(listReturnFromLocation("/collection", "q=Miles")).toBe("/collection?q=Miles");
    expect(listReturnFromLocation("/profile", "tab=waiting")).toBe("/profile?tab=waiting");
    expect(listReturnFromLocation("/explorer", "")).toBe("/explorer");
  });

  it("lets go of a journal, a setting sheet, and a smuggled from", () => {
    expect(listReturnFromLocation("/collection/abc", "from=%2Fexplorer")).toBeNull();
    expect(listReturnFromLocation("/profile", "tab=close&settings=1")).toBe("/profile?tab=close");
    expect(listReturnFromLocation("/explorer", "q=Nirvana&from=%2Fcollection")).toBe("/explorer?q=Nirvana");
  });
});

describe("mainNavHref", () => {
  it("restores the last listen when you leave a journal or confirm", () => {
    expect(
      mainNavHref("/collection", { pathname: "/collection/abc", search: "" }, "/collection?artist=Nirvana"),
    ).toBe("/collection?artist=Nirvana");
    expect(
      mainNavHref("/explorer", { pathname: "/explorer/add/12", search: "" }, "/explorer?q=Nirvana&format=vinyl"),
    ).toBe("/explorer?q=Nirvana&format=vinyl");
  });

  it("restores a room you are not in", () => {
    expect(mainNavHref("/collection", { pathname: "/explorer", search: "q=Blue" }, "/collection?year=1993")).toBe(
      "/collection?year=1993",
    );
    expect(mainNavHref("/profile", { pathname: "/collection", search: "" }, "/profile?tab=close")).toBe(
      "/profile?tab=close",
    );
  });

  it("clears a collection or explorer listen when you tap that list again", () => {
    expect(
      mainNavHref("/collection", { pathname: "/collection", search: "artist=Nirvana" }, "/collection?artist=Nirvana"),
    ).toBe("/collection");
    expect(mainNavHref("/explorer", { pathname: "/explorer", search: "q=Nirvana" }, "/explorer?q=Nirvana")).toBe(
      "/explorer",
    );
  });

  it("keeps the profile tab you are already on", () => {
    expect(mainNavHref("/profile", { pathname: "/profile", search: "tab=close" }, "/profile?tab=waiting")).toBe(
      "/profile?tab=close",
    );
    expect(mainNavHref("/profile", { pathname: "/profile", search: "" }, "/profile?tab=close")).toBe("/profile");
  });

  it("falls back to the tab root without a stored listen", () => {
    expect(mainNavHref("/collection", { pathname: "/explorer", search: "" }, null)).toBe("/collection");
    expect(mainNavHref("/collection", { pathname: "/explorer", search: "" }, "/explorer?q=Blue")).toBe("/collection");
  });
});
