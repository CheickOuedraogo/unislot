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
import { getWeekDays, formatTime, minutesOfDay } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { ConfigModal } from "./ConfigModal";
import { SwapModal } from "./SwapModal";
import { deleteSlot } from "@/lib/actions/slots";
import type { Role, Slot, Subject } from "@/lib/types";

const formatHour = (h: number) => `${h}:00`;

type TimetableGridProps = {
  slots: Slot[];
  subjects: Subject[];
  teachers: { id: string; name: string }[];
  classId: string;
  weekStart: string;
  user: { id: string; role: Role; name: string };
};

type ModalState =
  | { kind: "create"; day: number; start: string; end: string }
  | { kind: "edit"; slot: Slot }
  | { kind: "swap"; slot: Slot }
  | null;

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

export function TimetableGrid({
  slots,
  subjects,
  teachers,
  classId,
  weekStart,
  user,
}: TimetableGridProps) {
  const [modal, setModal] = useState<ModalState>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [hover, setHover] = useState<{ slot: Slot; x: number; y: number } | null>(
    null
  );

  const weekDays = getWeekDays(new Date(`${weekStart}T00:00:00`)).slice(0, 6);

  const canEdit = (slot: Slot) =>
    user.role === "director" || slot.creator_teacher_id === user.id;

  const slotsByStart = new Map<string, Slot>();
  for (const slot of slots) {
    slotsByStart.set(
      `${slot.day_of_week}:${Math.floor(minutesOfDay(slot.start_time) / 60)}`,
      slot
    );
  }

  const slotSpan = (slot: Slot) => {
    const startRow = Math.max(
      2,
      Math.floor(minutesOfDay(slot.start_time) / 60) - START_HOUR + 2
    );
    const endRow = Math.min(
      1 + hours.length + 1,
      Math.ceil(minutesOfDay(slot.end_time) / 60) - START_HOUR + 2
    );
    return { startRow, span: Math.max(1, endRow - startRow) };
  };

  return (
    <div className="p-4 flex-1 overflow-y-auto">
      <div className="max-w-container-max mx-auto bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
        <div className="timetable-grid">
          <div className="bg-surface border-b border-r border-outline-variant" />
          {weekDays.map((day, col) => (
            <div
              key={day.iso}
              className={`bg-surface border-b ${
                col < weekDays.length - 1 ? "border-r " : ""
              }border-outline-variant p-2 text-center font-label-caps text-label-caps text-secondary flex flex-col justify-center`}
            >
              <span className="font-bold text-on-surface">{day.label}</span>
              <span>{day.date}</span>
            </div>
          ))}
          {hours.map((hour) => {
            return (
              <Fragment key={hour}>
                <div className="time-label font-label-caps text-label-caps">
                  {formatHour(hour)}
                </div>
                {weekDays.map((day, col) => {
                  const dayOfWeek = GRID_DAYS[col];
                  const slot = slotsByStart.get(`${dayOfWeek}:${hour}`);
                  const cellBorder =
                    col === weekDays.length - 1
                      ? "border-b border-surface-container-low"
                      : "border-r border-b border-surface-container-low";

                  if (slot) {
                    const { startRow, span } = slotSpan(slot);
                    const editable = canEdit(slot);
                    return (
                      <div
                        key={`${hour}-${col}`}
                        className={`grid-cell relative ${cellBorder}`}
                        style={{
                          gridRow: `${startRow} / span ${span}`,
                          gridColumn: col + 2,
                        }}
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
                            className="absolute top-8 left-full ml-2 w-44 bg-surface-container-lowest border border-outline-variant rounded shadow-sm z-50 flex flex-col"
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
                            {!editable && (
                              <button
                                className="text-left px-3 py-2 font-body-sm text-body-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2"
                                onClick={() =>
                                  setModal({ kind: "swap", slot })
                                }
                              >
                                <Icon name="swap_horiz" size={16} /> Demander un
                                échange
                              </button>
                            )}
                            {editable && (
                              <>
                                <div className="h-px bg-outline-variant w-full" />
                                <ConfirmButton
                                  action={() => deleteSlot(slot.id)}
                                  confirmText="Confirmer"
                                  className="justify-start px-3 py-2 w-full"
                                >
                                  Supprimer
                                </ConfirmButton>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const covered = slots.some(
                    (s) =>
                      s.day_of_week === dayOfWeek &&
                      Math.floor(minutesOfDay(s.start_time) / 60) < hour &&
                      hour < Math.ceil(minutesOfDay(s.end_time) / 60)
                  );
                  if (covered) return null;

                  return (
                    <div
                      key={`${hour}-${col}`}
                      className={`grid-cell ${cellBorder}`}
                      onClick={() =>
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
        </div>
      </div>

      {modal?.kind === "create" && (
        <ConfigModal
          mode="create"
          classId={classId}
          subjects={subjects}
          teachers={teachers}
          dayOfWeek={modal.day}
          defaultStart={modal.start}
          defaultEnd={modal.end}
          currentUserId={user.id}
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
          dayOfWeek={modal.slot.day_of_week}
          defaultStart={modal.slot.start_time}
          defaultEnd={modal.slot.end_time}
          slot={modal.slot}
          currentUserId={user.id}
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
