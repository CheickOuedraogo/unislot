import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

type StatCardProps = {
  label: string;
  value: number;
  href?: string;
  icon: string;
  chipClass: string;
  iconClass: string;
};

export function StatCard({
  label,
  value,
  href,
  icon,
  chipClass,
  iconClass,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <span
          className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${chipClass}`}
        >
          <Icon name={icon} size={22} className={iconClass} />
        </span>
        {href && (
          <Icon
            name="arrow_forward"
            size={18}
            className="text-outline-variant group-hover:text-primary transition-colors"
          />
        )}
      </div>
      <div className="flex flex-col">
        <span className="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">
          {value}
        </span>
        <span className="font-body-sm text-body-sm text-secondary mt-1.5">
          {label}
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group card bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-[0.98]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4">
      {content}
    </div>
  );
}
