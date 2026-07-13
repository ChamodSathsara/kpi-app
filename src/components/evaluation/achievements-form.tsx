"use client";

import { useState } from "react";
import type { Achievement, AchievementType } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, Trash2, Upload } from "lucide-react";

export function AchievementsForm({
  achievements,
  types,
  onAdd,
  onDelete,
  onUpload,
}: {
  achievements: Achievement[];
  types: AchievementType[];
  onAdd: (input: {
    typeId: number;
    description: string;
    achievedDate: string;
    score: number;
  }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpload?: (achievementId: number, file: File) => Promise<void>;
}) {
  const [typeId, setTypeId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [achievedDate, setAchievedDate] = useState("");
  const [score, setScore] = useState("5");
  const [isSaving, setIsSaving] = useState(false);

  async function handleAdd() {
    if (!typeId || !description) return;
    setIsSaving(true);
    try {
      await onAdd({ typeId: Number(typeId), description, achievedDate, score: Number(score) });
      setDescription("");
      setAchievedDate("");
      setScore("5");
      setTypeId("");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Special achievements</CardTitle>
        <CardDescription>Degrees, certificates, awards, or training earned this period.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {achievements.length > 0 && (
          <ul className="space-y-2">
            {achievements.map((a) => (
              <li
                key={a.achievementId}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.typeName ?? types.find((t) => t.typeId === a.typeId)?.typeName} · {a.achievedDate}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="accent">+{a.score}</Badge>
                  {onUpload && (
                    <label className="cursor-pointer text-muted-foreground hover:text-foreground">
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onUpload(a.achievementId, file);
                        }}
                      />
                    </label>
                  )}
                  <button
                    onClick={() => onDelete(a.achievementId)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete achievement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.typeId} value={String(t.typeId)}>
                    {t.typeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Achieved date</Label>
            <Input type="date" value={achievedDate} onChange={(e) => setAchievedDate(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Master's Degree in Information Technology"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Score (1–5)</Label>
            <Input type="number" min={1} max={5} value={score} onChange={(e) => setScore(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={isSaving || !typeId || !description}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
          Add achievement
        </Button>
      </CardContent>
    </Card>
  );
}
