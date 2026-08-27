"use client";

import { FaceSlightlySmilingPlus, Lock, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { authClient } from "@/lib/auth-client";
import { toErrorMessage } from "@/lib/errors";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/welcome",
      });

      if (result.error) {
        setError(result.error.message || "This journal could not be opened.");
        return;
      }

      router.push("/welcome");
      router.refresh();
    } catch (caught) {
      setError(toErrorMessage(caught));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      <TextField
        id="name"
        name="name"
        type="text"
        label="Name"
        autoComplete="name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        icon={UserRound}
      />
      <TextField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        icon={Mail}
      />
      <TextField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        icon={Lock}
      />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
        {isSubmitting ? "Opening…" : "Create journal"}
      </Button>
    </form>
  );
}
