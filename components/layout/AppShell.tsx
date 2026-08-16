import { TopNavBar, type NavItem } from "./TopNavBar";
import type { Role } from "@/lib/types";

type AppShellProps = {
  user: { name: string; role: Role };
  navItems: NavItem[];
  children: React.ReactNode;
};

export function AppShell({ user, navItems, children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-container">
      <TopNavBar
        navItems={navItems}
        user={{ name: user.name, role: user.role }}
      />
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 flex flex-col gap-8">
        {children}
      </main>
    </div>
  );
}
