import type { CourseType, Role } from "./types";

export const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;
export const DAY_LABELS_FULL = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

export const GRID_DAYS = [0, 1, 2, 3, 4, 5] as const;

export const START_HOUR = 8;
export const END_HOUR = 18;

export const hours = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i
);

export const courseTypeLabels: Record<CourseType, string> = {
  cours: "Cours",
  td: "TD",
  tp: "TP",
  devoir: "Devoir",
};

export const courseTypeBadgeClass: Record<CourseType, string> = {
  cours: "badge badge-cours",
  td: "badge badge-td",
  tp: "badge badge-tp",
  devoir: "badge badge-devoir",
};

export const courseTypeCardClass: Record<CourseType, string> = {
  cours: "course-card course-type-cours flex flex-col group",
  td: "course-card course-type-td flex flex-col group",
  tp: "course-card course-type-tp flex flex-col group",
  devoir: "course-card course-type-devoir flex flex-col group",
};

export const SESSION_COOKIE = "unislot_session";
export const SESSION_DURATION_DAYS = 30;

export const LEVELS = ["L1", "L2", "L3", "M1", "M2"] as const;

export const ROLE_LABELS: Record<Role, string> = {
  director: "Directeur",
  teacher: "Enseignant",
};
