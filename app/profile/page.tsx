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
      <section className="flex flex-col gap-1">
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          Mon profil
        </h1>
        <p className="font-body-sm text-body-sm text-secondary">
          Modifiez vos informations personnelles et votre mot de passe.
        </p>
      </section>

      <ProfileForm
        firstName={user.first_name}
        lastName={user.last_name}
        role={user.role}
      />

      <div className="border-t border-border pt-4">
        <form action={logout}>
          <Button
            type="submit"
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
          >
            <Icon name="logout" size={16} />
            Se déconnecter
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
