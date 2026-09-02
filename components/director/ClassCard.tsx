"use client";

import { useRouter } from "next/navigation";
import { DeleteActionButton } from "./DeleteActionButton";
import { EditClassModal } from "./EditClassModal";
import { deleteClass } from "@/lib/actions/classes";
import type { SchoolClass } from "@/lib/types";

type ClassCardProps = {
  schoolClass: SchoolClass;
};

export function ClassCard({ schoolClass }: ClassCardProps) {
  const router = useRouter();

  const open = () => router.push(`/director/classes/${schoolClass.id}`);

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`Gérer ${schoolClass.name}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex items-center justify-between cursor-pointer hover:border-primary hover:shadow-md transition-all duration-150 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className="flex flex-col min-w-0">
        <span className="font-title-md text-title-md text-on-surface truncate">
          {schoolClass.name}
        </span>
      </div>
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <EditClassModal schoolClass={schoolClass} />
        <DeleteActionButton
          id={schoolClass.id}
          name={schoolClass.name}
          action={deleteClass}
          label={`Supprimer ${schoolClass.name}`}
        />
      </div>
    </div>
  );
}
