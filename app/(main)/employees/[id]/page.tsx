"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentUpload } from "@/components/employees/DocumentUpload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { employeeService } from "@/services/employeeService";
import { documentService } from "@/services/documentService";
import { Employee, EmployeeDocument } from "@/types";
import { formatDate, formatDateTime, getInitials } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import {
  ArrowLeft,
  Edit2,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { can } = usePermissions();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [emp, docs] = await Promise.all([
        employeeService.getById(id),
        documentService.getByEmployeeId(id),
      ]);
      setEmployee(emp);
      setDocuments(docs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

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
        <div className="text-center space-y-3">
          <p className="font-semibold text-muted-foreground">Employee record not found.</p>
          <Button variant="outline" asChild>
            <Link href="/employees">Back to Employees</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Employee Profile" description={`${employee.FirstName} ${employee.LastName}`} />
      <div className="flex-1 p-6 space-y-6">
        <PageHeader title="Employee Profile">
          <Button variant="outline" asChild size="sm">
            <Link href="/employees"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
          </Button>
          {can("EDIT_EMPLOYEE") && (
            <Button asChild size="sm">
              <Link href={`/employees/${id}/edit`}><Edit2 className="mr-2 h-4 w-4" />Edit Record</Link>
            </Button>
          )}
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-5">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                      {getInitials(employee.FirstName, employee.LastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">
                          {employee.FirstName} {employee.LastName}
                        </h3>
                        <p className="text-muted-foreground">{employee.Position}</p>
                        <p className="text-sm text-muted-foreground">{employee.Department}</p>
                      </div>
                      <Badge variant={employee.Status === "Active" ? "success" : "secondary"} className="mt-1">
                        {employee.Status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact & Employment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{employee.Email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{employee.Phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="text-sm font-medium">{employee.Department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Position</p>
                      <p className="text-sm font-medium">{employee.Position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date Added</p>
                      <p className="text-sm font-medium">{formatDate(employee.CreatedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p className="text-sm font-medium">{formatDate(employee.UpdatedAt)}</p>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Employee ID:</p>
                  <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{employee.EmployeeID}</code>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents Panel */}
          {can("VIEW_DOCUMENTS") && (
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Documents</CardTitle>
                    <Badge variant="secondary" className="text-xs">{documents.length}</Badge>
                  </div>
                  <CardDescription>Official files stored in secure S3 storage</CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload
                    employeeId={id}
                    documents={documents}
                    onUpdate={loadData}
                    canUpload={can("UPLOAD_DOCUMENTS")}
                    canDelete={can("DELETE_EMPLOYEE")}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
