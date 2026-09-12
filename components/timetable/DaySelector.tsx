"use client";

import { getWeekDays } from "@/lib/utils";

type DaySelectorProps = {
  weekStart: string;
  selectedDay: number | null;
  onSelect: (day: number | null) => void;
};

export function DaySelector({
  weekStart,
  selectedDay,
  onSelect,
}: DaySelectorProps) {
  const weekDays = getWeekDays(new Date(`${weekStart}T00:00:00`)).slice(0, 6);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        onClick={() => onSelect(null)}
        className={`flex flex-col items-center justify-center min-w-[56px] py-2 px-1 rounded-xl transition-all shrink-0 ${
          selectedDay === null
            ? "bg-primary text-on-primary shadow-lg shadow-primary/25 scale-105"
            : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
        }`}
      >
        <span className="font-label-caps text-[11px]">Tous</span>
        <span className="text-[10px] opacity-70 mt-0.5">
          {weekDays.length}j
        </span>
      </button>
      {weekDays.map((day, i) => {
        const dayNum = new Date(`${day.iso}T00:00:00`).getDate();
        const isActive = selectedDay === i;
        return (
          <button
            key={day.iso}
            onClick={() => onSelect(i)}
            className={`flex flex-col items-center justify-center min-w-[56px] py-2 px-1 rounded-xl transition-all shrink-0 ${
              isActive
                ? "bg-primary text-on-primary shadow-lg shadow-primary/25 scale-105"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className={`font-label-caps text-[11px] ${isActive ? "text-on-primary/80" : ""}`}
            >
              {day.label}
            </span>
            <span className="font-headline-sm text-headline-sm">{dayNum}</span>
          </button>
        );
      })}
    </div>
  );
}
