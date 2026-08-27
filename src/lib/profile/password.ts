export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export type PasswordChangeResult =
  | { ok: true; currentPassword: string; newPassword: string }
  | { ok: false; message: string };

export function parsePasswordChange(input: {
  current: string;
  next: string;
  confirm: string;
}): PasswordChangeResult {
  if (input.current.length === 0) {
    return { ok: false, message: "Enter the password you use now." };
  }

  if (input.next.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: "A password stays at least 8 characters." };
  }

  if (input.next.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, message: "A password stays under 128 characters." };
  }

  if (input.next !== input.confirm) {
    return { ok: false, message: "Those new passwords do not match." };
  }

  if (input.next === input.current) {
    return { ok: false, message: "Choose a password that is not the one you use now." };
  }

  return {
    ok: true,
    currentPassword: input.current,
    newPassword: input.next,
  };
}

export function passwordChangeFailure(error: unknown): string {
  const code = authErrorCode(error);

  if (code === "INVALID_PASSWORD") {
    return "That is not the password you use now.";
  }

  if (code === "PASSWORD_TOO_SHORT") {
    return "A password stays at least 8 characters.";
  }

  if (code === "PASSWORD_TOO_LONG") {
    return "A password stays under 128 characters.";
  }

  return "Your password could not be changed.";
}

function authErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  if ("body" in error && typeof error.body === "object" && error.body !== null && "code" in error.body) {
    const code = error.body.code;
    return typeof code === "string" ? code : undefined;
  }

  if ("code" in error && typeof error.code === "string") {
    return error.code;
  }

  return undefined;
}
