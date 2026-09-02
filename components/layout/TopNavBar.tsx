import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { MobileNav } from "./MobileNav";
import { logout } from "@/lib/actions/auth";
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
    <header className="bg-surface-container-lowest dark:bg-on-background border-b border-outline-variant dark:border-outline sticky top-0 z-50 shrink-0">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-grid-row-height">
        <div className="flex items-center gap-gutter min-w-0">
          <nav className="hidden md:flex gap-unit items-center h-full">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`h-full flex items-center px-unit transition-colors duration-200 active:scale-95 ${
                  item.active
                    ? "text-primary dark:text-inverse-primary border-b-2 border-primary dark:border-inverse-primary pb-1"
                    : "text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container dark:hover:bg-inverse-surface"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-gutter">
          {user && (
            <form action={logout}>
              <button
                aria-label="Se déconnecter"
                className="hidden sm:inline-flex items-center gap-1.5 font-body-sm text-body-sm text-secondary hover:text-error transition-colors hover:bg-error-container rounded-lg px-2 py-1.5"
              >
                <Icon name="logout" size={16} />
                Se déconnecter
              </button>
            </form>
          )}
          <MobileNav navItems={navItems} />
          {children}
        </div>
      </div>
    </header>
  );
}
