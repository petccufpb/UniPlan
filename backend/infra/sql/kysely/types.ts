import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface University {
  id: Generated<string>;
  name: string;
  abbreviation: string | null;
}
export interface UniversityCourse {
  id: string;
  title: string;
  abbreviation: string | null;
  departmentId: string;
}
export interface UniversityCurriculum {
  id: Generated<string>;
  title: string;
  abbreviation: string | null;
  universityId: string;
}
export interface UniversityDepartment {
  id: Generated<string>;
  universityId: string;
  name: string;
  abbreviation: string | null;
}
export interface UniversityRequest {
  id: Generated<string>;
  universityId: string | null;
  curriculumId: string | null;
  title: string;
  content: string;
  variables: Record<string, any>;
}
export interface UniversityTerm {
  id: Generated<string>;
  universityId: string;
  name: string | null;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
}
export interface UniversityTermCourse {
  courseId: string;
  termId: string;
  timePeriod: string | null;
  whatsapp: string | null;
}
export interface User {
  id: string;
}
export interface DB {
  University: University;
  UniversityCourse: UniversityCourse;
  UniversityCurriculum: UniversityCurriculum;
  UniversityDepartment: UniversityDepartment;
  UniversityRequest: UniversityRequest;
  UniversityTerm: UniversityTerm;
  UniversityTermCourse: UniversityTermCourse;
  User: User;
}
