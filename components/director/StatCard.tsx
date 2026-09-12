import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/Icon";

type Accent = "primary" | "tertiary" | "error" | "success";

const ACCENTS: Record<Accent, string> = {
  primary: "bg-primary/10 text-primary",
  tertiary: "bg-tertiary/10 text-tertiary",
  error: "bg-error/10 text-error",
  success: "bg-success/10 text-success",
};

type StatCardProps = {
  label: string;
  value: number;
  href?: string;
  icon: string;
  accent?: Accent;
};

export function StatCard({
  label,
  value,
  href,
  icon,
  accent = "primary",
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <span
          className={`grid size-11 place-items-center rounded-xl ${ACCENTS[accent]}`}
        >
          <Icon name={icon} size={22} />
        </span>
        {href && (
          <Icon
            name="arrow_forward"
            size={18}
            className="text-outline-variant transition-colors group-hover:text-primary"
          />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl leading-none font-bold tracking-tight text-foreground">
          {value}
        </span>
        <span className="mt-1.5 text-sm text-muted-foreground">{label}</span>
      </div>
    </>
  );

  const cardClass =
    "p-5 transition-all duration-150 hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]";

  if (href) {
    return (
      <Link href={href} className="group flex flex-col">
        <Card className={cardClass}>{content}</Card>
      </Link>
    );
  }

  return <Card className={cardClass}>{content}</Card>;
}