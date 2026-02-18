import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.js";
import { data } from "./data/resource.js";
import { storage } from "./storage/resource.js";

/**
 * ERMS Backend Configuration
 * Wires together Cognito Auth, DynamoDB via AppSync, and S3 Storage.
 */
defineBackend({
  auth,
  data,
  storage,
});
