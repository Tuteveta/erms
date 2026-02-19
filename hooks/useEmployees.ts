"use client";

import { useState, useEffect, useCallback } from "react";
import { Employee, EmployeeFormData } from "@/types";
import { employeeService } from "@/services/employeeService";
import { activityLogService } from "@/services/activityLogService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export function useEmployees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (formData: EmployeeFormData, createdBy: string) => {
    try {
      const newEmployee = await employeeService.create(formData, createdBy);
      setEmployees((prev) => [...prev, newEmployee]);
      toast({ title: "Employee Created", description: `${formData.FirstName} ${formData.LastName} has been added.` });
      activityLogService.log(
        "Employee Created",
        "Employee",
        newEmployee.EmployeeID,
        `${formData.FirstName} ${formData.LastName} added to ${formData.Department}`,
        user?.email ?? createdBy,
        user?.name
      );
      return newEmployee;
    } catch (err) {
      toast({ title: "Error", description: "Failed to create employee.", variant: "destructive" });
      throw err;
    }
  };

  const update = async (id: string, formData: Partial<EmployeeFormData>) => {
    try {
      const updated = await employeeService.update(id, formData);
      setEmployees((prev) => prev.map((e) => (e.EmployeeID === id ? updated : e)));
      toast({ title: "Employee Updated", description: "Record updated successfully." });
      const name = `${updated.FirstName} ${updated.LastName}`;
      activityLogService.log(
        "Employee Updated",
        "Employee",
        id,
        `${name}'s record was updated`,
        user?.email ?? "",
        user?.name
      );
      return updated;
    } catch (err) {
      toast({ title: "Error", description: "Failed to update employee.", variant: "destructive" });
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      const target = employees.find((e) => e.EmployeeID === id);
      await employeeService.delete(id);
      setEmployees((prev) => prev.filter((e) => e.EmployeeID !== id));
      toast({ title: "Employee Deleted", description: "Record removed from the system." });
      const name = target ? `${target.FirstName} ${target.LastName}` : id;
      activityLogService.log(
        "Employee Deleted",
        "Employee",
        id,
        `${name}'s record was removed from the system`,
        user?.email ?? "",
        user?.name
      );
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete employee.", variant: "destructive" });
      throw err;
    }
  };

  return { employees, loading, error, refresh, create, update, remove };
}
