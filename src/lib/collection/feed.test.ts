import { describe, expect, it } from "vitest";

import {
  feedHasFurther,
  feedPageCount,
  mergeFeedItems,
  nextFeedPage,
} from "@/lib/collection/feed";

describe("nextFeedPage", () => {
  it("returns the following page while the shelf still has more", () => {
    expect(nextFeedPage(1, 3, 50)).toBe(2);
    expect(nextFeedPage(2, 3, 50)).toBe(3);
  });

  it("stops at the last page and at the ceiling", () => {
    expect(nextFeedPage(3, 3, 50)).toBeNull();
    expect(nextFeedPage(50, 80, 50)).toBeNull();
    expect(nextFeedPage(49, 80, 50)).toBe(50);
  });

  it("ignores broken counts", () => {
    expect(nextFeedPage(0, 3, 50)).toBeNull();
    expect(nextFeedPage(1, 0, 50)).toBeNull();
    expect(nextFeedPage(1.5, 3, 50)).toBeNull();
    expect(nextFeedPage(1, 3, 0)).toBeNull();
  });
});

describe("feedHasFurther", () => {
  it("is true only when another page can still be heard", () => {
    expect(feedHasFurther(1, 2, 50)).toBe(true);
    expect(feedHasFurther(2, 2, 50)).toBe(false);
    expect(feedHasFurther(1, 1, 50)).toBe(false);
  });
});

describe("feedPageCount", () => {
  it("keeps at least one page and respects the ceiling", () => {
    expect(feedPageCount(0, 48, 50)).toBe(1);
    expect(feedPageCount(48, 48, 50)).toBe(1);
    expect(feedPageCount(49, 48, 50)).toBe(2);
    expect(feedPageCount(48 * 80, 48, 50)).toBe(50);
  });
});

describe("mergeFeedItems", () => {
  it("appends unseen records and skips duplicates", () => {
    const current = [{ id: "a" }, { id: "b" }];
    const incoming = [{ id: "b" }, { id: "c" }];

    expect(mergeFeedItems(current, incoming, (item) => item.id)).toEqual([
      { id: "a" },
      { id: "b" },
      { id: "c" },
    ]);
  });

  it("keeps the same array when nothing new arrived", () => {
    const current = [{ id: "a" }];
    expect(mergeFeedItems(current, [{ id: "a" }], (item) => item.id)).toBe(current);
    expect(mergeFeedItems(current, [], (item) => item.id)).toBe(current);
  });
});
