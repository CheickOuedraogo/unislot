import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, roleHome } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export const metadata: Metadata = { title: "Changer le mot de passe" };

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.must_change_password) redirect(roleHome(user));

  return (
    <main className="flex-1 flex items-center justify-center px-margin-mobile">
      <div className="w-full max-w-sm">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="font-headline-md text-headline-md font-bold text-primary">
              UniTime Scheduler
            </span>
            <p className="font-body-sm text-body-sm text-secondary">
              Vous devez définir un nouveau mot de passe avant de continuer.
            </p>
          </div>
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
