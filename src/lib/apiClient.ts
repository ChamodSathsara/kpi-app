import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import type {
  ApiResponse,
  LoginResponse,
  User,
  KpiAssignment,
  CreateKpiRequest,
  EvaluationPeriod,
  TeamMember,
  Competency,
  CompetencyRatingInput,
  AchievementType,
  Achievement,
  ResultDetail,
  AttendanceInput,
  Department,
  DepartmentProgress,
  Designation,
  Role,
  AdminUser,
  CreateUserInput,
  AdminDashboard,
  EvaluationMarkInput,
  SelfEvaluation,
  UserSearchParams,
  PagedResult,
  UpdateUserInput,
  CreateEvaluationPeriodInput,
  UpdateEvaluationPeriodInput,
  UpdateKpiRequest,
  SaveSelfEvaluationRequest,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:5001";

const ACCESS_TOKEN_KEY = "kpi_access_token";
const REFRESH_TOKEN_KEY = "kpi_refresh_token";
const USER_KEY = "kpi_user";

/**
 * ApiClient centralizes every HTTP call the app makes. All axios usage lives
 * here — feature code should never import axios directly.
 */
class ApiClient {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    this.http.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.http.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearSession();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ---------- token / session storage ----------
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  setSession(data: LoginResponse) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  clearSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private async get<T>(url: string, config?: AxiosRequestConfig) {
    const res = await this.http.get<ApiResponse<T>>(url, config);
    return res.data;
  }
  private async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    const res = await this.http.post<ApiResponse<T>>(url, body, config);
    return res.data;
  }
  private async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    const res = await this.http.put<ApiResponse<T>>(url, body, config);
    return res.data;
  }
  private async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    const res = await this.http.patch<ApiResponse<T>>(url, body, config);
    return res.data;
  }
  private async del<T>(url: string, config?: AxiosRequestConfig) {
    const res = await this.http.delete<ApiResponse<T>>(url, config);
    return res.data;
  }

  // ===================== AUTH =====================
  login(email: string, password: string) {
    return this.post<LoginResponse>("/api/auth/login", { email, password });
  }
  logout() {
    return this.post<null>("/api/auth/logout");
  }
  changePassword(currentPassword: string, newPassword: string , ConfirmNewPassword: string) {
    return this.post<null>("/api/auth/change-password", { currentPassword, newPassword, ConfirmNewPassword });
  }
  getProfile() {
    return this.get<User>("/api/auth/profile");
  }

  // ===================== KPIs (Employee) =====================
  getMyKpis() {
    return this.get<KpiAssignment[]>("/api/kpis/my");
  }
  getKpiById(assignmentId: number) {
    return this.get<KpiAssignment>(`/api/kpis/${assignmentId}`);
  }
  saveSelfEvaluation(payload: SaveSelfEvaluationRequest ) {
  return this.post<SelfEvaluation>("/api/self-evaluations/save", payload);
}
submitSelfEvaluation(payload: SaveSelfEvaluationRequest) {
  return this.post<SelfEvaluation>("/api/self-evaluations/submit", payload);
}
  getSelfEvaluation(assignmentId: number) {
    return this.get<SelfEvaluation>(`/api/self-evaluations/${assignmentId}`);
  }
  getResult(assignmentId: number) {
    return this.get<ResultDetail>(`/api/results/${assignmentId}`);
  }

 // ===================== Team (HOD / Supervisor) =====================
getMyTeam() {
    return this.get<TeamMember[]>("/api/team/my-team");
  }
  getTeamKpis() {
    return this.get<KpiAssignment[]>("/api/kpis/my-team");
  }
  getKpisForEmployee(employeeId: number) {
    return this.get<KpiAssignment[]>(`/api/kpis/employee/${employeeId}`);
  }
  createKpi(payload: CreateKpiRequest) {
    return this.post<KpiAssignment>("/api/kpis", payload);
  }
  updateKpi(assignmentId: number, payload: UpdateKpiRequest) {
    return this.put<KpiAssignment>(`/api/kpis/${assignmentId}`, payload);
  }
  deleteKpi(assignmentId: number) {
    return this.del<null>(`/api/kpis/${assignmentId}`);
  }
  publishKpi(assignmentId: number) {
    return this.post<KpiAssignment>(`/api/kpis/${assignmentId}/publish`);
  }
  revertKpiToDraft(assignmentId: number) {
    return this.post<KpiAssignment>(`/api/kpis/${assignmentId}/draft`);
  }

// ===================== Evaluation Periods =====================
  getEvaluationPeriods() {
    return this.get<EvaluationPeriod[]>("/api/evaluation-periods");
  }
  createEvaluationPeriod(payload: CreateEvaluationPeriodInput) {
    return this.post<EvaluationPeriod>("/api/evaluation-periods", payload);
  }
  updateEvaluationPeriod(periodId: number, payload: UpdateEvaluationPeriodInput) {
    return this.put<EvaluationPeriod>(`/api/evaluation-periods/${periodId}`, payload);
  }
  deleteEvaluationPeriod(periodId: number) {
    return this.del<null>(`/api/evaluation-periods/${periodId}`);
  }
  activateEvaluationPeriod(periodId: number) {
    return this.patch<EvaluationPeriod>(`/api/evaluation-periods/${periodId}/activate`);
  }

  // ===================== Competencies =====================
  getCompetencies() {
    return this.get<Competency[]>("/api/competencies");
  }
  saveCompetencyEvaluation(assignmentId: number, evaluatorRole: string, ratings: CompetencyRatingInput[]) {
    return this.post<{ competencyEvaluationId: number; assignmentId: number; averageScore: number }>(
      "/api/competency-evaluations",
      { assignmentId, evaluatorRole, ratings }
    );
  }
  updateCompetencyEvaluation(id: number, evaluatorRole: string, assignmentId: number, ratings: CompetencyRatingInput[]) {
    return this.put(`/api/competency-evaluations/${id}`, { assignmentId, evaluatorRole, ratings });
  }

  // ===================== Supervisor / HOD evaluations =====================
  // saveSupervisorEvaluation(assignmentId: number, marks: EvaluationMarkInput[]) {
  //   return this.post("/api/supervisor-evaluations", { assignmentId, marks });
  // }

  saveSupervisorEvaluation(assignmentId: number, details: EvaluationMarkInput[]) {
  return this.post(`/api/supervisor-evaluations/${assignmentId}`, { details });
}



  updateSupervisorEvaluation(id: number, assignmentId: number, marks: EvaluationMarkInput[]) {
    return this.put(`/api/supervisor-evaluations/${id}`, { assignmentId, marks });
  }
  submitSupervisorEvaluation(id: number) {
    return this.post(`/api/supervisor-evaluations/${id}/submit`);
  }
  // saveHodEvaluation(assignmentId: number, marks: EvaluationMarkInput[]) {
  //   return this.post("/api/hod-evaluations", { assignmentId, marks });
  // }

  saveHodEvaluation(selfEvaluationId: number, details: EvaluationMarkInput[]) {
  return this.post(`/api/hod-evaluations`, { selfEvaluationId, details });
}
//   saveHodEvaluation(assignmentId: number, details: EvaluationMarkInput[]) {
//   return this.post(`/api/hod-evaluations/${assignmentId}`, { details });
// }
  // updateHodEvaluation(id: number, assignmentId: number, marks: EvaluationMarkInput[]) {
  //   return this.put(`/api/hod-evaluations/${id}`, { assignmentId, marks });
  // }

  updateHodEvaluation(hodEvaluationId: number, details: EvaluationMarkInput[]) {
  return this.put(`/api/hod-evaluations/${hodEvaluationId}`, { details });
}
  submitHodEvaluation(id: number) {
    return this.post(`/api/hod-evaluations/${id}/submit`);
  }

  // ===================== Achievements =====================
  getAchievementTypes() {
    return this.get<AchievementType[]>("/api/achievement-types");
  }
  addAchievement(payload: Omit<Achievement, "achievementId">) {
    return this.post<Achievement>("/api/achievements", payload);
  }
  updateAchievement(id: number, payload: Partial<Achievement>) {
    return this.put<Achievement>(`/api/achievements/${id}`, payload);
  }
  deleteAchievement(id: number) {
    return this.del<null>(`/api/achievements/${id}`);
  }
  uploadAchievementFile(achievementId: number, file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("achievementId", String(achievementId));
    return this.post<{ fileUrl: string; fileName: string }>("/api/achievements/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // ===================== Grade / Recommendation / Attendance =====================
  processGrade(hodEvaluationId: number) {
    return this.post(`/api/evaluation-results/process/${hodEvaluationId}`);
  }
  addRecommendation(assignmentId: number, recommendationType: string, comment: string) {
    return this.post("/api/recommendations", { assignmentId, recommendationType, comment });
  }
  addAttendance(payload: AttendanceInput) {
    return this.post("/api/attendance", payload);
  }
  updateAttendance(id: number, payload: AttendanceInput) {
    return this.put(`/api/attendance/${id}`, payload);
  }

  // ===================== Reports =====================
  getReportPdfUrl(resultId: number) {
    return `${BASE_URL}/api/reports/export/pdf/${resultId}`;
  }
  getReportExcelUrl(resultId: number) {
    return `${BASE_URL}/api/reports/export/excel/${resultId}`;
  }
  async downloadReport(resultId: number, format: "pdf" | "excel") {
    const url = format === "pdf" ? this.getReportPdfUrl(resultId) : this.getReportExcelUrl(resultId);
    const res = await this.http.get(url, { responseType: "blob" });
    return res.data as Blob;
  }

  // ===================== Departments (Manager / CEO / Admin) =====================
  getDepartments() {
    return this.get<Department[]>("/api/departments");
  }
  getDepartmentEmployees(departmentId: number) {
    return this.get<TeamMember[]>(`/api/departments/${departmentId}/employees`);
  }
  getDepartmentProgress(departmentId: number, periodId: number) {
    return this.get<DepartmentProgress>(`/api/departments/${departmentId}/progress?periodId=${periodId}`);
  }
  getEvaluationDetail(assignmentId: number) {
    return this.get<ResultDetail>(`/api/evaluation-detail/${assignmentId}`);
  }

  // ===================== Admin: Dashboard =====================
  getAdminDashboard() {
    return this.get<AdminDashboard>("/api/dashboard/admin");
  }

  // ===================== Admin: Users =====================
  getUsers(params?: UserSearchParams) {
    return this.get<PagedResult<AdminUser>>("/api/users", { params });
  }
  getManagementUsers() {
    return this.get<AdminUser[]>("/api/users/management");
  }
  getUser(userId: number) {
    return this.get<AdminUser>(`/api/users/${userId}`);
  }
  createUser(payload: CreateUserInput) {
    return this.post<{ userId: number; employeeNo: string; email: string; temporaryPassword: string }>(
      "/api/users",
      payload
    );
  }
  updateUser(userId: number, payload: UpdateUserInput) {
    return this.put<null>(`/api/users/${userId}`, payload);
  }
  updateUserStatus(userId: number, isActive: boolean) {
    return this.patch<null>(`/api/users/${userId}/status`, { isActive });
  }
  deleteUser(userId: number) {
    return this.del<null>(`/api/users/${userId}`);
  }

  // ===================== Admin: Departments (CRUD) =====================
  createDepartment(departmentName: string, isActive: boolean) {
    return this.post<Department>("/api/departments", { departmentName, isActive });
  }
  updateDepartment(departmentId: number, departmentName: string, isActive: boolean) {
    return this.put<Department>(`/api/departments/${departmentId}`, { departmentName, isActive });
  }
  deleteDepartment(departmentId: number) {
    return this.del<null>(`/api/departments/${departmentId}`);
  }

  // ===================== Admin: Designations (CRUD) =====================
  getDesignations() {
    return this.get<Designation[]>("/api/designations");
  }
  createDesignation(designationName: string, isActive: boolean) {
    return this.post<Designation>("/api/designations", { designationName, isActive });
  }
  updateDesignation(designationId: number, designationName: string, isActive: boolean) {
    return this.put<Designation>(`/api/designations/${designationId}`, { designationName, isActive });
  }
  deleteDesignation(designationId: number) {
    return this.del<null>(`/api/designations/${designationId}`);
  }

  // ===================== Roles =====================
  getRoles() {
    return this.get<Role[]>("/api/roles");
  }

  saveCompetencyScore(hodEvaluationId: number, competencyId: number, score: number, remarks: string) {
  return this.post(
    `/api/competency-evaluations?hodEvaluationId=${hodEvaluationId}`,
    { competencyId, score, remarks },
  );
}
updateCompetencyScore(id: number, competencyId: number, score: number, remarks: string) {
  return this.put(`/api/competency-evaluations/${id}`, { competencyId, score, remarks });
}
getCompetencyScoresForHodEvaluation(hodEvaluationId: number) {
  return this.get<{ competencyEvaluationId: number; competencyId: number; score: number; remarks: string }[]>(
    `/api/competency-evaluations/${hodEvaluationId}`,
  );
}
}

export const apiClient = new ApiClient();
export default apiClient;
