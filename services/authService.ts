import { AuthUser, UserRole, AllowedAction } from "@/types";
import { mapGroupToRole } from "@/lib/auth";

// Mock HR Officers with assigned permissions
let mockHROfficers = [
  {
    UserID: "USR-003",
    Email: "officer1@org.gov",
    Name: "Kemi Adeleke",
    AllowedActions: ["VIEW_EMPLOYEE", "UPLOAD_DOCUMENTS"] as AllowedAction[],
    CreatedAt: "2024-01-10T08:00:00Z",
    AssignedBy: "manager@org.gov",
  },
  {
    UserID: "USR-004",
    Email: "officer2@org.gov",
    Name: "Seun Bakare",
    AllowedActions: ["VIEW_EMPLOYEE", "CREATE_EMPLOYEE", "EDIT_EMPLOYEE"] as AllowedAction[],
    CreatedAt: "2024-02-15T09:00:00Z",
    AssignedBy: "manager@org.gov",
  },
];

export const authService = {
  // Sign in via Cognito (wrapper)
  async signIn(email: string, password: string): Promise<AuthUser> {
    // TODO: Replace with Amplify Auth.signIn
    // const { isSignedIn, nextStep } = await signIn({ username: email, password });

    // Mock implementation for development
    if (email === "admin@org.gov" && password === "Admin@1234") {
      return { userId: "USR-001", email, name: "Super Admin", role: "SuperAdmin" };
    }
    if (email === "manager@org.gov" && password === "Manager@1234") {
      return { userId: "USR-002", email, name: "HR Manager", role: "HRManager" };
    }
    if (email === "officer1@org.gov" && password === "Officer@1234") {
      const officer = mockHROfficers.find((o) => o.Email === email);
      return {
        userId: "USR-003",
        email,
        name: officer?.Name,
        role: "HROfficer",
        allowedActions: officer?.AllowedActions,
      };
    }
    throw new Error("Invalid credentials. Please check your email and password.");
  },

  async signOut(): Promise<void> {
    // TODO: Replace with Amplify Auth.signOut
    // await signOut();
    return Promise.resolve();
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    // TODO: Replace with Amplify Auth.getCurrentUser
    // const user = await getCurrentUser();
    const stored = typeof window !== "undefined" ? localStorage.getItem("erms_user") : null;
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  },

  async getHROfficers() {
    return Promise.resolve([...mockHROfficers]);
  },

  async createHROfficer(
    email: string,
    name: string,
    allowedActions: AllowedAction[],
    assignedBy: string
  ) {
    // TODO: Replace with Cognito createUser + assign group
    const newOfficer = {
      UserID: `USR-${Date.now()}`,
      Email: email,
      Name: name,
      AllowedActions: allowedActions,
      CreatedAt: new Date().toISOString(),
      AssignedBy: assignedBy,
    };
    mockHROfficers = [...mockHROfficers, newOfficer];
    return Promise.resolve(newOfficer);
  },

  async updateHROfficerPermissions(userId: string, allowedActions: AllowedAction[]) {
    const index = mockHROfficers.findIndex((o) => o.UserID === userId);
    if (index !== -1) {
      mockHROfficers[index] = { ...mockHROfficers[index], AllowedActions: allowedActions };
    }
    return Promise.resolve(mockHROfficers[index]);
  },

  async deleteHROfficer(userId: string) {
    mockHROfficers = mockHROfficers.filter((o) => o.UserID !== userId);
    return Promise.resolve();
  },
};
