"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GradeBadge } from "@/components/shared/display";
import { Loader2, FileDown, FileSpreadsheet, Sparkles, MessageSquarePlus, ClipboardList } from "lucide-react";

export function GradeCard({
  grade,
  onGenerate,
}: {
  grade: string | null;
  onGenerate: () => Promise<void>;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Final grade</CardTitle>
        <CardDescription>
          KPI marks 80% · Competencies 15% · Special achievements 5%
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <GradeBadge grade={grade} />
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {grade ? "Re-generate grade" : "Generate grade"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function RecommendationForm({
  initialComment,
  onSave,
}: {
  initialComment?: string;
  onSave: (comment: string, type: string) => Promise<void>;
}) {
  const [comment, setComment] = useState(initialComment ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(comment, "General");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments & recommendation</CardTitle>
        <CardDescription>e.g. &ldquo;This employee is suitable for promotion.&rdquo;</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add your comment about this employee's performance"
          rows={4}
        />
        <Button onClick={handleSave} disabled={isSaving || !comment}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
          Save comment
        </Button>
      </CardContent>
    </Card>
  );
}

export function AttendanceForm({
  onSave,
  initial,
}: {
  initial?: { attendancePercentage: number; presentDays: number; absentDays: number; marksDeduction: number; comment: string };
  onSave: (input: {
    attendancePercentage: number;
    presentDays: number;
    absentDays: number;
    marksDeduction: number;
    comment: string;
  }) => Promise<void>;
}) {
  const [attendancePercentage, setAttendancePercentage] = useState(String(initial?.attendancePercentage ?? ""));
  const [presentDays, setPresentDays] = useState(String(initial?.presentDays ?? ""));
  const [absentDays, setAbsentDays] = useState(String(initial?.absentDays ?? ""));
  const [marksDeduction, setMarksDeduction] = useState(String(initial?.marksDeduction ?? "0"));
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave({
        attendancePercentage: Number(attendancePercentage),
        presentDays: Number(presentDays),
        absentDays: Number(absentDays),
        marksDeduction: Number(marksDeduction),
        comment,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance summary</CardTitle>
        <CardDescription>Record attendance and any mark deduction, then re-submit.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Attendance %</Label>
            <Input type="number" min={0} max={100} value={attendancePercentage} onChange={(e) => setAttendancePercentage(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Present days</Label>
            <Input type="number" min={0} value={presentDays} onChange={(e) => setPresentDays(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Absent days</Label>
            <Input type="number" min={0} value={absentDays} onChange={(e) => setAbsentDays(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Marks deduction</Label>
            <Input type="number" min={0} value={marksDeduction} onChange={(e) => setMarksDeduction(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Comment</Label>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
          Save & re-submit
        </Button>
      </CardContent>
    </Card>
  );
}

export function ReportButtons({ resultId }: { resultId: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" asChild>
        <a href={`/api/reports/export/pdf/${resultId}`} target="_blank" rel="noopener noreferrer">
          <FileDown className="h-4 w-4" /> Download PDF
        </a>
      </Button>
      <Button variant="outline" asChild>
        <a href={`/api/reports/export/excel/${resultId}`} target="_blank" rel="noopener noreferrer">
          <FileSpreadsheet className="h-4 w-4" /> Download Excel
        </a>
      </Button>
    </div>
  );
}
