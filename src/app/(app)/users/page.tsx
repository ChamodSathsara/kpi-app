"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import type { AdminUser, Department, Designation, Role, CreateUserInput } from "@/types";
import { PageHeader, EmptyState } from "@/components/shared/display";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Loader2, PlusCircle, Pencil, Trash2 } from "lucide-react";

const emptyForm: CreateUserInput = {
  employeeNo: "",
  firstName: "",
  lastName: "",
  email: "",
  roleId: 6,
  departmentId: 0,
  designationId: 0,
  reportsTo: null,
  isActive: true,
  temporaryPassword: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<CreateUserInput>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  function loadUsers() {
    apiClient.getUsers().then((res) => setUsers(res.data)).catch(() => setUsers([]));
  }

  useEffect(() => {
    loadUsers();
    apiClient.getDepartments().then((res) => setDepartments(res.data)).catch(() => {});
    apiClient.getDesignations().then((res) => setDesignations(res.data)).catch(() => {});
    apiClient.getRoles().then((res) => setRoles(res.data)).catch(() => {});
  }, []);

  function openCreate() {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(u: AdminUser) {
    setEditingUser(u);
    setForm({
      employeeNo: u.employeeNo,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      roleId: u.roleId,
      departmentId: u.departmentId ?? 0,
      designationId: u.designationId ?? 0,
      reportsTo: null,
      isActive: u.isActive,
      temporaryPassword: "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      if (editingUser) {
        await apiClient.updateUser(editingUser.userId, form);
        toast.success("User updated.");
      } else {
        await apiClient.createUser(form);
        toast.success("User created.");
      }
      setDialogOpen(false);
      loadUsers();
    } catch {
      toast.error("Could not save user.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(userId: number) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await apiClient.deleteUser(userId);
      toast.success("User deleted.");
      loadUsers();
    } catch {
      toast.error("Could not delete user.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Create and manage employee accounts, roles, and departments."
        action={
          <Button onClick={openCreate}>
            <PlusCircle className="h-4 w-4" /> Add user
          </Button>
        }
      />

      {!users && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading users…
        </div>
      )}
      {users && users.length === 0 && <EmptyState title="No users found" />}

      {users && users.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.userId}>
                    <TableCell>
                      <p className="font-medium capitalize">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.employeeNo}</p>
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{u.roleName}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{u.departmentName ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? "success" : "outline"}>
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u.userId)}>
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
            <DialogTitle>{editingUser ? "Edit user" : "Add user"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Employee No.</Label>
              <Input
                value={form.employeeNo}
                disabled={!!editingUser}
                onChange={(e) => setForm((f) => ({ ...f, employeeNo: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                disabled={!!editingUser}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>First name</Label>
              <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Last name</Label>
              <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={String(form.roleId)} onValueChange={(v) => setForm((f) => ({ ...f, roleId: Number(v) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.roleId} value={String(r.roleId)}>
                      {r.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select
                value={String(form.departmentId)}
                onValueChange={(v) => setForm((f) => ({ ...f, departmentId: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
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
            <div className="space-y-1.5">
              <Label>Designation</Label>
              <Select
                value={String(form.designationId)}
                onValueChange={(v) => setForm((f) => ({ ...f, designationId: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((d) => (
                    <SelectItem key={d.designationId} value={String(d.designationId)}>
                      {d.designationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!editingUser && (
              <div className="space-y-1.5">
                <Label>Temporary password</Label>
                <Input
                  value={form.temporaryPassword}
                  onChange={(e) => setForm((f) => ({ ...f, temporaryPassword: e.target.value }))}
                  minLength={8}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingUser ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
