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
      <section className="profile-panel mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Mon profil
          </h1>
          <p className="font-body-sm text-body-sm text-secondary">
            Modifiez vos informations personnelles et votre mot de passe.
          </p>
        </div>

        <ProfileForm
          firstName={user.first_name}
          lastName={user.last_name}
          role={user.role}
        />

        <form action={logout} className="w-full sm:w-auto">
          <Button
            type="submit"
            variant="outline"
            size="lg"
            className="w-full text-destructive hover:bg-destructive/10 sm:w-auto"
          >
            <Icon name="logout" size={18} />
            Se déconnecter
          </Button>
        </form>
      </section>
    </AppShell>
  );
}