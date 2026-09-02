import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getDirectorStats, getClassesWithStats } from "@/lib/queries";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/director/StatCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function todayLabel(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function DirectorPage() {
  const user = await requireRole("director");
  const [stats, classes] = await Promise.all([
    getDirectorStats(),
    getClassesWithStats(),
  ]);

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/director")}
    >
      <section className="flex flex-col gap-1">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-background">
          Bonjour, {user.first_name || user.name}
        </h1>
        <p className="font-body-sm text-body-sm text-secondary capitalize">
          {todayLabel()}
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Enseignants"
          value={stats.teachers}
          icon="school"
          href="/director/teachers"
          chipClass="bg-primary/10"
          iconClass="text-primary"
        />
        <StatCard
          label="Classes"
          value={stats.classes}
          icon="groups"
          href="/director/classes"
          chipClass="bg-tertiary/10"
          iconClass="text-tertiary"
        />
        <StatCard
          label="Matières"
          value={stats.subjects}
          icon="menu_book"
          href="/director/classes"
          chipClass="bg-error/10"
          iconClass="text-error"
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-background">
            Classes
          </h2>
          <Link
            href="/director/classes"
            className="font-body-sm text-body-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Gérer les classes
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>
        {classes.length === 0 ? (
          <p className="font-body-sm text-body-sm text-secondary">
            Aucune classe pour le moment.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => {
              return (
                <div
                  key={c.id}
                  className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 hover:border-primary hover:shadow-md transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-2 min-w-0">
                      <h3 className="font-headline-md text-headline-md text-on-surface truncate">
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
                      className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors"
                    >
                      <Icon name="calendar_month" size={20} />
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-surface-container rounded-full px-3 py-1 font-body-sm text-body-sm text-on-surface-variant">
                      <Icon name="menu_book" size={14} />
                      {c.subjectCount} matière{c.subjectCount > 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-surface-container rounded-full px-3 py-1 font-body-sm text-body-sm text-on-surface-variant">
                      <Icon name="person" size={14} />
                      {c.teacherCount} prof{c.teacherCount > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="mt-auto pt-2">
                    <Link href={`/timetable?class=${c.id}`}>
                      <Button
                        variant="secondary"
                        icon="calendar_today"
                        className="w-full"
                      >
                        Voir l&apos;emploi du temps
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
