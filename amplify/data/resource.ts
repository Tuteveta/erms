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
      Status: a.enum(["Active", "Inactive"]),
      CreatedBy: a.string(),
      // Documents linked via EmployeeID
      documents: a.hasMany("EmployeeDocument", "EmployeeID"),
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
