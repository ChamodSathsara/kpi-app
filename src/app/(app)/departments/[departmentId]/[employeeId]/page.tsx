"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import type { KpiAssignment, ResultDetail } from "@/types";
import { PageHeader, GradeBadge, StatusBadge } from "@/components/shared/display";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendanceForm, ReportButtons } from "@/components/evaluation/grade-and-actions";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ManagerEmployeeDetailPage() {
  const params = useParams<{ departmentId: string; employeeId: string }>();
  const employeeId = Number(params.employeeId);

  const [assignment, setAssignment] = useState<KpiAssignment | null>(null);
  const [result, setResult] = useState<ResultDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const kpiRes = await apiClient.getKpisForEmployee(employeeId);
      const latest = kpiRes.data[0] ?? null;
      setAssignment(latest);
      if (latest) {
        const res = await apiClient.getEvaluationDetail(latest.assignmentId);
        setResult(res.data);
      }
    } catch {
      toast.error("Could not load employee evaluation.");
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) load();
  }, [employeeId, load]);

  async function handleSaveAttendance(input: {
    attendancePercentage: number;
    presentDays: number;
    absentDays: number;
    marksDeduction: number;
    comment: string;
  }) {
    if (!assignment) return;
    try {
      await apiClient.addAttendance({ assignmentId: assignment.assignmentId, ...input });
      toast.success("Attendance saved and re-submitted.");
      load();
    } catch {
      toast.error("Could not save attendance.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/departments/${params.departmentId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Employees
      </Link>

      {!assignment ? (
        <p className="text-sm text-muted-foreground">No KPI assignment found for this employee yet.</p>
      ) : (
        <div className="space-y-6">
          <PageHeader
            title={assignment.employeeName ?? "Employee"}
            description={assignment.periodName}
            action={
              <div className="flex items-center gap-2">
                <StatusBadge status={assignment.status} />
                <GradeBadge grade={result?.grade ?? null} />
              </div>
            }
          />

          <Card>
            <CardHeader>
              <CardTitle>KPI marks</CardTitle>
              <CardDescription>{result?.kpiEvaluation.weightPercentage ?? 80}% of final grade</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>KPI</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Self</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>HOD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(result?.kpiEvaluation.details ?? assignment.details).map((d) => (
                    <TableRow key={d.detailId}>
                      <TableCell className="max-w-[220px] truncate font-medium">{d.kpiName}</TableCell>
                      <TableCell className="font-mono-data text-xs">{d.weightPercentage}%</TableCell>
                      <TableCell className="font-mono-data">{d.employeeScore ?? "—"}</TableCell>
                      <TableCell className="font-mono-data">{d.supervisorScore ?? "—"}</TableCell>
                      <TableCell className="font-mono-data">{d.hodScore ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {result?.hodComment && (
            <Card>
              <CardHeader>
                <CardTitle>HOD comment</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">{result.hodComment}</CardContent>
            </Card>
          )}

          <AttendanceForm
            initial={
              result?.attendance
                ? {
                    attendancePercentage: result.attendance.attendancePercentage,
                    presentDays: 0,
                    absentDays: 0,
                    marksDeduction: result.attendance.marksDeduction,
                    comment: "",
                  }
                : undefined
            }
            onSave={handleSaveAttendance}
          />

          {result?.grade && <ReportButtons resultId={assignment.assignmentId} />}
        </div>
      )}
    </div>
  );
}
