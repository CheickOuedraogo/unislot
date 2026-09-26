import type { TeacherStats } from "@/lib/queries";

const PALETTE = [
  "#3525cd",
  "#059669",
  "#d97706",
  "#ba1a1a",
  "#7e3000",
  "#0e7490",
  "#6d28d9",
  "#be185d",
];

export function StatCards({ stats }: { stats: TeacherStats }) {
  const total = Math.round(stats.totalHours * 100) / 100;
  const maxSubject = Math.max(1, ...stats.subjects.map((s) => s.hours));
  const maxClass = Math.max(1, ...stats.classes.map((c) => c.hours));

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl flex flex-col justify-between">
        <h3 className="font-label-caps text-label-caps text-secondary mb-2 uppercase tracking-wider">
          Heures totales
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-display-time text-display-time text-on-background">
            {total}
          </span>
          <span className="font-headline-md text-headline-md text-secondary">h</span>
        </div>
        <p className="font-body-sm text-body-sm text-secondary mt-4">
          Répartition sur l&apos;ensemble des classes.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
        <h3 className="font-label-caps text-label-caps text-secondary mb-2 uppercase tracking-wider">
          Heures par matière
        </h3>
        {stats.subjects.length === 0 ? (
          <p className="font-body-sm text-body-sm text-secondary mt-4">
            Aucune heure planifiée.
          </p>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {stats.subjects.map((s, i) => {
              const color = PALETTE[i % PALETTE.length];
              const percent = Math.max(4, (s.hours / maxSubject) * 100);
              return (
                <div key={s.subject} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-body-sm text-body-sm text-on-background truncate">
                      {s.subject}
                    </span>
                    <span className="font-body-sm text-body-sm font-semibold shrink-0">
                      {Math.round(s.hours * 100) / 100}h
                    </span>
                  </div>
                  <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${percent}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
        <h3 className="font-label-caps text-label-caps text-secondary mb-2 uppercase tracking-wider">
          Heures par classe
        </h3>
        {stats.classes.length === 0 ? (
          <p className="font-body-sm text-body-sm text-secondary mt-4">
            Aucune heure planifiée.
          </p>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {stats.classes.map((c, i) => {
              const color = PALETTE[i % PALETTE.length];
              const percent = Math.max(4, (c.hours / maxClass) * 100);
              return (
                <div key={c.className} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-body-sm text-body-sm text-on-background truncate">
                      {c.className}
                    </span>
                    <span className="font-body-sm text-body-sm font-semibold shrink-0">
                      {Math.round(c.hours * 100) / 100}h
                    </span>
                  </div>
                  <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${percent}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
