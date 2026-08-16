import type { TeacherStats } from "@/lib/queries";

const PALETTE = [
  { bar: "#3525cd", accent: "#3525cd" },
  { bar: "#059669", accent: "#059669" },
  { bar: "#d97706", accent: "#d97706" },
  { bar: "#ba1a1a", accent: "#ba1a1a" },
  { bar: "#7e3000", accent: "#7e3000" },
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
        <h3 className="font-label-caps text-label-caps text-secondary mb-6 uppercase tracking-wider">
          Heures par matière
        </h3>
        {stats.subjects.length === 0 ? (
          <p className="font-body-sm text-body-sm text-secondary">
            Aucune heure planifiée.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 items-end">
            {stats.subjects.map((s, i) => {
              const color = PALETTE[i % PALETTE.length];
              const percent = Math.max(8, (s.hours / maxSubject) * 100);
              return (
                <div key={s.subject} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="font-headline-md text-headline-md text-on-background">
                      {Math.round(s.hours * 100) / 100}h
                    </span>
                  </div>
                  <div className="h-16 w-full bg-surface-container-low rounded-t flex items-end overflow-hidden">
                    <div
                      className="w-full rounded-t"
                      style={{ height: `${percent}%`, backgroundColor: color.bar }}
                    />
                  </div>
                  <span
                    className="font-body-sm text-body-sm font-semibold border-l-4 pl-2"
                    style={{ borderColor: color.accent }}
                  >
                    {s.subject}
                  </span>
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
                  <div className="flex justify-between items-center">
                    <span className="font-body-sm text-body-sm text-on-background">
                      {c.className}
                    </span>
                    <span className="font-body-sm text-body-sm font-semibold">
                      {Math.round(c.hours * 100) / 100}h
                    </span>
                  </div>
                  <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${percent}%`, backgroundColor: color.bar }}
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
