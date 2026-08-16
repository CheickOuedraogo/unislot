"use client";

import { useRouter } from "next/navigation";

type ClassSelectorProps = {
  classes: { id: string; name: string; level: string }[];
  selectedId: string;
  weekStart: string;
};

export function ClassSelector({ classes, selectedId, weekStart }: ClassSelectorProps) {
  const router = useRouter();

  if (classes.length <= 1) return null;

  return (
    <select
      value={selectedId}
      aria-label="Sélectionner une classe"
      onChange={(e) =>
        router.push(`/timetable?class=${e.target.value}&week=${weekStart}`)
      }
      className="border border-outline-variant rounded bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
    >
      {classes.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
          {c.level ? ` (${c.level})` : ""}
        </option>
      ))}
    </select>
  );
}
