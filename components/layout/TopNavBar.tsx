import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { Brand } from "./Brand";
import type { Role } from "@/lib/types";

export type NavItem = {
  label: string;
  href: string;
  active?: boolean;
};

type TopNavBarProps = {
  navItems: NavItem[];
  user?: { name: string; role: Role };
  children?: React.ReactNode;
};

export function TopNavBar({ navItems, user, children }: TopNavBarProps) {
  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-container-max items-center justify-between gap-2 px-margin-mobile md:px-margin-desktop">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            aria-label="Accueil UniTime"
            className="flex shrink-0 items-center rounded-lg py-1.5 pr-2 transition-colors hover:bg-accent"
          >
            <Brand />
          </Link>
          <nav className="ml-2 hidden items-center gap-0.5 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-0.5">
          <ThemeToggle />
          {user && <UserMenu user={user} />}
          <div className="md:hidden">
            <MobileNav navItems={navItems} user={user} />
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}