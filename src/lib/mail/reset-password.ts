import "server-only";

import { Resend } from "resend";

import { getEnv } from "@/lib/env";
import { escapeHtml } from "@/lib/mail/html";

interface ResetPasswordMail {
  name: string | null;
  email: string;
  url: string;
}

export async function sendResetPasswordMail({ name, email, url }: ResetPasswordMail): Promise<void> {
  const env = getEnv();
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    if (env.NODE_ENV === "development") {
      console.info("[auth] password reset requested, but Resend is not configured.");
    }

    return;
  }

  const greeting = escapeHtml(name?.trim() || "there");
  const safeUrl = escapeHtml(url);
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: email,
    subject: "A way back into your journal",
    html: `<p>Hi ${greeting},</p>
<p>Someone asked to open a new password for this Resonance journal. If it was you, this door stays open for one hour.</p>
<p><a href="${safeUrl}">Open a new password</a></p>
<p>If this was not you, you can let the letter rest.</p>`,
  });

  if (result.error) {
    throw new Error("This letter could not be sent just now.");
  }
}
