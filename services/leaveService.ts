import { EmployeeLeave, LeaveFormData } from "@/types";
import { generateID } from "@/lib/utils";
import { client } from "@/lib/amplify-client";
import { employeeService } from "./employeeService";

function mapLeave(item: any): EmployeeLeave {
  return {
    id: item.id,
    LeaveID: item.LeaveID,
    EmployeeID: item.EmployeeID,
    LeaveType: item.LeaveType ?? "Other",
    StartDate: item.StartDate,
    EndDate: item.EndDate,
    Reason: item.Reason ?? undefined,
    Status: item.Status ?? "Pending",
    ApprovedBy: item.ApprovedBy ?? undefined,
    CreatedBy: item.CreatedBy ?? undefined,
    CreatedAt: item.createdAt ?? new Date().toISOString(),
    UpdatedAt: item.updatedAt ?? new Date().toISOString(),
  };
}

export const leaveService = {
  async getAll(): Promise<EmployeeLeave[]> {
    const { data } = await client.models.EmployeeLeave.list();
    return (data ?? []).map(mapLeave);
  },

  async getByEmployeeId(employeeId: string): Promise<EmployeeLeave[]> {
    const { data } = await client.models.EmployeeLeave.list({
      filter: { EmployeeID: { eq: employeeId } },
    });
    return (data ?? [])
      .map(mapLeave)
      .sort((a, b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime());
  },

  // Returns leave records that are currently active (approved and covering today)
  // Also enriches each record with the employee's name and department
  async getActiveLeaves(): Promise<(EmployeeLeave & { EmployeeName: string; Department: string })[]> {
    const [allLeaves, allEmployees] = await Promise.all([
      leaveService.getAll(),
      employeeService.getAll(),
    ]);

    const today = new Date().toISOString().split("T")[0];
    const employeeMap = new Map(allEmployees.map((e) => [e.EmployeeID, e]));

    return allLeaves
      .filter((l) => l.Status === "Approved" && l.StartDate <= today && l.EndDate >= today)
      .map((l) => {
        const emp = employeeMap.get(l.EmployeeID);
        return {
          ...l,
          EmployeeName: emp ? `${emp.FirstName} ${emp.LastName}` : "Unknown",
          Department: emp?.Department ?? "Unknown",
        };
      })
      .sort((a, b) => a.EndDate.localeCompare(b.EndDate)); // returning soonest first
  },

  async create(employeeId: string, formData: LeaveFormData, createdBy: string): Promise<EmployeeLeave> {
    const { data } = await client.models.EmployeeLeave.create({
      LeaveID: generateID().replace("EMP-", "LV-"),
      EmployeeID: employeeId,
      ...formData,
      CreatedBy: createdBy,
    });
    if (!data) throw new Error("Failed to create leave record");
    return mapLeave(data);
  },

  async update(id: string, formData: Partial<LeaveFormData>): Promise<EmployeeLeave> {
    const { data } = await client.models.EmployeeLeave.update({ id, ...formData });
    if (!data) throw new Error("Failed to update leave record");
    return mapLeave(data);
  },

  async delete(id: string): Promise<void> {
    await client.models.EmployeeLeave.delete({ id });
  },
};
