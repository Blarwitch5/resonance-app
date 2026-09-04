import { redirect } from "next/navigation";

interface ResetPasswordTokenPageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordTokenPage({ params }: ResetPasswordTokenPageProps) {
  const { token } = await params;
  const callback = encodeURIComponent("/reset-password");
  redirect(`/api/auth/reset-password/${encodeURIComponent(token)}?callbackURL=${callback}`);
}
