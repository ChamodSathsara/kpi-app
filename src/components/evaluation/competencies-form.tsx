"use client";

import { useState } from "react";
import type { Competency } from "@/types";
import { COMPETENCY_SCALE } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CompetenciesForm({
  competencies,
  onSave,
}: {
  competencies: Competency[];
  onSave: (ratings: { competencyId: number; score: number; remarks: string }[]) => Promise<void>;
}) {
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    const unrated = competencies.filter((c) => !ratings[c.competencyId]);
    if (unrated.length > 0) {
      toast.error(`Please rate all competencies before saving (${unrated.length} missing).`);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(
        competencies.map((c) => ({
          competencyId: c.competencyId,
          score: ratings[c.competencyId],
          remarks: remarks[c.competencyId] ?? "",
        })),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation of competencies</CardTitle>
        <CardDescription>Rate each competency from 1 (need improvement) to 5 (consistently exceeds).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {competencies.map((c) => (
          <div key={c.competencyId}>
            <p className="mb-2 text-sm font-medium">{c.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {COMPETENCY_SCALE.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  title={s.label}
                  onClick={() => setRatings((p) => ({ ...p, [c.competencyId]: s.value }))}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-semibold transition-colors",
                    ratings[c.competencyId] === s.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:bg-muted",
                  )}
                >
                  {s.value}
                </button>
              ))}
              <span className="ml-2 self-center text-xs text-muted-foreground">
                {ratings[c.competencyId] ? COMPETENCY_SCALE[ratings[c.competencyId] - 1].label : "Not rated"}
              </span>
            </div>
            <Textarea
              className="mt-2"
              placeholder="Remarks (optional)"
              value={remarks[c.competencyId] ?? ""}
              onChange={(e) => setRemarks((p) => ({ ...p, [c.competencyId]: e.target.value }))}
            />
          </div>
        ))}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save competency ratings
        </Button>
      </CardContent>
    </Card>
  );
}