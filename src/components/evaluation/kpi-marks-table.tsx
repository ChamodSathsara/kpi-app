"use client";

import { useState } from "react";
import type { ResultDetail, EvaluationMarkInput } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export function KpiMarksTable({
  result,
  role,
  onSave,
}: {
  result: ResultDetail | null;
  role: "Supervisor" | "HOD";
  onSave: (marks: EvaluationMarkInput[]) => Promise<void>;
}) {
  const kpiLines = result?.kpiLines ?? [];

  const [scores, setScores] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    kpiLines.forEach((d) => {
      const existing = role === "Supervisor" ? d.supervisorMarks : d.hodMarks;
      if (existing !== null && existing !== undefined) {
        initial[d.kpiAssignmentDetailId] = String(existing);
      }
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(
        kpiLines.map((d) => ({
          kpiAssignmentDetailId: d.kpiAssignmentDetailId,
          marks: Number(scores[d.kpiAssignmentDetailId] ?? 0),
          comments: "",
        })),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee response — KPI marks</CardTitle>
        <CardDescription>
          Enter your {role} score (0–100) for each KPI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>KPI</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Self score</TableHead>
              <TableHead>Your score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kpiLines.map((d) => (
              <TableRow key={d.kpiAssignmentDetailId}>
                <TableCell className="max-w-[220px]">
                  <p className="truncate font-medium">{d.kpiName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.description}
                  </p>
                </TableCell>
                <TableCell className="font-mono-data text-xs">
                  {d.weightPercentage}%
                </TableCell>
                <TableCell className="font-mono-data">
                  {d.employeeMarks ?? "—"}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-24"
                    value={scores[d.kpiAssignmentDetailId] ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const id = d.kpiAssignmentDetailId;

                      if (raw === "") {
                        setScores((p) => ({ ...p, [id]: "" }));
                        return;
                      }

                      const num = Number(raw);
                      if (Number.isNaN(num)) return;

                      const clamped = Math.min(100, Math.max(0, num));
                      setScores((p) => ({ ...p, [id]: String(clamped) }));
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button className="mt-4" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save {role} marks
        </Button>
      </CardContent>
    </Card>
  );
}