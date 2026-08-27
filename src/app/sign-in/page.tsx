import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/app/sign-in/sign-in-form";
import { ResonanceMark } from "@/components/ui/resonance-mark";
import { safeNextHref, signUpHref } from "@/lib/auth-path";
import { getSession } from "@/lib/session";

interface SignInPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getSession();
  const { next } = await searchParams;
  const nextPath = safeNextHref(next);

  if (session) {
    redirect(nextPath);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <ResonanceMark size="md" />
        <p className="mt-4 text-sm font-medium tracking-[0.28em] text-primary uppercase">Resonance</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text">Welcome back.</h1>
        <p className="mt-2 text-sm text-text-secondary">Your collection is still vibrating.</p>
        <SignInForm nextPath={nextPath} />
        <p className="mt-6 text-sm text-text-secondary">
          New here?{" "}
          <Link href={signUpHref(next)} className="font-medium text-primary hover:text-primary-hover">
            Start your journal
          </Link>
        </p>
      </div>
    </div>
  );
}
