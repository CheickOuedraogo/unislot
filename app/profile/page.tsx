import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Mon profil" };

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/profile")}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-6">
        <section className="flex flex-col gap-1">
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Mon profil
          </h1>
          <p className="font-body-sm text-body-sm text-secondary">
            Modifiez vos informations personnelles et votre mot de passe.
          </p>
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface p-6 shadow-sm">
          <ProfileForm
            firstName={user.first_name}
            lastName={user.last_name}
            role={user.role}
          />
        </section>

        <section className="flex flex-col gap-2 rounded-xl border border-outline-variant p-6">
          <h2 className="font-body-sm font-semibold text-on-surface">
            Session
          </h2>
          <p className="font-body-sm text-body-sm text-secondary">
            Vous serez déconnecté de tous vos appareils actifs.
          </p>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="mt-2 w-full text-destructive hover:bg-destructive/10 sm:w-auto"
            >
              <Icon name="logout" size={18} />
              Se déconnecter
            </Button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}