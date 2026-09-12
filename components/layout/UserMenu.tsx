"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="dropdown-menu-trigger"
        className="ml-1 flex items-center gap-2 rounded-full py-1 pr-2 pl-1 text-sm font-medium text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-7">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {initialsOf(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-40 truncate md:inline">{user.name}</span>
        <Icon
          name="expand_more"
          size={16}
          className="hidden text-muted-foreground md:inline"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground truncate">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <Icon name="person" size={16} />
          Mon profil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logout} className="outline-hidden">
          <button
            type="submit"
            className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-hidden"
          >
            <Icon name="logout" size={16} />
            Se déconnecter
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}