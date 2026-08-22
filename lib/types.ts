export type Role = "director" | "teacher";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  first_name: string;
  last_name: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
};

export type SchoolClass = {
  id: string;
  name: string;
  level: string;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
};

export type Subject = {
  id: string;
  name: string;
  usage_count?: number;
};

export type TeacherSubject = {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  teacher_name: string;
  subject_name: string;
  class_name: string;
  class_level?: string;
};

export type CourseType = "cours" | "td" | "tp" | "devoir";

export type Slot = {
  id: string;
  class_id: string;
  subject_id: string;
  type: CourseType;
  day_of_week: number;
  start_time: string;
  end_time: string;
  creator_teacher_id: string;
  subject_name: string;
  class_name: string;
  professors: { id: string; name: string }[];
};

export type SwapRequest = {
  id: string;
  slot_id: string;
  requesting_teacher_id: string;
  message: string;
  proposed_subject_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  requesting_teacher_name: string;
  proposed_subject_name: string;
  slot_subject_name: string;
  slot_day: number;
  slot_start: string;
  slot_end: string;
};
