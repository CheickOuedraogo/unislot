import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { TeacherAssignment } from "@/lib/queries";

const ACCENTS = [
  "bg-primary",
  "bg-tertiary",
  "bg-error",
  "bg-secondary",
  "bg-primary-fixed-dim",
];

export function ClassCards({ classes }: { classes: TeacherAssignment[] }) {
  return (
    <section className="flex flex-col gap-4 mt-4">
      <h2 className="font-headline-md text-headline-md text-on-background">
        Mes classes
      </h2>
      {classes.length === 0 ? (
        <p className="font-body-sm text-body-sm text-secondary">
          Aucune classe assignée pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {classes.map((cls, i) => (
            <div
              key={cls.classId}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col gap-4 hover:border-primary transition-all duration-200 relative group overflow-hidden"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  ACCENTS[i % ACCENTS.length]
                }`}
              />
              <div className="flex justify-between items-start pl-2">
                <div>
                  {cls.level && (
                    <span className="inline-block px-2 py-1 bg-surface-container text-on-surface font-label-caps text-label-caps rounded mb-2 uppercase">
                      {cls.level}
                    </span>
                  )}
                  <h4 className="font-headline-md text-headline-md text-on-background">
                    {cls.className}
                  </h4>
                  <p className="font-body-sm text-body-sm text-secondary mt-1">
                    {cls.subjects.map((s) => s.name).join(", ")}
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-4 flex justify-end">
                <Link href={`/timetable?class=${cls.classId}`}>
                  <Button icon="calendar_today" iconSize={18}>
                    Voir le calendrier
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
