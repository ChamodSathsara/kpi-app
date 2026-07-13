"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import type { AdminDashboard, ApiResponse } from "@/types";
import { PageHeader } from "@/components/shared/display";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Users,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Clock,
} from "lucide-react";

function normalizeDashboard(
  payload: ApiResponse<AdminDashboard> | AdminDashboard | null | undefined,
): AdminDashboard {
  const candidate = payload as
    | { data?: Partial<AdminDashboard> }
    | Partial<AdminDashboard>
    | null
    | undefined;
  const data =
    candidate &&
    typeof candidate === "object" &&
    "data" in candidate &&
    candidate.data !== undefined
      ? candidate.data
      : ((candidate as Partial<AdminDashboard> | null | undefined) ?? {});

  return {
    totalEmployees: data.totalEmployees ?? 0,
    totalDepartments: data.totalDepartments ?? 0,
    activeEvaluationPeriods: data.activeEvaluationPeriods ?? 0,
    completedEvaluations: data.completedEvaluations ?? 0,
    pendingEvaluations: data.pendingEvaluations ?? 0,
    completionPercentage: data.completionPercentage ?? 0,
    departmentSummary: Array.isArray(data.departmentSummary)
      ? data.departmentSummary
      : [],
    recentActivities: Array.isArray(data.recentActivities)
      ? data.recentActivities
      : [],
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);

  useEffect(() => {
    apiClient
      .getAdminDashboard()
      .then((res) => setData(normalizeDashboard(res)))
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading dashboard…
      </div>
    );
  }

  const stats = [
    { label: "Employees", value: data.totalEmployees, icon: Users },
    { label: "Departments", value: data.totalDepartments, icon: Building2 },
    {
      label: "Active periods",
      value: data.activeEvaluationPeriods,
      icon: CalendarCheck2,
    },
    {
      label: "Completed",
      value: data.completedEvaluations,
      icon: CheckCircle2,
    },
    { label: "Pending", value: data.pendingEvaluations, icon: Clock },
  ];
  const departmentSummary = data.departmentSummary ?? [];
  const recentActivities = data.recentActivities ?? [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Organization-wide evaluation progress."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <p className="mt-2 font-mono-data text-2xl font-bold">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall completion</CardTitle>
            <CardDescription>
              {data.completionPercentage}% of evaluations completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={data.completionPercentage} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {departmentSummary.map((d) => (
              <div key={d.departmentName}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{d.departmentName}</span>
                  <span className="font-mono-data text-muted-foreground">
                    {d.completionPercentage}% · {d.employeeCount} people
                  </span>
                </div>
                <Progress value={d.completionPercentage} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((a) => (
              <div key={a.activityId} className="text-sm">
                <p>{a.description}</p>
                <p className="text-xs text-muted-foreground">
                  {a.performedBy} · {new Date(a.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
