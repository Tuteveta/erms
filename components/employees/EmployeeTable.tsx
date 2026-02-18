"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Employee } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit2, Trash2, MoreHorizontal, Search, Filter } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

interface EmployeeTableProps {
  employees: Employee[];
  onDelete?: (employee: Employee) => void;
  loading?: boolean;
}

export function EmployeeTable({ employees, onDelete, loading }: EmployeeTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const { can } = usePermissions();

  const filtered = employees.filter((e) => {
    const matchSearch =
      !search ||
      `${e.FirstName} ${e.LastName}`.toLowerCase().includes(search.toLowerCase()) ||
      e.Email.toLowerCase().includes(search.toLowerCase()) ||
      e.Department.toLowerCase().includes(search.toLowerCase()) ||
      e.EmployeeID.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || e.Status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Loading employees...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, department, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 border rounded-md p-1">
          {(["All", "Active", "Inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  {search ? "No employees match your search." : "No employee records found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((employee) => (
                <TableRow key={employee.EmployeeID}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                          {getInitials(employee.FirstName, employee.LastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {employee.FirstName} {employee.LastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{employee.Email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {employee.EmployeeID}
                  </TableCell>
                  <TableCell className="text-sm">{employee.Department}</TableCell>
                  <TableCell className="text-sm">{employee.Position}</TableCell>
                  <TableCell>
                    <Badge variant={employee.Status === "Active" ? "success" : "secondary"}>
                      {employee.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(employee.UpdatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/employees/${employee.EmployeeID}`} className="flex items-center gap-2">
                            <Eye className="h-4 w-4" /> View Profile
                          </Link>
                        </DropdownMenuItem>
                        {can("EDIT_EMPLOYEE") && (
                          <DropdownMenuItem asChild>
                            <Link href={`/employees/${employee.EmployeeID}/edit`} className="flex items-center gap-2">
                              <Edit2 className="h-4 w-4" /> Edit Record
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {can("DELETE_EMPLOYEE") && onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive flex items-center gap-2"
                              onClick={() => onDelete(employee)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete Record
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {employees.length} employee{employees.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
