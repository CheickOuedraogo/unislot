import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getDirectorStats, getClassesWithStats } from "@/lib/queries";
import { getSwapRequestsForDirector } from "@/lib/actions/swaps";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/director/StatCard";
import { CreateClassForm } from "@/components/director/CreateClassForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/Icon";
import {
  formatDayOfWeek,
  formatDayDate,
  formatTime,
  getMonday,
} from "@/lib/utils";

function todayLabel(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default async function DirectorPage() {
  const user = await requireRole("director");
  const [stats, classes, swapRequests] = await Promise.all([
    getDirectorStats(),
    getClassesWithStats(),
    getSwapRequestsForDirector(),
  ]);

  const pending = swapRequests
    .filter((r) => r.status === "pending")
    .slice(0, 5);

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/director")}
    >
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bonjour, {user.first_name || user.name}
        </h1>
        <p className="text-sm text-muted-foreground capitalize">
          {todayLabel()}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Enseignants"
          value={stats.teachers}
          icon="school"
          href="/director/teachers"
          accent="primary"
        />
        <StatCard
          label="Classes"
          value={stats.classes}
          icon="groups"
          href="/director"
          accent="tertiary"
        />
        <StatCard
          label="Matières"
          value={stats.subjects}
          icon="menu_book"
          href="/director"
          accent="error"
        />
        <StatCard
          label="Demandes en attente"
          value={pending.length}
          icon="swap_horiz"
          href="/director/swaps"
          accent="success"
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Demandes à traiter
          </h2>
          <Link
            href="/director/swaps"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Voir toutes les demandes
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>

        {pending.length === 0 ? (
          <Card className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <Icon name="check_circle" size={20} className="text-success" />
            Aucune demande en attente. Tout est à jour.
          </Card>
        ) : (
          <Card className="p-0 divide-y divide-border">
            {pending.map((r) => (
              <Link
                key={r.id}
                href="/director/swaps"
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initials(r.requesting_teacher_name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {r.requesting_teacher_name} propose {r.proposed_subject_name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {r.slot_subject_name} de {r.owner_name} · {r.class_name} ·{" "}
                    {formatDayOfWeek(r.slot_day)}{" "}
                    {formatDayDate(r.slot_day, getMonday())}{" "}
                    {formatTime(r.slot_start)}–{formatTime(r.slot_end)}
                  </span>
                </span>
                <Icon
                  name="chevron_right"
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />
              </Link>
            ))}
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Classes
          </h2>
          <CreateClassForm />
        </div>
        {classes.length === 0 ? (
          <Card className="p-5 text-sm text-muted-foreground">
            Aucune classe pour le moment.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => (
              <Card
                key={c.id}
                className="flex flex-col justify-between gap-4 p-5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {c.level && (
                      <Badge variant="outline" className="mb-2">
                        {c.level}
                      </Badge>
                    )}
                    <h3 className="truncate text-base font-semibold text-foreground">
                      <Link
                        href={`/director/classes/${c.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {c.name}
                      </Link>
                    </h3>
                  </div>
                  <Link
                    href={`/timetable?class=${c.id}`}
                    aria-label={`Emploi du temps de ${c.name}`}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                  >
                    <Icon name="calendar_month" size={20} />
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    <Icon name="menu_book" size={14} />
                    {c.subjectCount} matière{c.subjectCount > 1 ? "s" : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    <Icon name="person" size={14} />
                    {c.teacherCount} prof{c.teacherCount > 1 ? "s" : ""}
                  </span>
                </div>

                <Link href={`/timetable?class=${c.id}`} className="w-full">
                  <Button variant="secondary" className="w-full">
                    Voir l&apos;emploi du temps
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}