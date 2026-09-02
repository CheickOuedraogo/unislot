import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getSlotsForClass } from "@/lib/queries";
import { getSwapRequestsForDirector } from "@/lib/actions/swaps";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { getMonday } from "@/lib/utils";
import {
  DirectorSwapRequests,
  type DaySlots,
} from "@/components/director/DirectorSwapRequests";
import type { Slot } from "@/lib/types";

export const metadata: Metadata = { title: "Demandes" };

export default async function DirectorSwapsPage() {
  const user = await requireRole("director");
  const requests = await getSwapRequestsForDirector();
  const weekStart = getMonday();

  const pendingClassDays = new Set(
    requests.filter((r) => r.status === "pending").map((r) => `${r.class_name}|${r.slot_day}`)
  );

  // Un jeu de créneaux par classe concernée, pour dessiner la journée.
  const classes = [...new Set(requests.map((r) => r.class_name))];
  const daySlotsByClass: Record<string, Record<number, DaySlots>> = {};
  await Promise.all(
    classes.map(async (className) => {
      const needsDays = [...pendingClassDays]
        .filter((k) => k.startsWith(`${className}|`))
        .map((k) => Number(k.split("|")[1]));
      if (needsDays.length === 0) return;
      const classId = requests.find((r) => r.class_name === className)?.class_id;
      if (!classId) return;
      let slots: Slot[] = [];
      try {
        slots = await getSlotsForClass(classId);
      } catch {
        slots = [];
      }
      daySlotsByClass[className] = Object.fromEntries(
        needsDays.map((day) => [
          day,
          {
            day,
            slots: slots
              .filter((s) => s.day_of_week === day)
              .map((s) => ({
                id: s.id,
                subjectName: s.subject_name,
                ownerName: s.professors[0]?.name ?? "",
                startTime: s.start_time.slice(0, 5),
                endTime: s.end_time.slice(0, 5),
              })),
          },
        ])
      );
    })
  );

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/director/swaps")}
    >
      <section className="flex flex-col gap-1">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-background">
          Demandes de modification
        </h1>
        <p className="font-body-sm text-body-sm text-secondary">
          Demandes d&apos;échange ou de reprise de créneaux envoyées par les enseignants.
        </p>
      </section>

      <DirectorSwapRequests
        requests={requests}
        daySlotsByClass={daySlotsByClass}
        weekStart={weekStart.toISOString().slice(0, 10)}
      />
    </AppShell>
  );
}
