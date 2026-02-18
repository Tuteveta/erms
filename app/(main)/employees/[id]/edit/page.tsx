"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { employeeService } from "@/services/employeeService";
import { useEmployees } from "@/hooks/useEmployees";
import { usePermissions } from "@/hooks/usePermissions";
import { Employee, EmployeeFormData } from "@/types";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { can } = usePermissions();
  const { update } = useEmployees();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService.getById(id).then((emp) => {
      setEmployee(emp);
      setLoading(false);
    });
  }, [id]);

  if (!can("EDIT_EMPLOYEE")) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Access Denied" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="font-semibold">You do not have permission to edit employee records.</p>
            <Button variant="outline" asChild>
              <Link href="/employees">Back to Employees</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Employee not found.</p>
      </div>
    );
  }

  const handleSubmit = async (data: EmployeeFormData) => {
    await update(id, data);
    router.push(`/employees/${id}`);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Edit Employee" description={`${employee.FirstName} ${employee.LastName}`} />
      <div className="flex-1 p-6">
        <PageHeader title="Edit Employee Record">
          <Button variant="outline" asChild size="sm">
            <Link href={`/employees/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />Back to Profile
            </Link>
          </Button>
        </PageHeader>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Employee Information</CardTitle>
              <CardDescription>
                Modify the details for {employee.FirstName} {employee.LastName}.
                All changes are logged for audit purposes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeForm
                initialData={employee}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`/employees/${id}`)}
                submitLabel="Save Changes"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
