"use client";

import { useState } from "react";
import { DaySelector } from "./DaySelector";
import { TimetableGrid } from "./TimetableGrid";
import type { Role, Slot, Subject } from "@/lib/types";

type TimetableClientProps = {
  slots: Slot[];
  subjects: Subject[];
  teachers: { id: string; name: string }[];
  subjectTeachers: Record<string, { id: string; name: string }[]>;
  classId: string;
  weekStart: string;
  user: { id: string; role: Role; name: string };
};

export function TimetableClient({
  slots,
  subjects,
  teachers,
  subjectTeachers,
  classId,
  weekStart,
  user,
}: TimetableClientProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <>
      <div className="md:hidden">
        <DaySelector
          weekStart={weekStart}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
        />
      </div>
      <TimetableGrid
        slots={slots}
        subjects={subjects}
        teachers={teachers}
        subjectTeachers={subjectTeachers}
        classId={classId}
        weekStart={weekStart}
        user={user}
        selectedDay={selectedDay}
      />
    </>
  );
}
