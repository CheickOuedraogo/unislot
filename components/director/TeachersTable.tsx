"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/input";
import { cn } from "cn";
import { TeacherStatusBadge } from "./TeacherStatus";
import type { Teacher } from "@/lib/types";

type StatusFilter = "all" | "active" | "inactive";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "active", label: "Actifs" },
  { value: "inactive", label: "Inactifs" },
];

function initialsOf(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return initials ? initials.toUpperCase() : name.slice(0, 2).toUpperCase();
}

export function TeachersTable({ teachers }: { teachers: Teacher[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teachers.filter((t) => {
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q);
      const matchesStatus =
        status === "all" ||
        (status === "active" && t.is_active) ||
        (status === "inactive" && !t.is_active);
      return matchesQuery && matchesStatus;
    });
  }, [teachers, query, status]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Icon
            name="search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un enseignant (nom ou email)…"
            className="pl-9"
            aria-label="Rechercher un enseignant"
          />
        </div>
        <div className="flex w-fit items-center gap-1 rounded-lg bg-muted p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                status === f.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-5 text-sm text-muted-foreground">
          {teachers.length === 0
            ? "Aucun enseignant. Créez le premier compte ci-dessus."
            : "Aucun enseignant ne correspond à votre recherche."}
        </Card>
      ) : (
        <Card className="p-0 divide-y divide-border">
          {filtered.map((t) => (
            <Link
              key={t.id}
              href={`/director/teachers/${t.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
            >
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {initialsOf(t.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {t.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.email}
                </p>
              </div>
              <TeacherStatusBadge active={t.is_active} />
              <Icon
                name="chevron_right"
                size={18}
                className="shrink-0 text-muted-foreground"
              />
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}