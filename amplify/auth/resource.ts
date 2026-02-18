import { defineAuth } from "@aws-amplify/backend";

/**
 * ERMS Authentication Configuration
 * Uses Amazon Cognito with user groups for role-based access control.
 *
 * Groups:
 *   - SuperAdmin: Full system control (developer/infrastructure)
 *   - HRManager:  Create officers, assign permissions, generate reports
 *   - HROfficer:  Permissions assigned individually by HR Manager
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ["SuperAdmin", "HRManager", "HROfficer"],
});
