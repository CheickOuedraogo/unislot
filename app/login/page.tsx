import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, roleHome } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(roleHome(user));

  return (
    <main className="flex-1 flex items-center justify-center px-margin-mobile">
      <div className="w-full max-w-sm">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="font-headline-md text-headline-md font-bold text-primary">
              UniTime Scheduler
            </span>
            <p className="font-body-sm text-body-sm text-secondary">
              Connectez-vous pour gérer les emplois du temps.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
