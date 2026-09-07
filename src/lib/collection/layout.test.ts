import { describe, expect, it } from "vitest";

import {
  SHELF_ARRIVE_STEP_MS,
  confirmSubmitFixedClass,
  isScrollNearEnd,
  shelfArriveDelayMs,
  shouldDockConfirmSubmit,
} from "@/lib/collection/layout";

describe("shelfArriveDelayMs", () => {
  it("lets the first records arrive in a short stagger", () => {
    expect(shelfArriveDelayMs(0)).toBe(0);
    expect(shelfArriveDelayMs(2)).toBe(SHELF_ARRIVE_STEP_MS * 2);
  });

  it("stops stacking delay after a breath of records", () => {
    expect(shelfArriveDelayMs(20)).toBe(shelfArriveDelayMs(11));
  });
});

describe("confirmSubmitFixedClass", () => {
  it("keeps the floating confirm CTA at fit-content", () => {
    expect(confirmSubmitFixedClass).toContain("w-fit");
    expect(confirmSubmitFixedClass).toContain("fixed");
    expect(confirmSubmitFixedClass).not.toContain("inset-x-4");
  });
});

describe("shouldDockConfirmSubmit", () => {
  it("stays floating while the natural slot is still below the scrollport", () => {
    expect(
      shouldDockConfirmSubmit({
        slotTop: 900,
        slotBottom: 948,
        viewportTop: 0,
        viewportBottom: 700,
      }),
    ).toBe(false);
  });

  it("docks once any part of the slot enters the scrollport", () => {
    expect(
      shouldDockConfirmSubmit({
        slotTop: 680,
        slotBottom: 728,
        viewportTop: 0,
        viewportBottom: 700,
      }),
    ).toBe(true);
  });

  it("docks at the end of the scroll even if the slot sits in the bottom padding", () => {
    expect(
      shouldDockConfirmSubmit({
        slotTop: 720,
        slotBottom: 768,
        viewportTop: 0,
        viewportBottom: 700,
        isScrollNearEnd: true,
      }),
    ).toBe(true);
  });

  it("stays quiet if the slot has already scrolled above the viewport", () => {
    expect(
      shouldDockConfirmSubmit({
        slotTop: -80,
        slotBottom: -20,
        viewportTop: 0,
        viewportBottom: 700,
      }),
    ).toBe(false);
  });
});

describe("isScrollNearEnd", () => {
  it("hears the last stretch of a scrollport", () => {
    expect(
      isScrollNearEnd({
        scrollTop: 952,
        scrollHeight: 1200,
        clientHeight: 700,
      }),
    ).toBe(true);
    expect(
      isScrollNearEnd({
        scrollTop: 0,
        scrollHeight: 1200,
        clientHeight: 700,
      }),
    ).toBe(false);
  });
});
