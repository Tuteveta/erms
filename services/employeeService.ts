import { Employee, EmployeeFormData } from "@/types";
import { generateID } from "@/lib/utils";
import { client } from "@/lib/amplify-client";

// Map an AppSync Employee record to our Employee type
function mapEmployee(item: any): Employee {
  return {
    EmployeeID: item.EmployeeID,
    FirstName: item.FirstName,
    LastName: item.LastName,
    Department: item.Department,
    Position: item.Position,
    Email: item.Email,
    Phone: item.Phone ?? undefined,
    Status: item.Status ?? "Active",
    CreatedAt: item.createdAt ?? new Date().toISOString(),
    UpdatedAt: item.updatedAt ?? new Date().toISOString(),
    CreatedBy: item.CreatedBy ?? undefined,
  };
}

// Find the AppSync primary key (id) for a given EmployeeID
async function getDynamoId(employeeId: string): Promise<string | null> {
  const { data } = await client.models.Employee.list({
    filter: { EmployeeID: { eq: employeeId } },
  });
  return data && data.length > 0 ? data[0].id : null;
}

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    const { data } = await client.models.Employee.list();
    return (data ?? []).map(mapEmployee);
  },

  async getById(employeeId: string): Promise<Employee | null> {
    const { data } = await client.models.Employee.list({
      filter: { EmployeeID: { eq: employeeId } },
    });
    if (!data || data.length === 0) return null;
    return mapEmployee(data[0]);
  },

  async create(formData: EmployeeFormData, createdBy: string): Promise<Employee> {
    const { data } = await client.models.Employee.create({
      EmployeeID: generateID(),
      ...formData,
      CreatedBy: createdBy,
    });
    if (!data) throw new Error("Failed to create employee");
    return mapEmployee(data);
  },

  async update(employeeId: string, formData: Partial<EmployeeFormData>): Promise<Employee> {
    const id = await getDynamoId(employeeId);
    if (!id) throw new Error("Employee not found");
    const { data } = await client.models.Employee.update({ id, ...formData });
    if (!data) throw new Error("Failed to update employee");
    return mapEmployee(data);
  },

  async delete(employeeId: string): Promise<void> {
    const id = await getDynamoId(employeeId);
    if (!id) return;
    await client.models.Employee.delete({ id });
  },

  async search(query: string): Promise<Employee[]> {
    const all = await employeeService.getAll();
    const q = query.toLowerCase();
    return all.filter(
      (e) =>
        e.FirstName.toLowerCase().includes(q) ||
        e.LastName.toLowerCase().includes(q) ||
        e.Email.toLowerCase().includes(q) ||
        e.Department.toLowerCase().includes(q) ||
        e.Position.toLowerCase().includes(q) ||
        e.EmployeeID.toLowerCase().includes(q)
    );
  },

  async getStats(): Promise<{ total: number; active: number; inactive: number }> {
    const all = await employeeService.getAll();
    const total = all.length;
    const active = all.filter((e) => e.Status === "Active").length;
    const inactive = total - active;
    return { total, active, inactive };
  },
};
