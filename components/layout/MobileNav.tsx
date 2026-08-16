"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { logout } from "@/lib/actions/auth";
import type { NavItem } from "./TopNavBar";

type MobileNavProps = {
  navItems: NavItem[];
};

export function MobileNav({ navItems }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.active ?? (item.href !== "/" && pathname.startsWith(item.href));

  return (
    <div className="md:hidden relative">
      <button
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors"
      >
        <Icon name={open ? "close" : "menu"} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 p-2 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-body-sm text-body-sm transition-colors ${
                isActive(item)
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-secondary hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {item.label}
              <Icon name="chevron_right" size={16} className="opacity-60" />
            </Link>
          ))}
          <div className="h-px bg-outline-variant my-1" />
          <form action={logout}>
            <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg font-body-sm text-body-sm text-error hover:bg-error-container transition-colors">
              <Icon name="logout" size={16} />
              Se déconnecter
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
