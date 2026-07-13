"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import type { ResultDetail } from "@/types";
import { GradeBadge } from "@/components/shared/display";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ResultDetailPage() {
  const params = useParams<{ assignmentId: string }>();
  const assignmentId = Number(params.assignmentId);
  const [result, setResult] = useState<ResultDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notProcessed, setNotProcessed] = useState(false);

  useEffect(() => {
    if (!assignmentId) return;
    apiClient
      .getResult(assignmentId)
      .then((res) => setResult(res.data))
      .catch(() => setNotProcessed(true))
      .finally(() => setIsLoading(false));
  }, [assignmentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading result…
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/results"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Results
      </Link>

      {notProcessed || !result ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <GradeBadge grade={null} />
            <p className="mt-2 font-display font-semibold">Grade not yet processed</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Your grade will appear here once your supervisor and HOD have completed their
              evaluations and processed the final result.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">{result.periodName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{result.employeeName}</p>
            </div>
            <div className="flex items-center gap-3">
              <GradeBadge grade={result.grade} />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>KPI marks</CardTitle>
              <CardDescription>{result.kpiEvaluation.weightPercentage}% of final grade</CardDescription>
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
                  {result.kpiEvaluation.details.map((d) => (
                    <TableRow key={d.detailId}>
                      <TableCell className="max-w-[220px]">
                        <p className="truncate font-medium">{d.kpiName}</p>
                      </TableCell>
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

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation of competencies</CardTitle>
                <CardDescription>{result.competencies.weightPercentage}% of final grade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.competencies.details?.length ? (
                  result.competencies.details.map((c) => (
                    <div key={c.competencyId} className="flex items-center justify-between text-sm">
                      <span>{c.name}</span>
                      <span className="flex gap-1.5">
                        <Badge variant="outline">Self {c.employeeRating ?? "—"}</Badge>
                        <Badge variant="secondary">Sup {c.supervisorRating ?? "—"}</Badge>
                        <Badge>HOD {c.hodRating ?? "—"}</Badge>
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Score: <span className="font-mono-data">{result.competencies.score}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Special achievements</CardTitle>
                <CardDescription>{result.achievements.weightPercentage}% of final grade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.achievements.details?.length ? (
                  result.achievements.details.map((a) => (
                    <div key={a.achievementId} className="flex items-center justify-between text-sm">
                      <span className="truncate">{a.description}</span>
                      <Badge variant="accent">+{a.score}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Score: <span className="font-mono-data">{result.achievements.score}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {(result.recommendation || result.hodComment) && (
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {result.hodComment && <p>{result.hodComment}</p>}
                {result.recommendation && (
                  <p className="text-muted-foreground">{result.recommendation}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
