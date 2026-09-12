import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  getSlotsForClass,
  getSubjectsForClass,
  getTeacherAssignments,
  getTeacherStats,
  getAllTeachers,
  getClassSubjectTeachers,
} from "@/lib/queries";
import { getMySwapRequests } from "@/lib/actions/swaps";
import { navItemsFor } from "@/lib/nav";
import { parseWeekStart, formatWeekRange } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { StatCards } from "@/components/teacher/StatCards";
import { MySwapRequests } from "@/components/teacher/MySwapRequests";
import { ClassSelector } from "@/components/timetable/ClassSelector";
import { WeekNavigator } from "@/components/timetable/WeekNavigator";
import { TimetableClient } from "@/components/timetable/TimetableClient";
import { ExportPdfButton } from "@/components/timetable/ExportPdfButton";

export const metadata: Metadata = {
  title: "Tableau de bord enseignant",
};

type Props = {
  searchParams: Promise<{ class?: string; week?: string }>;
};

export default async function TeacherDashboard({ searchParams }: Props) {
  const user = await requireRole("teacher");
  const { class: classParam, week } = await searchParams;
  const weekStart = parseWeekStart(week);

  const [assignments, stats, myRequests] = await Promise.all([
    getTeacherAssignments(user.id),
    getTeacherStats(user.id),
    getMySwapRequests(),
  ]);

  const classes = assignments.map((a) => ({
    id: a.classId,
    name: a.className,
    level: a.level,
  }));
  const selectedId = classes.some((c) => c.id === classParam)
    ? classParam!
    : classes[0]?.id ?? "";

  const selectedClass = classes.find((c) => c.id === selectedId);

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/teacher")}
    >
      <section className="flex flex-col gap-2">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-background">
          Tableau de bord enseignant
        </h1>
        <p className="font-body-lg text-body-lg text-secondary">
          Aperçu de votre emploi du temps et de vos heures.
        </p>
      </section>

      {!selectedId ? (
        <section className="card p-6">
          <p className="font-body-sm text-body-sm text-secondary">
            Aucune classe assignée pour le moment.
          </p>
        </section>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Mon emploi du temps
                {selectedClass && (
                  <span className="text-secondary">
                    {" "}
                    — {selectedClass.name}
                  </span>
                )}
              </h2>
              <WeekNavigator
                weekStart={weekStart.toISOString().slice(0, 10)}
                classId={selectedId}
                label={formatWeekRange(weekStart)}
                basePath="/teacher"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ClassSelector
                classes={classes}
                selectedId={selectedId}
                weekStart={weekStart.toISOString().slice(0, 10)}
                basePath="/teacher"
              />
              <ExportPdfButton
                slots={await getSlotsForClass(selectedId)}
                className={selectedClass?.name ?? ""}
                weekLabel={formatWeekRange(weekStart)}
              />
            </div>
          </div>

          <TimetableClient
            slots={await getSlotsForClass(selectedId)}
            subjects={await getSubjectsForClass(user, selectedId)}
            teachers={await getAllTeachers()}
            subjectTeachers={await getClassSubjectTeachers(selectedId)}
            classId={selectedId}
            weekStart={weekStart.toISOString().slice(0, 10)}
            user={{ id: user.id, role: user.role, name: user.name }}
          />
        </>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-headline-md text-headline-md text-on-background">
          Mes demandes
        </h2>
        <MySwapRequests
          requests={myRequests}
          weekStart={weekStart.toISOString().slice(0, 10)}
        />
      </section>

      <div className="mt-2">
        <StatCards stats={stats} />
      </div>
    </AppShell>
  );
}
