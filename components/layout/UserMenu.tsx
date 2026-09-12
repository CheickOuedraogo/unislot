"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Role } from "@/lib/types";

type UserMenuProps = {
  user: { name: string; role: Role };
};

function initialsOf(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return initials ? initials.toUpperCase() : name.slice(0, 2).toUpperCase();
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <Link
      href="/profile"
      title="Mon profil"
      className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 text-sm font-medium text-foreground transition-colors outline-none hover:bg-accent"
    >
      <Avatar className="size-7">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
          {initialsOf(user.name)}
        </AvatarFallback>
      </Avatar>
      <span className="hidden md:inline">{user.name}</span>
    </Link>
  );
}