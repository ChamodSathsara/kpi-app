"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";
import type { EvaluationPeriod, TeamMember, CreateKpiDetailInput, KpiAssignment, Department } from "@/types";
import { ROLE } from "@/types";
import { PageHeader, StatusBadge } from "@/components/shared/display";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, PlusCircle, Trash2, Send } from "lucide-react";

function CreateKpiInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const preselectedEmployeeId = searchParams.get("employeeId");

  const [periods, setPeriods] = useState<EvaluationPeriod[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>(preselectedEmployeeId ?? "");
  const [periodId, setPeriodId] = useState<string>("");
  const [rows, setRows] = useState<CreateKpiDetailInput[]>([
    { kpiName: "", description: "", weightPercentage: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<KpiAssignment[]>([]);

  const isCeo = user?.roleId === ROLE.CEO;

  useEffect(() => {
    apiClient.getEvaluationPeriods().then((res) => setPeriods(res.data)).catch(() => {});
    if (isCeo) {
      apiClient.getDepartments().then((res) => setDepartments(res.data)).catch(() => {});
    } else {
      apiClient.getMyTeam().then((res) => setTeam(res.data)).catch(() => {});
    }
  }, [isCeo]);

  useEffect(() => {
    if (isCeo && selectedDepartment) {
      apiClient
        .getDepartmentEmployees(Number(selectedDepartment))
        .then((res) => setTeam(res.data as unknown as TeamMember[]))
        .catch(() => setTeam([]));
    }
  }, [isCeo, selectedDepartment]);

  const totalWeight = rows.reduce((sum, r) => sum + (Number(r.weightPercentage) || 0), 0);

  function updateRow(index: number, patch: Partial<CreateKpiDetailInput>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { kpiName: "", description: "", weightPercentage: 0 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!employeeId || !periodId) {
      toast.error("Select an employee and an evaluation period.");
      return;
    }
    if (rows.some((r) => !r.kpiName || !r.weightPercentage)) {
      toast.error("Fill in a name and weight for every KPI.");
      return;
    }
    if (totalWeight !== 100) {
      toast.error(`Total weight must equal 100%. Currently ${totalWeight}%.`);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiClient.createKpi({
        employeeId: Number(employeeId),
        periodId: Number(periodId),
        details: rows,
      });
      setCreated((prev) => [res.data, ...prev]);
      toast.success("KPI assignment created as Draft.");
      setRows([{ kpiName: "", description: "", weightPercentage: 0 }]);
    } catch {
      toast.error("Could not create KPI assignment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Create KPI" description="Assign weighted KPIs to an employee for an evaluation period." />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>New KPI assignment</CardTitle>
            <CardDescription>Weights across all KPIs must add up to 100%.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {isCeo && (
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.departmentId} value={String(d.departmentId)}>
                          {d.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Employee</Label>
                <Select value={employeeId} onValueChange={setEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {team.map((m) => (
                      <SelectItem key={m.employeeId} value={String(m.employeeId)}>
                        {m.firstName} {m.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Evaluation period</Label>
                <Select value={periodId} onValueChange={setPeriodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((p) => (
                      <SelectItem key={p.periodId} value={String(p.periodId)}>
                        {p.periodName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {rows.map((row, i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      KPI {i + 1}
                    </span>
                    {rows.length > 1 && (
                      <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <Input
                      placeholder="KPI name"
                      value={row.kpiName}
                      onChange={(e) => updateRow(i, { kpiName: e.target.value })}
                    />
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Weight %"
                      className="sm:w-28"
                      value={row.weightPercentage || ""}
                      onChange={(e) => updateRow(i, { weightPercentage: Number(e.target.value) })}
                    />
                  </div>
                  <Textarea
                    className="mt-3"
                    placeholder="Description"
                    value={row.description}
                    onChange={(e) => updateRow(i, { description: e.target.value })}
                  />
                </div>
              ))}
              <Button variant="outline" onClick={addRow}>
                <PlusCircle className="h-4 w-4" /> Add another KPI
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-md bg-muted px-4 py-2.5 text-sm">
              <span>Total weight</span>
              <span className={`font-mono-data font-semibold ${totalWeight === 100 ? "text-success" : "text-destructive"}`}>
                {totalWeight}%
              </span>
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Create KPI assignment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently created</CardTitle>
            <CardDescription>KPI assignments you've created this session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {created.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing created yet.</p>
            )}
            {created.map((a) => (
              <div key={a.assignmentId} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{a.employeeName}</p>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {a.periodName} · {a.details.length} KPIs · {a.totalWeight}%
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreateKpiPage() {
  return (
    <Suspense fallback={<Loader2 className="h-4 w-4 animate-spin" />}>
      <CreateKpiInner />
    </Suspense>
  );
}
