import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/app/sign-up/sign-up-form";
import { ResonanceMark } from "@/components/ui/resonance-mark";
import { signInHref } from "@/lib/auth-path";
import { getSession } from "@/lib/session";

interface SignUpPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const session = await getSession();
  const { next } = await searchParams;

  if (session) {
    redirect("/welcome");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <ResonanceMark size="md" />
        <p className="mt-4 text-sm font-medium tracking-[0.28em] text-primary uppercase">Resonance</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text">Start your sound journal.</h1>
        <p className="mt-2 text-sm text-text-secondary">Every record you keep will keep a little of you.</p>
        <SignUpForm />
        <p className="mt-6 text-sm text-text-secondary">
          Already collecting?{" "}
          <Link href={signInHref(next)} className="font-medium text-primary hover:text-primary-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
