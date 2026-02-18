"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { EmployeeFormData } from "@/types";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function NewEmployeePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { can } = usePermissions();
  const { create } = useEmployees();

  if (!can("CREATE_EMPLOYEE")) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Access Denied" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="font-semibold">You do not have permission to create employee records.</p>
            <Button variant="outline" asChild>
              <Link href="/employees">Back to Employees</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: EmployeeFormData) => {
    await create(data, user?.email || "unknown");
    router.push("/employees");
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Add Employee" description="Create a new employee record" />
      <div className="flex-1 p-6">
        <PageHeader title="New Employee Record">
          <Button variant="outline" asChild size="sm">
            <Link href="/employees">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
        </PageHeader>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employee Information</CardTitle>
              <CardDescription>
                Fill in the details below to create a new employee record. Fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeForm
                onSubmit={handleSubmit}
                onCancel={() => router.push("/employees")}
                submitLabel="Create Employee"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
