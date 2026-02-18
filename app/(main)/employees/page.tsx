"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEmployees } from "@/hooks/useEmployees";
import { usePermissions } from "@/hooks/usePermissions";
import { Employee } from "@/types";
import { UserPlus, Loader2, AlertTriangle } from "lucide-react";

export default function EmployeesPage() {
  const { employees, loading, remove } = useEmployees();
  const { can } = usePermissions();
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.EmployeeID);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader pageTitle="Employees" pageDescription="Manage all employee records" />
      <div className="flex-1 p-6">
        <PageHeader
          title="Employee Records"
          description={`${employees.length} total records in the system`}
        >
          {can("CREATE_EMPLOYEE") && (
            <Button asChild>
              <Link href="/employees/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
              </Link>
            </Button>
          )}
        </PageHeader>

        <EmployeeTable
          employees={employees}
          onDelete={can("DELETE_EMPLOYEE") ? setDeleteTarget : undefined}
          loading={loading}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Delete Employee Record</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to permanently delete the record for{" "}
              <strong>{deleteTarget?.FirstName} {deleteTarget?.LastName}</strong>?
              This action cannot be undone and all associated documents will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
