import { Badge } from "@/components/ui/badge";

export function TeacherStatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <Badge className="gap-1 bg-success/10 text-success">
        <span className="size-1.5 rounded-full bg-current" />
        Actif
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1">
      <span className="size-1.5 rounded-full bg-current" />
      Inactif
    </Badge>
  );
}