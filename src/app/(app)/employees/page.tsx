"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import type { TeamMember } from "@/types";
import {
  PageHeader,
  EmptyState,
  StatusBadge,
} from "@/components/shared/display";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, ChevronRight, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EmployeesPage() {
  const [team, setTeam] = useState<TeamMember[] | null>(null);

  useEffect(() => {
    apiClient
      .getMyTeam()
      .then((res) => setTeam(res.data))
      .catch(() => setTeam([]));
  }, []);

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Team members reporting to you."
      />

      {!team && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your team…
        </div>
      )}

      {team && team.length === 0 && (
        <EmptyState
          title="No employees found"
          description="No one is currently reporting to you."
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team?.map((m, index) => {
          const initials =
            `${m.firstName?.[0] ?? ""}${m.lastName?.[0] ?? ""}`.toUpperCase();
          return (
            <Link key={index} href={`/employees/${m.userId}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-3 pt-5">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-semibold capitalize">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.designationName}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      {m.hasKpis ? (
                        <StatusBadge status={m.kpiStatus} />
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <PlusCircle className="h-3 w-3" /> No KPIs yet
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
