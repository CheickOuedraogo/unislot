"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

type WeekNavigatorProps = {
  weekStart: string;
  classId: string;
  label: string;
  basePath?: string;
};

export function WeekNavigator({
  weekStart,
  classId,
  label,
  basePath = "/timetable",
}: WeekNavigatorProps) {
  const router = useRouter();

  const go = (days: number) => {
    const base = new Date(`${weekStart}T00:00:00`);
    if (Number.isNaN(base.getTime())) return;
    base.setDate(base.getDate() + days);
    router.push(`${basePath}?class=${classId}&week=${base.toISOString().slice(0, 10)}`);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="hidden sm:inline font-headline-md text-headline-md text-on-background">
        Semaine du {label}
      </span>
      <span className="sm:hidden font-headline-md text-headline-md text-on-background">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          aria-label="Semaine précédente"
          onClick={() => go(-7)}
          className="p-1.5 border border-outline-variant rounded hover:bg-surface-container-low transition-colors flex items-center justify-center"
        >
          <Icon name="chevron_left" size={20} />
        </button>
        <button
          aria-label="Semaine suivante"
          onClick={() => go(7)}
          className="p-1.5 border border-outline-variant rounded hover:bg-surface-container-low transition-colors flex items-center justify-center"
        >
          <Icon name="chevron_right" size={20} />
        </button>
      </div>
    </div>
  );
}
