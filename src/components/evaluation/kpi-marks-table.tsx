"use client";

import { useState } from "react";
import type { KpiDetail } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export function KpiMarksTable({
  details,
  role,
  onSave,
}: {
  details: KpiDetail[];
  role: "Supervisor" | "HOD";
  onSave: (marks: { detailId: number; score: number }[]) => Promise<void>;
}) {
  const [scores, setScores] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    details.forEach((d) => {
      const existing = role === "Supervisor" ? d.supervisorScore : d.hodScore;
      if (existing !== undefined) initial[d.detailId] = String(existing);
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(
        details.map((d) => ({ detailId: d.detailId, score: Number(scores[d.detailId] ?? 0) }))
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee response — KPI marks</CardTitle>
        <CardDescription>Enter your {role} score (0–100) for each KPI.</CardDescription>
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
            {details.map((d) => (
              <TableRow key={d.detailId}>
                <TableCell className="max-w-[220px]">
                  <p className="truncate font-medium">{d.kpiName}</p>
                  <p className="truncate text-xs text-muted-foreground">{d.description}</p>
                </TableCell>
                <TableCell className="font-mono-data text-xs">{d.weightPercentage}%</TableCell>
                <TableCell className="font-mono-data">{d.employeeScore ?? "—"}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-24"
                    value={scores[d.detailId] ?? ""}
                    onChange={(e) => setScores((p) => ({ ...p, [d.detailId]: e.target.value }))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button className="mt-4" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save {role} marks
        </Button>
      </CardContent>
    </Card>
  );
}
