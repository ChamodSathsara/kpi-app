"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";
import type {
  KpiAssignment,
  Competency,
  AchievementType,
  Achievement,
  ResultDetail,
  EvaluationMarkInput,
} from "@/types";
import { ROLE } from "@/types";
import {
  PageHeader,
  EmptyState,
  StatusBadge,
} from "@/components/shared/display";
import { KpiMarksTable } from "@/components/evaluation/kpi-marks-table";
import { CompetenciesForm } from "@/components/evaluation/competencies-form";
import { AchievementsForm } from "@/components/evaluation/achievements-form";
import {
  GradeCard,
  RecommendationForm,
  ReportButtons,
} from "@/components/evaluation/grade-and-actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Loader2, PlusCircle } from "lucide-react";

export default function EmployeeDetailPage() {
  const params = useParams<{ employeeId: string }>();
  const employeeId = Number(params.employeeId);
  const { user } = useAuth();
  const router = useRouter();

  const [assignments, setAssignments] = useState<KpiAssignment[] | null>(null);
  const [selected, setSelected] = useState<KpiAssignment | null>(null);
  const [result, setResult] = useState<ResultDetail | any | null>(null);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [achievementTypes, setAchievementTypes] = useState<AchievementType[]>(
    [],
  );
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const evaluatorRole: "Supervisor" | "HOD" =
    user?.roleId === ROLE.HOD ? "HOD" : "Supervisor";

  const loadResult = useCallback(async (assignmentId: number) => {
    try {
      const res = await apiClient.getEvaluationDetail(assignmentId);
      console.log("Evaluation detail:", res.data);
      setResult(res.data);
      setAchievements(res.data.achievements ?? []);
    } catch {
      setResult(null);
    }
  }, []);

  useEffect(() => {
    if (!employeeId) return;
    (async () => {
      setIsLoading(true);
      try {
        const [kpiRes, compRes, typeRes] = await Promise.all([
          apiClient.getKpisForEmployee(employeeId),
          apiClient.getCompetencies().catch(() => ({ data: [] })),
          apiClient.getAchievementTypes().catch(() => ({ data: [] })),
        ]);
        setAssignments(kpiRes.data);
        setCompetencies(compRes.data);
        setAchievementTypes(typeRes.data);
        const latest = kpiRes.data[0] ?? null;
        console.log("Latest assignment:", latest);
        setSelected(latest);
        if (latest) await loadResult(latest.assignmentId);
      } catch {
        toast.error("Could not load this employee's KPIs.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [employeeId, loadResult]);

  async function handleSaveMarks(details: EvaluationMarkInput[]) {
    if (!selected || !result?.selfEvaluationId) {
      toast.error("This employee hasn't submitted a self-evaluation yet.");
      return;
    }
    try {
      if (evaluatorRole === "Supervisor") {
        await apiClient.saveSupervisorEvaluation(
          result.selfEvaluationId,
          details,
        );
      } else if (result.hodEvaluationId) {
        // an HOD evaluation already exists — update instead of create
        await apiClient.updateHodEvaluation(result.hodEvaluationId, details);
      } else {
        await apiClient.saveHodEvaluation(result.selfEvaluationId, details);
      }
      toast.success(`${evaluatorRole} marks saved.`);
      loadResult(selected.assignmentId);
    } catch {
      toast.error("Could not save marks.");
    }
  }

  async function handleSaveCompetencies(
    ratings: { competencyId: number; score: number }[],
  ) {
    if (!selected) return;
    try {
      await apiClient.saveCompetencyEvaluation(
        selected.assignmentId,
        evaluatorRole,
        ratings,
      );
      toast.success("Competency ratings saved.");
    } catch {
      toast.error("Could not save competency ratings.");
    }
  }

  async function handleAddAchievement(input: {
    typeId: number;
    description: string;
    achievedDate: string;
    score: number;
  }) {
    if (!selected) return;
    try {
      const res = await apiClient.addAchievement({
        assignmentId: selected.assignmentId,
        ...input,
      });
      setAchievements((prev) => [...prev, res.data]);
      toast.success("Achievement added.");
    } catch {
      toast.error("Could not add achievement.");
    }
  }

  async function handleDeleteAchievement(id: number) {
    try {
      await apiClient.deleteAchievement(id);
      setAchievements((prev) => prev.filter((a) => a.achievementId !== id));
      toast.success("Achievement removed.");
    } catch {
      toast.error("Could not remove achievement.");
    }
  }

  async function handleGenerateGrade() {
    if (!selected || !result?.hodEvaluationId) return;
    try {
      await apiClient.processGrade(result.hodEvaluationId);
      toast.success("Grade generated.");
      loadResult(selected.assignmentId);
    } catch {
      toast.error(
        "Could not generate grade. Make sure all evaluations are submitted first.",
      );
    }
  }

  async function handleSaveRecommendation(comment: string) {
    if (!selected) return;
    try {
      await apiClient.addRecommendation(
        selected.assignmentId,
        "General",
        comment,
      );
      toast.success("Comment saved.");
    } catch {
      toast.error("Could not save comment.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading employee…
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/employees"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Employees
      </Link>

      {!selected ? (
        <EmptyState
          title="No KPIs created for this employee yet"
          description="Create KPIs for this evaluation period to begin the review cycle."
          action={
            <Button
              onClick={() =>
                router.push(`/create-kpi?employeeId=${employeeId}`)
              }
            >
              <PlusCircle className="h-4 w-4" /> Create KPIs
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <PageHeader
            title={selected.employeeName ?? "Employee"}
            description={selected.periodName}
            action={<StatusBadge status={selected.status} />}
          />

          <Tabs defaultValue="marks">
            <TabsList className="flex-wrap">
              <TabsTrigger value="marks">KPI marks</TabsTrigger>
              <TabsTrigger value="competencies">Competencies</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="grade">Grade & comments</TabsTrigger>
            </TabsList>

            <TabsContent value="marks">
              <KpiMarksTable
                result={result}
                role={evaluatorRole}
                onSave={handleSaveMarks}
              />
            </TabsContent>

            <TabsContent value="competencies">
              <CompetenciesForm
                competencies={competencies}
                evaluatorRole={evaluatorRole}
                onSave={handleSaveCompetencies}
              />
            </TabsContent>

            <TabsContent value="achievements">
              <AchievementsForm
                achievements={achievements}
                types={achievementTypes}
                onAdd={handleAddAchievement}
                onDelete={handleDeleteAchievement}
              />
            </TabsContent>

            <TabsContent value="grade" className="space-y-6">
              <GradeCard
                grade={result?.grade ?? null}
                onGenerate={handleGenerateGrade}
              />
              <RecommendationForm
                initialComment={result?.recommendationNote} // was result?.recommendation
                onSave={(comment) => handleSaveRecommendation(comment)}
              />
              {result?.grade && (
                <ReportButtons resultId={selected.assignmentId} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
