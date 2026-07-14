// ===== Shared =====
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type RoleId = 1 | 2 | 3 | 4 | 5 | 6;
export const ROLE = {
  ADMIN: 1,
  CEO: 2,
  MANAGER: 3,
  HOD: 4,
  SUPERVISOR: 5,
  EMPLOYEE: 6,
} as const;

export const ROLE_NAME: Record<number, string> = {
  1: "Admin",
  2: "CEO",
  3: "Manager",
  4: "HOD",
  5: "Supervisor",
  6: "Employee",
};

// ===== Auth =====
export interface User {
  userId: number;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  roleName: string;
  departmentId: number | null;
  departmentName: string | null;
  designationId: number | null;
  designationName: string | null;
  reportsTo: number | null;
  isActive: boolean;
  createdDate?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  user: User;
}

// ===== KPI =====
export interface KpiDetail {
  detailId: number;
  kpiName: string;
  description: string;
  weightPercentage: number;
  employeeScore?: number;
  supervisorScore?: number;
  hodScore?: number;
}

export interface KpiAssignment {
  assignmentId: number;
  employeeId: number;
  employeeName: string | null;
  createdBy: number;
  createdByName: string | null;
  periodId: number;
  periodName: string;
  status: "Draft" | "Published" | "Completed" | string;
  totalWeight: number;
  createdDate: string;
  details: KpiDetail[];
}

export interface CreateKpiDetailInput {
  kpiName: string;
  description: string;
  weightPercentage: number;
}

export interface CreateKpiRequest {
  employeeId: number;
  periodId: number;
  details: CreateKpiDetailInput[];
}

// ===== Self / Supervisor / HOD Evaluations =====
export interface EvaluationMarkInput {
  detailId: number;
  score: number;
}

export interface SelfEvaluation {
  evaluationId: number;
  assignmentId: number;
  employeeId?: number;
  status: string;
  totalScore?: number;
  submittedDate?: string;
  kpiDetails?: KpiDetail[];
}

// ===== Periods =====
export interface EvaluationPeriod {
  periodName: ReactNode;
  periodId: number;
  name: string;
  year: number;
  startDate: string; // DateOnly serializes as "yyyy-MM-dd"
  endDate: string;
  status: string; // e.g. "Draft" | "Active" | "Completed" — confirm exact values with backend
}

export interface CreateEvaluationPeriodInput {
  name: string;
  year: number;
  startDate: string;
  endDate: string;
}

export interface UpdateEvaluationPeriodInput {
  name: string;
  year: number;
  startDate: string;
  endDate: string;
}

// ===== Team =====
export interface TeamMember {
  employeeId: number;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  designationName: string;
  departmentName: string;
  isActive: boolean;
  hasKpis: boolean;
  kpiStatus: string | null;
}

// ===== Competencies =====
export interface Competency {
  competencyId: number;
  name: string;
}

export interface CompetencyRatingInput {
  competencyId: number;
  score: number;
}

export const COMPETENCY_SCALE = [
  { value: 1, label: "Need Improvement" },
  { value: 2, label: "Meets Minimum Requirements Of Position" },
  { value: 3, label: "Averagely Meets Requirements" },
  { value: 4, label: "Consistently Meets Requirements" },
  { value: 5, label: "Consistently Exceeds Requirements" },
];

// ===== Achievements =====
export interface AchievementType {
  typeId: number;
  typeName: string;
}

export interface Achievement {
  achievementId: number;
  assignmentId: number;
  typeId: number;
  typeName?: string;
  description: string;
  achievedDate?: string;
  score: number;
  fileUrl?: string;
}

// ===== Results =====
export interface ResultDetail {
  assignmentId: number;
  employeeId: number;
  employeeName: string;
  employeeNo?: string;
  designation?: string;
  department?: string;
  periodName: string;
  grade: string | null;
  status: string;
  kpiEvaluation: {
    weightPercentage: number;
    totalScore?: number;
    score?: number;
    details: KpiDetail[];
  };
  competencies: {
    weightPercentage: number;
    score: number;
    details?: {
      competencyId: number;
      name: string;
      employeeRating?: number;
      supervisorRating?: number;
      hodRating?: number;
    }[];
  };
  achievements: {
    weightPercentage: number;
    score: number;
    details?: Achievement[];
  };
  attendance?: {
    attendancePercentage: number;
    marksDeduction: number;
  };
  recommendation?: string;
  hodComment?: string;
}

// ===== Attendance =====
export interface AttendanceInput {
  assignmentId: number;
  attendancePercentage: number;
  presentDays: number;
  absentDays: number;
  marksDeduction: number;
  comment: string;
}

// ===== Departments =====
export interface Department {
  departmentId: number;
  departmentName: string;
  isActive?: boolean;
  createdDate?: string;
  employeeCount?: number;
  hodId?: number;
  hodName?: string;
  supervisorId?: number;
  supervisorName?: string;
  gradeCompletionPercentage?: number;
  attendanceCompletionPercentage?: number;
  averageGrade?: string;
}

export interface DepartmentProgress {
  departmentId: number;
  departmentName: string;
  periodId: number;
  periodName: string;
  totalEmployees: number;
  employeesWithCompletedGrades: number;
  gradeCompletionPercentage: number;
  attendanceSubmissionPercentage: number;
  averageGrade: string;
  hodName: string;
  supervisorName: string;
}

// ===== Designations =====
export interface Designation {
  designationId: number;
  designationName: string;
  isActive: boolean;
}

// ===== Roles =====
export interface Role {
  roleId: number;
  roleName: string;
}

// ===== Admin / Users =====
export interface AdminUser {
  userId: number;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  roleName: string;
  departmentId: number | null;
  departmentName: string | null;
  designationId: number | null;
  designationName: string | null;
  reportsTo: number | null;
  managerName: string | null;
  isActive: boolean;
  createdDate?: string;
}

export interface CreateUserInput {
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
  departmentId: number | null;
  designationId: number | null;
  reportsTo: number | null;
}

export interface AdminDashboard {
  totalEmployees: number;
  totalDepartments: number;
  activeEvaluationPeriods: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  completionPercentage: number;
  departmentSummary: { departmentName: string; employeeCount: number; completionPercentage: number }[];
  recentActivities: { activityId: number; description: string; timestamp: string; performedBy: string }[];
}
export interface UpdateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  departmentId: number | null;
  designationId: number | null;
  reportsTo: number | null;
}

export interface UserSearchParams {
  keyword?: string;
  roleId?: number;
  departmentId?: number;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}