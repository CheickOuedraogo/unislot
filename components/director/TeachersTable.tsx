"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { inputClass } from "@/components/ui/Field";
import type { Teacher } from "@/lib/types";

type StatusFilter = "all" | "active" | "inactive";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "active", label: "Actifs" },
  { value: "inactive", label: "Inactifs" },
];

export function TeachersTable({ teachers }: { teachers: Teacher[] }) {
  const router = useRouter();
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Icon
            name="search"
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un enseignant (nom ou email)…"
            className={`${inputClass} pl-10`}
            aria-label="Rechercher un enseignant"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-surface-container-lowest border border-outline-variant rounded-lg w-fit">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={`px-3 py-1.5 rounded-md font-body-sm text-body-sm transition-colors ${
                status === f.value
                  ? "bg-primary text-on-primary"
                  : "text-secondary hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="font-body-sm text-body-sm text-secondary">
          {teachers.length === 0
            ? "Aucun enseignant. Créez le premier compte ci-dessus."
            : "Aucun enseignant ne correspond à votre recherche."}
        </p>
      ) : (
        <div className="card table-wrap">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high">
              <tr className="font-label-caps text-label-caps text-secondary uppercase">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => router.push(`/director/teachers/${t.id}`)}
                  className="border-t border-outline-variant font-body-sm text-body-sm cursor-pointer hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-on-surface">
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-secondary">{t.email}</td>
                  <td className="px-4 py-3">
                    {t.is_active ? (
                      <span className="inline-flex items-center gap-1.5 font-body-sm text-body-sm text-on-success bg-success rounded-full px-2.5 py-0.5">
                        <span className="size-1.5 rounded-full bg-on-success" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-body-sm text-body-sm text-on-error bg-error rounded-full px-2.5 py-0.5">
                        <span className="size-1.5 rounded-full bg-on-error" />
                        Inactif
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
