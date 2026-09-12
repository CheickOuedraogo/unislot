import { Icon } from "@/components/ui/Icon";

type BrandProps = {
  showLabel?: boolean;
};

export function Brand({ showLabel = true }: BrandProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
        <Icon name="calendar_month" size={18} />
      </span>
      {showLabel && (
        <span className="text-sm font-semibold tracking-tight text-foreground">
          UniTime
        </span>
      )}
    </span>
  );
}