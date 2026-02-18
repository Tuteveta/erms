"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentUpload } from "@/components/employees/DocumentUpload";
import { LeaveForm } from "@/components/employees/LeaveForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { employeeService } from "@/services/employeeService";
import { documentService } from "@/services/documentService";
import { leaveService } from "@/services/leaveService";
import { Employee, EmployeeDocument, EmployeeLeave, LeaveFormData } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Edit2,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  Loader2,
  CalendarClock,
  Plus,
  Trash2,
} from "lucide-react";

const LEAVE_TYPE_COLORS: Record<string, string> = {
  Sick: "bg-red-50 text-red-600 border-red-200",
  Annual: "bg-blue-50 text-blue-600 border-blue-200",
  Maternity: "bg-pink-50 text-pink-600 border-pink-200",
  Paternity: "bg-indigo-50 text-indigo-600 border-indigo-200",
  Emergency: "bg-orange-50 text-orange-600 border-orange-200",
  Other: "bg-gray-50 text-gray-600 border-gray-200",
};

const LEAVE_STATUS_COLORS: Record<string, string> = {
  Approved: "bg-green-50 text-green-700 border-green-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

function leaveDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { can } = usePermissions();
  const { user } = useAuth();
  const { toast } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<EmployeeLeave[]>([]);
  const [leaveModelAvailable, setLeaveModelAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [leaveFormOpen, setLeaveFormOpen] = useState(false);

  const loadData = async () => {
    try {
      const [emp, docs] = await Promise.all([
        employeeService.getById(id),
        documentService.getByEmployeeId(id),
      ]);
      setEmployee(emp);
      setDocuments(docs);

      // Load leave records — gracefully handle if model not yet deployed
      try {
        const leaves = await leaveService.getByEmployeeId(id);
        setLeaveRecords(leaves);
        setLeaveModelAvailable(true);
      } catch {
        setLeaveModelAvailable(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  async function handleLogLeave(formData: LeaveFormData) {
    if (!employee || !user) return;
    await leaveService.create(employee.EmployeeID, formData, user.email);
    toast({ title: "Leave recorded", description: "The leave record has been saved." });
    await loadData();
  }

  async function handleDeleteLeave(leave: EmployeeLeave) {
    await leaveService.delete(leave.id);
    toast({ title: "Leave deleted", description: "The leave record has been removed." });
    setLeaveRecords((prev) => prev.filter((l) => l.id !== leave.id));
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
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
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
                      <Badge
                        variant={employee.Status === "Active" ? "success" : employee.Status === "OnLeave" ? "outline" : "secondary"}
                        className={employee.Status === "OnLeave" ? "border-amber-400 text-amber-600 bg-amber-50 mt-1" : "mt-1"}
                      >
                        {employee.Status === "OnLeave" ? "On Leave" : employee.Status}
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

            {/* Leave History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-amber-500" />
                    Leave History
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{leaveRecords.length}</Badge>
                    {can("EDIT_EMPLOYEE") && leaveModelAvailable && (
                      <Button size="sm" variant="outline" onClick={() => setLeaveFormOpen(true)}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Log Leave
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {leaveModelAvailable
                    ? "All leave periods recorded for this employee"
                    : "Deploy leave tracking schema to enable leave recording (run npx ampx sandbox)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!leaveModelAvailable ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Leave model not yet deployed. Run <code className="font-mono bg-muted px-1 rounded">npx ampx sandbox</code> to enable.
                  </p>
                ) : leaveRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No leave records found.</p>
                ) : (
                  <div className="space-y-2">
                    {leaveRecords.map((leave) => {
                      const typeColor = LEAVE_TYPE_COLORS[leave.LeaveType] ?? LEAVE_TYPE_COLORS.Other;
                      const statusColor = LEAVE_STATUS_COLORS[leave.Status] ?? "";
                      const duration = leaveDuration(leave.StartDate, leave.EndDate);
                      return (
                        <div
                          key={leave.id}
                          className="flex items-center gap-3 rounded-lg border px-4 py-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${typeColor}`}>
                                {leave.LeaveType}
                              </span>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-sm font-medium">
                                {formatDate(leave.StartDate)} → {formatDate(leave.EndDate)}
                              </p>
                              {leave.Reason && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{leave.Reason}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusColor}`}>
                                {leave.Status}
                              </span>
                              <span className="text-xs text-muted-foreground">{duration}d</span>
                            </div>
                          </div>
                          {can("EDIT_EMPLOYEE") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() => handleDeleteLeave(leave)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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

      {/* Log Leave Dialog */}
      {employee && (
        <LeaveForm
          open={leaveFormOpen}
          onClose={() => setLeaveFormOpen(false)}
          onSubmit={handleLogLeave}
          employeeName={`${employee.FirstName} ${employee.LastName}`}
        />
      )}
    </div>
  );
}
