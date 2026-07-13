"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import type { EvaluationPeriod } from "@/types";
import { PageHeader, EmptyState } from "@/components/shared/display";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, PlusCircle, Pencil, Trash2, Power } from "lucide-react";

const emptyForm = { periodName: "", startDate: "", endDate: "", isActive: false };

export default function EvaluationPeriodsPage() {
  const [periods, setPeriods] = useState<EvaluationPeriod[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EvaluationPeriod | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  function load() {
    apiClient.getEvaluationPeriods().then((res) => setPeriods(res.data)).catch(() => setPeriods([]));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(p: EvaluationPeriod) {
    setEditing(p);
    setForm({ periodName: p.periodName, startDate: p.startDate, endDate: p.endDate, isActive: p.isActive });
    setDialogOpen(true);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      if (editing) {
        await apiClient.updateEvaluationPeriod(editing.periodId, form);
        toast.success("Evaluation period updated.");
      } else {
        await apiClient.createEvaluationPeriod(form);
        toast.success("Evaluation period created.");
      }
      setDialogOpen(false);
      load();
    } catch {
      toast.error("Could not save evaluation period.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this evaluation period?")) return;
    try {
      await apiClient.deleteEvaluationPeriod(id);
      toast.success("Evaluation period deleted.");
      load();
    } catch {
      toast.error("Could not delete evaluation period.");
    }
  }

  async function handleToggleActive(p: EvaluationPeriod) {
    try {
      await apiClient.activateEvaluationPeriod(p.periodId, !p.isActive);
      toast.success(p.isActive ? "Period deactivated." : "Period activated.");
      load();
    } catch {
      toast.error("Could not update period status.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Evaluation periods"
        description="Manage the review cycles employees are evaluated against."
        action={
          <Button onClick={openCreate}>
            <PlusCircle className="h-4 w-4" /> Add period
          </Button>
        }
      />

      {!periods && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading periods…
        </div>
      )}
      {periods && periods.length === 0 && <EmptyState title="No evaluation periods yet" />}

      {periods && periods.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((p) => (
                  <TableRow key={p.periodId}>
                    <TableCell className="font-medium">{p.periodName}</TableCell>
                    <TableCell className="text-sm">{p.startDate}</TableCell>
                    <TableCell className="text-sm">{p.endDate}</TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? "success" : "outline"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleActive(p)} title="Toggle active">
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.periodId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit period" : "Add period"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Period name</Label>
              <Input
                value={form.periodName}
                onChange={(e) => setForm((f) => ({ ...f, periodName: e.target.value }))}
                placeholder="e.g. 2026 Year End"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>End date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Create period"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
