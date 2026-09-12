"use client";

import { Fragment, useState } from "react";
import {
  courseTypeBadgeClass,
  courseTypeCardClass,
  courseTypeLabels,
  END_HOUR,
  GRID_DAYS,
  START_HOUR,
  hours,
} from "@/lib/constants";
import { getWeekDays, formatTime, minutesOfDay, isDayInPast } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { ConfigModal } from "./ConfigModal";
import { SwapModal } from "./SwapModal";
import { deleteSlot } from "@/lib/actions/slots";
import type { Role, Slot, Subject } from "@/lib/types";

const formatHour = (h: number) => `${String(h).padStart(2, "0")}:00`;

type TimetableGridProps = {
  slots: Slot[];
  subjects: Subject[];
  teachers: { id: string; name: string }[];
  subjectTeachers: Record<string, { id: string; name: string }[]>;
  classId: string;
  weekStart: string;
  user: { id: string; role: Role; name: string };
  selectedDay?: number | null;
};

type ModalState =
  | { kind: "create"; day: number; start: string; end: string }
  | { kind: "edit"; slot: Slot }
  | { kind: "swap"; slot: Slot }
  | null;

const GRID_START_MIN = START_HOUR * 60;
const GRID_TOTAL_MIN = (END_HOUR - START_HOUR) * 60;

function courseCard(slot: Slot) {
  return (
    <div className={courseTypeCardClass[slot.type]}>
      <div className="flex justify-between items-start mb-1">
        <span className={courseTypeBadgeClass[slot.type]}>
          {courseTypeLabels[slot.type]}
        </span>
      </div>
      <h3 className="font-body-sm text-body-sm font-semibold text-on-surface leading-tight mb-1">
        {slot.subject_name}
      </h3>
      <p className="font-label-caps text-label-caps text-secondary mb-1">
        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
      </p>
      <div className="mt-auto flex flex-col gap-0.5">
        {slot.professors.map((prof) => (
          <span
            key={prof.id}
            className="font-label-caps text-[10px] text-on-surface-variant flex items-center gap-1"
          >
            <Icon name="person" size={12} /> {prof.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function assignLanes(daySlots: Slot[]): Map<string, number> {
  const sorted = [...daySlots].sort(
    (a, b) =>
      minutesOfDay(a.start_time) - minutesOfDay(b.start_time) ||
      minutesOfDay(a.end_time) - minutesOfDay(b.end_time)
  );
  const lanes: number[] = [];
  const assigned = new Map<string, number>();
  for (const slot of sorted) {
    const start = minutesOfDay(slot.start_time);
    let laneIndex = lanes.findIndex((laneEnd) => laneEnd <= start);
    if (laneIndex === -1) {
      laneIndex = lanes.length;
      lanes.push(0);
    }
    lanes[laneIndex] = minutesOfDay(slot.end_time);
    assigned.set(slot.id, laneIndex);
  }
  return assigned;
}

function slotStyle(slot: Slot, lane: number, laneCount: number) {
  const start = minutesOfDay(slot.start_time);
  const end = minutesOfDay(slot.end_time);
  const top = Math.max(0, (start - GRID_START_MIN) / GRID_TOTAL_MIN) * 100;
  const bottom = Math.min(1, (end - GRID_START_MIN) / GRID_TOTAL_MIN) * 100;
  return {
    top: `${top}%`,
    height: `${Math.max(1, bottom - top)}%`,
    left: `${Math.max(0, (lane / laneCount) * 100)}%`,
    width: `${100 / laneCount}%`,
  };
}

export function TimetableGrid({
  slots,
  subjects,
  teachers,
  subjectTeachers,
  classId,
  weekStart,
  user,
  selectedDay = null,
}: TimetableGridProps) {
  const [modal, setModal] = useState<ModalState>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [hover, setHover] = useState<{ slot: Slot; x: number; y: number } | null>(
    null
  );

  const weekDays = getWeekDays(new Date(`${weekStart}T00:00:00`)).slice(0, 6);

  const canEdit = (slot: Slot) =>
    user.role === "director" || slot.creator_teacher_id === user.id;

  const slotsByDay = new Map<number, { slot: Slot; lane: number; laneCount: number }[]>();
  for (const day of GRID_DAYS) {
    const daySlots = slots.filter((s) => s.day_of_week === day);
    if (daySlots.length === 0) continue;
    const lanes = assignLanes(daySlots);
    const laneCount = Math.max(1, new Set(lanes.values()).size);
    slotsByDay.set(
      day,
      daySlots.map((slot) => ({
        slot,
        lane: lanes.get(slot.id) ?? 0,
        laneCount,
      }))
    );
  }

  const coveredHour = (dayOfWeek: number, hour: number) =>
    slots.some(
      (s) =>
        s.day_of_week === dayOfWeek &&
        Math.floor(minutesOfDay(s.start_time) / 60) <= hour &&
        hour < Math.ceil(minutesOfDay(s.end_time) / 60)
    );

  const pastDay = (dayOfWeek: number) =>
    isDayInPast(dayOfWeek, new Date(`${weekStart}T00:00:00`));

  return (
    <div className="p-4 flex-1 overflow-x-auto overflow-y-auto">
      <div className={`${selectedDay !== null ? "min-w-0 md:min-w-[720px]" : "min-w-[720px]"} max-w-container-max mx-auto bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden`}>
        <div className={`timetable-grid ${selectedDay !== null ? "timetable-grid-single" : ""}`}>
          <div
            className="bg-surface border-b border-r border-outline-variant"
            style={{ gridColumn: 1, gridRow: 1 }}
          />
          {weekDays.map((day, col) => {
            const isActive = selectedDay === null || selectedDay === col;
            return (
              <div
                key={day.iso}
                className={`bg-surface border-b ${
                  col < weekDays.length - 1 ? "border-r " : ""
                }border-outline-variant p-2 text-center font-label-caps text-label-caps text-secondary flex flex-col justify-center ${
                  selectedDay !== null
                    ? isActive
                      ? "day-header-active"
                      : "day-header"
                    : ""
                }`}
                style={{ gridColumn: col + 2, gridRow: 1 }}
              >
                <span className="font-bold text-on-surface">{day.label}</span>
                <span>{day.date}</span>
              </div>
            );
          })}
          {hours.map((hour, hourIndex) => {
            return (
              <Fragment key={hour}>
                <div
                  className="time-label font-label-caps text-label-caps"
                  style={{ gridColumn: 1, gridRow: hourIndex + 2 }}
                >
                  {formatHour(hour)}
                </div>
                {weekDays.map((day, col) => {
                  const dayOfWeek = GRID_DAYS[col];
                  const cellBorder =
                    col === weekDays.length - 1
                      ? "border-b border-surface-container-low"
                      : "border-r border-b border-surface-container-low";

                  const covered = coveredHour(dayOfWeek, hour);
                  const past = pastDay(dayOfWeek);
                  const isActive = selectedDay === null || selectedDay === col;

                  return (
                    <div
                      key={`${hour}-${col}`}
                      className={`grid-cell ${cellBorder}${
                        covered || past ? " pointer-events-none" : ""
                      } ${
                        selectedDay !== null
                          ? isActive
                            ? "day-cell-active"
                            : "day-cell"
                          : ""
                      }`}
                      style={{
                        gridColumn: col + 2,
                        gridRow: hourIndex + 2,
                      }}
                      onClick={
                        covered || past
                          ? undefined
                          : () =>
                              setModal({
                                kind: "create",
                                day: dayOfWeek,
                                start: formatHour(hour),
                                end: formatHour(Math.min(hour + 2, END_HOUR)),
                              })
                      }
                    />
                  );
                })}
              </Fragment>
            );
          })}

          <div
            className="pointer-events-none relative day-overlay-layer"
            style={{
              gridColumn: `2 / ${GRID_DAYS.length + 2}`,
              gridRow: `2 / ${hours.length + 2}`,
            }}
          >
            {GRID_DAYS.map((day, col) => {
              const entries = slotsByDay.get(day);
              if (!entries) return null;
              const isActive = selectedDay === null || selectedDay === col;
              return (
                <div
                  key={day}
                  className={`absolute top-0 bottom-0 ${
                    selectedDay !== null
                      ? isActive
                        ? "day-overlay-col-active"
                        : "day-overlay-col"
                      : ""
                  }`}
                  style={{ left: `${col * (100 / 6)}%`, width: `${100 / 6}%` }}
                >
                  <div className="relative h-full">
                    {entries.map(({ slot, lane, laneCount }) => {
                      const editable = canEdit(slot);
                      const style = slotStyle(slot, lane, laneCount);
                      return (
                        <div
                          key={slot.id}
                          className="absolute pointer-events-auto"
                          style={style}
                          onClick={() =>
                            setOpenPopover((prev) =>
                              prev === slot.id ? null : slot.id
                            )
                          }
                          onMouseMove={(e) =>
                            setHover({ slot, x: e.clientX, y: e.clientY })
                          }
                          onMouseEnter={(e) =>
                            setHover({ slot, x: e.clientX, y: e.clientY })
                          }
                          onMouseLeave={() => setHover(null)}
                        >
                          {courseCard(slot)}
                          {openPopover === slot.id && (
                            <div
                              className="absolute top-2 left-full ml-2 w-44 bg-surface-container-lowest border border-outline-variant rounded shadow-sm z-50 flex flex-col"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {editable && (
                                <button
                                  className="text-left px-3 py-2 font-body-sm text-body-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2"
                                  onClick={() =>
                                    setModal({ kind: "edit", slot })
                                  }
                                >
                                  <Icon name="edit" size={16} /> Modifier
                                </button>
                              )}
                              {!editable && !pastDay(slot.day_of_week) && (
                                <button
                                  className="text-left px-3 py-2 font-body-sm text-body-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2"
                                  onClick={() =>
                                    setModal({ kind: "swap", slot })
                                  }
                                >
                                  <Icon name="swap_horiz" size={16} /> Demander
                                  un échange
                                </button>
                              )}
{editable && (
                              <>
                                <div className="h-px bg-outline-variant w-full" />
                                <ConfirmButton
                                  action={() => deleteSlot(slot.id)}
                                  title="Supprimer le créneau"
                                  message={`Supprimer « ${slot.subject_name} » (${formatTime(
                                    slot.start_time
                                  )} - ${formatTime(slot.end_time)}) de l'emploi du temps ?`}
                                  confirmLabel="Supprimer"
                                  className="justify-start px-3 py-2 w-full"
                                  onSuccess={() => setOpenPopover(null)}
                                >
                                  Supprimer
                                </ConfirmButton>
                              </>
                            )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {modal?.kind === "create" && (
        <ConfigModal
          mode="create"
          classId={classId}
          subjects={subjects}
          teachers={teachers}
          subjectTeachers={subjectTeachers}
          dayOfWeek={modal.day}
          defaultStart={modal.start}
          defaultEnd={modal.end}
          currentUserId={user.id}
          role={user.role}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "edit" && (
        <ConfigModal
          key={`edit-${modal.slot.id}`}
          mode="edit"
          classId={classId}
          subjects={subjects}
          teachers={teachers}
          subjectTeachers={subjectTeachers}
          dayOfWeek={modal.slot.day_of_week}
          defaultStart={modal.slot.start_time}
          defaultEnd={modal.slot.end_time}
          slot={modal.slot}
          currentUserId={user.id}
          role={user.role}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "swap" && (
        <SwapModal
          key={`swap-${modal.slot.id}`}
          slot={modal.slot}
          subjects={subjects}
          onClose={() => setModal(null)}
        />
      )}

      {hover && (
        <div
          className="fixed z-[90] pointer-events-none bg-on-surface text-surface font-body-sm text-body-sm rounded-lg shadow-lg px-3 py-2 max-w-64"
          style={{ left: hover.x + 14, top: hover.y + 16 }}
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-semibold">{hover.slot.subject_name}</span>
            <span className="font-label-caps text-[10px] uppercase opacity-70">
              {courseTypeLabels[hover.slot.type]}
            </span>
          </div>
          <p className="text-label-caps text-[11px] opacity-80">
            {hover.slot.class_name} ·{" "}
            {formatTime(hover.slot.start_time)} -{" "}
            {formatTime(hover.slot.end_time)}
          </p>
          {hover.slot.professors.length > 0 && (
            <p className="text-label-caps text-[11px] mt-1">
              {hover.slot.professors.map((p) => p.name).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}