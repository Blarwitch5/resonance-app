import { describe, expect, it } from "vitest";

import { parsePasswordChange, passwordChangeFailure } from "@/lib/profile/password";

describe("parsePasswordChange", () => {
  it("keeps a matching pair", () => {
    expect(
      parsePasswordChange({
        current: "test1234",
        next: "quiet-shelf",
        confirm: "quiet-shelf",
      }),
    ).toEqual({
      ok: true,
      currentPassword: "test1234",
      newPassword: "quiet-shelf",
    });
  });

  it("asks for the password in use", () => {
    expect(
      parsePasswordChange({
        current: "",
        next: "quiet-shelf",
        confirm: "quiet-shelf",
      }),
    ).toEqual({ ok: false, message: "Enter the password you use now." });
  });

  it("asks for a new password of the right length", () => {
    expect(
      parsePasswordChange({
        current: "test1234",
        next: "short",
        confirm: "short",
      }),
    ).toEqual({ ok: false, message: "A password stays at least 8 characters." });

    expect(
      parsePasswordChange({
        current: "test1234",
        next: "a".repeat(129),
        confirm: "a".repeat(129),
      }),
    ).toEqual({ ok: false, message: "A password stays under 128 characters." });
  });

  it("hears when the new lines do not match", () => {
    expect(
      parsePasswordChange({
        current: "test1234",
        next: "quiet-shelf",
        confirm: "quiet-shelves",
      }),
    ).toEqual({ ok: false, message: "Those new passwords do not match." });
  });

  it("refuses to keep the same password", () => {
    expect(
      parsePasswordChange({
        current: "test1234",
        next: "test1234",
        confirm: "test1234",
      }),
    ).toEqual({
      ok: false,
      message: "Choose a password that is not the one you use now.",
    });
  });
});

describe("passwordChangeFailure", () => {
  it("stays quiet about the wrong current password", () => {
    expect(passwordChangeFailure({ body: { code: "INVALID_PASSWORD" } })).toBe(
      "That is not the password you use now.",
    );
  });

  it("does not leak a stack", () => {
    expect(passwordChangeFailure(new Error("hash mismatch in account.password"))).toBe(
      "Your password could not be changed.",
    );
  });
});
