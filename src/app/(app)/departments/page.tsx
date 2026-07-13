"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import type { Department } from "@/types";
import { PageHeader, EmptyState } from "@/components/shared/display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, ChevronRight } from "lucide-react";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[] | null>(null);

  useEffect(() => {
    apiClient
      .getDepartments()
      .then((res) => setDepartments(res.data))
      .catch(() => setDepartments([]));
  }, []);

  return (
    <div>
      <PageHeader title="Departments" description="Grade and attendance completion across departments." />

      {!departments && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading departments…
        </div>
      )}

      {departments && departments.length === 0 && (
        <EmptyState title="No departments found" />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments?.map((d) => (
          <Link key={d.departmentId} href={`/departments/${d.departmentId}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{d.departmentName}</CardTitle>
                  {d.averageGrade && <Badge variant="secondary">Avg {d.averageGrade}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> {d.employeeCount ?? "—"} employees · HOD{" "}
                  {d.hodName ?? "—"} · Supervisor {d.supervisorName ?? "—"}
                </p>
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Grades generated</span>
                    <span className="font-mono-data font-medium">{d.gradeCompletionPercentage ?? 0}%</span>
                  </div>
                  <Progress value={d.gradeCompletionPercentage ?? 0} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Attendance submitted</span>
                    <span className="font-mono-data font-medium">
                      {d.attendanceCompletionPercentage ?? 0}%
                    </span>
                  </div>
                  <Progress value={d.attendanceCompletionPercentage ?? 0} indicatorClassName="bg-accent" />
                </div>
                <div className="flex items-center justify-end text-sm font-medium text-primary">
                  View employees <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
