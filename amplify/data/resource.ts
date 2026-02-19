import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * ERMS Data Schema
 * Defines DynamoDB tables for Employee records, documents metadata,
 * and permission sets. Secured via Cognito user group authorization.
 */
const schema = a.schema({
  // ── Employee Records ──────────────────────────────────────────────────
  Employee: a
    .model({
      EmployeeID: a.id().required(),
      FirstName: a.string().required(),
      LastName: a.string().required(),
      Department: a.string().required(),
      Position: a.string().required(),
      Email: a.email().required(),
      Phone: a.phone(),
      Status: a.enum(["Active", "Inactive", "OnLeave"]),
      CreatedBy: a.string(),
      // Documents linked via EmployeeID
      documents: a.hasMany("EmployeeDocument", "EmployeeID"),
      // Leave records linked via EmployeeID
      leaves: a.hasMany("EmployeeLeave", "EmployeeID"),
    })
    .authorization((allow) => [
      allow.groups(["SuperAdmin", "HRManager"]).to(["create", "read", "update", "delete"]),
      allow.groups(["HROfficer"]).to(["read"]),
    ]),

  // ── Employee Documents (S3 metadata) ──────────────────────────────────
  EmployeeDocument: a
    .model({
      DocumentID: a.id().required(),
      EmployeeID: a.string().required(),
      FileName: a.string().required(),
      FileKey: a.string().required(), // S3 object key
      FileSize: a.integer(),
      Description: a.string(),
      UploadedBy: a.string(),
      // Belongs to Employee
      employee: a.belongsTo("Employee", "EmployeeID"),
    })
    .authorization((allow) => [
      allow.groups(["SuperAdmin", "HRManager"]).to(["create", "read", "update", "delete"]),
      allow.groups(["HROfficer"]).to(["read"]),
    ]),

  // ── Employee Leave Records ─────────────────────────────────────────────
  EmployeeLeave: a
    .model({
      LeaveID: a.id().required(),
      EmployeeID: a.string().required(),
      LeaveType: a.enum(["Sick", "Annual", "Maternity", "Paternity", "Emergency", "Other"]),
      StartDate: a.date().required(),
      EndDate: a.date().required(),
      Reason: a.string(),
      Status: a.enum(["Pending", "Approved", "Rejected"]),
      ApprovedBy: a.string(),
      CreatedBy: a.string(),
      // Belongs to Employee
      employee: a.belongsTo("Employee", "EmployeeID"),
    })
    .authorization((allow) => [
      allow.groups(["SuperAdmin", "HRManager"]).to(["create", "read", "update", "delete"]),
      allow.groups(["HROfficer"]).to(["read"]),
    ]),

  // ── Activity / Audit Log ──────────────────────────────────────────────
  ActivityLog: a
    .model({
      LogID: a.id().required(),
      UserEmail: a.string().required(),
      UserName: a.string(),
      Action: a.string().required(),         // e.g. "Employee Created"
      ResourceType: a.enum(["Employee", "Document", "Leave", "User", "Permission"]),
      ResourceID: a.string().required(),
      Description: a.string().required(),   // human-readable summary
      Details: a.string(),                  // optional JSON / extra info
    })
    .authorization((allow) => [
      allow.groups(["SuperAdmin", "HRManager"]).to(["create", "read", "delete"]),
      allow.groups(["HROfficer"]).to(["create", "read"]),
    ]),

  // ── Permission Sets ────────────────────────────────────────────────────
  Permission: a
    .model({
      RoleID: a.id().required(),
      UserID: a.string().required(), // Cognito user sub
      Email: a.email().required(),
      Name: a.string(),
      AllowedActions: a.string().array(), // JSON array of AllowedAction strings
      AssignedBy: a.string(),
    })
    .authorization((allow) => [
      allow.groups(["SuperAdmin", "HRManager"]).to(["create", "read", "update", "delete"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
