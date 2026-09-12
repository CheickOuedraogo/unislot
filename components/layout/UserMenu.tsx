"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/Icon";
import { logout } from "@/lib/actions/auth";
import { ROLE_LABELS } from "@/lib/constants";
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
    <div className="flex items-center gap-0.5">
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
        <span className="hidden max-w-40 truncate md:inline">{user.name}</span>
        <span className="hidden text-xs text-muted-foreground md:inline">
          {ROLE_LABELS[user.role]}
        </span>
      </Link>
      <form action={logout}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label="Se déconnecter"
          title="Se déconnecter"
        >
          <Icon name="logout" size={18} />
        </Button>
      </form>
    </div>
  );
}