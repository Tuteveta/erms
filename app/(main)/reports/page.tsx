"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { employeeService } from "@/services/employeeService";
import { DEPARTMENTS } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { Printer, Download, Filter, FileText, ShieldAlert } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ReportsPage() {
  const { can } = usePermissions();
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [employees, setEmployees] = React.useState(() => employeeService.getStats());
  const [allEmployees, setAllEmployees] = React.useState<Awaited<ReturnType<typeof employeeService.getAll>>>([]);

  React.useEffect(() => {
    employeeService.getAll().then(setAllEmployees);
  }, []);

  const filtered = allEmployees.filter((e) => {
    const deptMatch = departmentFilter === "All" || e.Department === departmentFilter;
    const statusMatch = statusFilter === "All" || e.Status === statusFilter;
    return deptMatch && statusMatch;
  });

  const handlePrint = () => window.print();

  if (!can("GENERATE_REPORTS")) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Reports" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="font-semibold">You do not have permission to generate reports.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Reports" description="Generate and export employee reports" />
      <div className="flex-1 p-6 space-y-6">
        <PageHeader
          title="Employee Reports"
          description="Generate printable employee summaries for audit and administration"
        >
          <Button variant="outline" onClick={handlePrint} className="no-print">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
          <Button className="no-print">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </PageHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 no-print">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{allEmployees.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {allEmployees.filter((e) => e.Status === "Active").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-orange-500">
                {allEmployees.filter((e) => e.Status === "Inactive").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Inactive</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center no-print">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Departments</SelectItem>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {(departmentFilter !== "All" || statusFilter !== "All") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setDepartmentFilter("All"); setStatusFilter("All"); }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Report Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Employee Summary Report
                  {departmentFilter !== "All" && ` — ${departmentFilter}`}
                </CardTitle>
                <CardDescription>
                  Generated on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  {" "}• {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((emp) => (
                  <TableRow key={emp.EmployeeID}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {getInitials(emp.FirstName, emp.LastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{emp.FirstName} {emp.LastName}</p>
                          <p className="text-xs text-muted-foreground">{emp.Email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{emp.EmployeeID}</TableCell>
                    <TableCell className="text-sm">{emp.Department}</TableCell>
                    <TableCell className="text-sm">{emp.Position}</TableCell>
                    <TableCell>
                      <Badge variant={emp.Status === "Active" ? "success" : "secondary"}>
                        {emp.Status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(emp.CreatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-10">
                No records match the selected filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
