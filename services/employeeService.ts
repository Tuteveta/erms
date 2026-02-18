import { Employee, EmployeeFormData, EmployeeDocument } from "@/types";
import { generateID } from "@/lib/utils";

// Mock data for development — replace with Amplify DataStore/API calls in production
const MOCK_EMPLOYEES: Employee[] = [
  {
    EmployeeID: "EMP-001",
    FirstName: "James",
    LastName: "Okafor",
    Department: "Human Resources",
    Position: "HR Director",
    Email: "j.okafor@org.gov",
    Phone: "+234-801-234-5678",
    Status: "Active",
    CreatedAt: "2023-01-15T08:00:00Z",
    UpdatedAt: "2024-06-01T10:30:00Z",
    CreatedBy: "admin@org.gov",
  },
  {
    EmployeeID: "EMP-002",
    FirstName: "Amina",
    LastName: "Bello",
    Department: "Finance",
    Position: "Senior Accountant",
    Email: "a.bello@org.gov",
    Phone: "+234-802-345-6789",
    Status: "Active",
    CreatedAt: "2023-02-20T09:00:00Z",
    UpdatedAt: "2024-05-15T14:00:00Z",
    CreatedBy: "hr@org.gov",
  },
  {
    EmployeeID: "EMP-003",
    FirstName: "Chukwuemeka",
    LastName: "Eze",
    Department: "Information Technology",
    Position: "Systems Administrator",
    Email: "c.eze@org.gov",
    Phone: "+234-803-456-7890",
    Status: "Active",
    CreatedAt: "2023-03-10T10:00:00Z",
    UpdatedAt: "2024-04-20T11:00:00Z",
    CreatedBy: "hr@org.gov",
  },
  {
    EmployeeID: "EMP-004",
    FirstName: "Fatima",
    LastName: "Musa",
    Department: "Legal",
    Position: "Legal Officer",
    Email: "f.musa@org.gov",
    Phone: "+234-804-567-8901",
    Status: "Active",
    CreatedAt: "2023-04-05T08:30:00Z",
    UpdatedAt: "2024-03-10T09:00:00Z",
    CreatedBy: "hr@org.gov",
  },
  {
    EmployeeID: "EMP-005",
    FirstName: "Tunde",
    LastName: "Adeyemi",
    Department: "Operations",
    Position: "Operations Manager",
    Email: "t.adeyemi@org.gov",
    Phone: "+234-805-678-9012",
    Status: "Inactive",
    CreatedAt: "2022-11-01T07:00:00Z",
    UpdatedAt: "2024-01-15T16:00:00Z",
    CreatedBy: "admin@org.gov",
  },
  {
    EmployeeID: "EMP-006",
    FirstName: "Ngozi",
    LastName: "Okonkwo",
    Department: "Audit",
    Position: "Internal Auditor",
    Email: "n.okonkwo@org.gov",
    Phone: "+234-806-789-0123",
    Status: "Active",
    CreatedAt: "2023-06-15T09:00:00Z",
    UpdatedAt: "2024-06-10T12:00:00Z",
    CreatedBy: "hr@org.gov",
  },
];

let employees = [...MOCK_EMPLOYEES];

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    // TODO: Replace with Amplify API call
    // const { data } = await client.models.Employee.list();
    return Promise.resolve([...employees]);
  },

  async getById(id: string): Promise<Employee | null> {
    // TODO: Replace with Amplify API call
    // const { data } = await client.models.Employee.get({ EmployeeID: id });
    const employee = employees.find((e) => e.EmployeeID === id);
    return Promise.resolve(employee || null);
  },

  async create(formData: EmployeeFormData, createdBy: string): Promise<Employee> {
    // TODO: Replace with Amplify API call
    const newEmployee: Employee = {
      ...formData,
      EmployeeID: generateID(),
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      CreatedBy: createdBy,
    };
    employees = [...employees, newEmployee];
    return Promise.resolve(newEmployee);
  },

  async update(id: string, formData: Partial<EmployeeFormData>): Promise<Employee> {
    // TODO: Replace with Amplify API call
    const index = employees.findIndex((e) => e.EmployeeID === id);
    if (index === -1) throw new Error("Employee not found");
    const updated: Employee = {
      ...employees[index],
      ...formData,
      UpdatedAt: new Date().toISOString(),
    };
    employees[index] = updated;
    return Promise.resolve(updated);
  },

  async delete(id: string): Promise<void> {
    // TODO: Replace with Amplify API call
    employees = employees.filter((e) => e.EmployeeID !== id);
    return Promise.resolve();
  },

  async search(query: string): Promise<Employee[]> {
    const q = query.toLowerCase();
    return Promise.resolve(
      employees.filter(
        (e) =>
          e.FirstName.toLowerCase().includes(q) ||
          e.LastName.toLowerCase().includes(q) ||
          e.Email.toLowerCase().includes(q) ||
          e.Department.toLowerCase().includes(q) ||
          e.Position.toLowerCase().includes(q) ||
          e.EmployeeID.toLowerCase().includes(q)
      )
    );
  },

  getStats() {
    const total = employees.length;
    const active = employees.filter((e) => e.Status === "Active").length;
    const inactive = total - active;
    return { total, active, inactive };
  },
};
