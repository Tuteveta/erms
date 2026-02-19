import { client } from "@/lib/amplify-client";
import { generateID } from "@/lib/utils";

export type ActivityResourceType = "Employee" | "Document" | "Leave" | "User" | "Permission";

export interface ActivityLogEntry {
  id: string;
  LogID: string;
  UserEmail: string;
  UserName?: string;
  Action: string;
  ResourceType: ActivityResourceType;
  ResourceID: string;
  Description: string;
  Details?: string;
  CreatedAt: string;
}

function mapLog(item: any): ActivityLogEntry {
  return {
    id: item.id,
    LogID: item.LogID,
    UserEmail: item.UserEmail,
    UserName: item.UserName ?? undefined,
    Action: item.Action,
    ResourceType: item.ResourceType ?? "Employee",
    ResourceID: item.ResourceID,
    Description: item.Description,
    Details: item.Details ?? undefined,
    CreatedAt: item.createdAt ?? new Date().toISOString(),
  };
}

export const activityLogService = {
  async log(
    action: string,
    resourceType: ActivityResourceType,
    resourceId: string,
    description: string,
    userEmail: string,
    userName?: string,
    details?: string
  ): Promise<void> {
    try {
      await client.models.ActivityLog.create({
        LogID: generateID().replace("EMP-", "LOG-"),
        UserEmail: userEmail,
        UserName: userName,
        Action: action,
        ResourceType: resourceType,
        ResourceID: resourceId,
        Description: description,
        Details: details,
      });
    } catch {
      // Never let logging failures break the primary operation
    }
  },

  async getRecent(limit = 10): Promise<ActivityLogEntry[]> {
    const { data } = await client.models.ActivityLog.list();
    return (data ?? [])
      .map(mapLog)
      .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())
      .slice(0, limit);
  },

  async getAll(): Promise<ActivityLogEntry[]> {
    const { data } = await client.models.ActivityLog.list();
    return (data ?? [])
      .map(mapLog)
      .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
  },

  async delete(id: string): Promise<void> {
    await client.models.ActivityLog.delete({ id });
  },
};
