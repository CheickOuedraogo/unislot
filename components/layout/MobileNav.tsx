"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Icon } from "@/components/ui/Icon";
import { ROLE_LABELS } from "@/lib/constants";
import type { NavItem } from "./TopNavBar";
import type { Role } from "@/lib/types";

type MobileNavProps = {
  navItems: NavItem[];
  user?: { name: string; role: Role };
};

function initialsOf(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return initials ? initials.toUpperCase() : name.slice(0, 2).toUpperCase();
}

export function MobileNav({ navItems, user }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.active ?? (item.href !== "/" && pathname.startsWith(item.href));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          />
        }
      >
        <Icon name="menu" size={20} />
      </SheetTrigger>
      <SheetContent side="right" className="w-72 gap-0 sm:w-80">
        <SheetHeader className="border-b border-border">
          <SheetTitle>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              UniTime
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Menu de navigation
          </SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <SheetClose
              key={item.href}
              render={
                <Link
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                />
              }
            >
              {item.label}
              {isActive(item) && (
                <Icon name="circle" size={6} fill className="text-primary" />
              )}
            </SheetClose>
          ))}
        </nav>

        {user && (
          <div className="mt-auto border-t border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initialsOf(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}