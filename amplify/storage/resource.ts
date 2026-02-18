import { defineStorage } from "@aws-amplify/backend";

/**
 * ERMS Document Storage Configuration
 * S3 bucket for storing employee PDF documents.
 * Access is controlled via Cognito groups.
 */
export const storage = defineStorage({
  name: "erms-documents",
  access: (allow) => ({
    // HR Managers and Super Admins can upload, read, and delete
    "documents/*": [
      allow.groups(["SuperAdmin", "HRManager"]).to(["read", "write", "delete"]),
      allow.groups(["HROfficer"]).to(["read"]),
    ],
  }),
});
