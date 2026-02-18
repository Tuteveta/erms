import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { UserPlus, Edit2, Trash2, Upload, FileText, Shield } from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: "create" | "edit" | "delete" | "upload" | "report" | "auth";
}

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    action: "Employee Created",
    description: "Ngozi Okonkwo added to Audit department",
    timestamp: "2024-06-10T12:00:00Z",
    type: "create",
  },
  {
    id: "2",
    action: "Document Uploaded",
    description: "Contract.pdf uploaded for Amina Bello",
    timestamp: "2024-06-09T14:30:00Z",
    type: "upload",
  },
  {
    id: "3",
    action: "Record Updated",
    description: "James Okafor position updated",
    timestamp: "2024-06-08T09:15:00Z",
    type: "edit",
  },
  {
    id: "4",
    action: "Report Generated",
    description: "Monthly employee summary exported",
    timestamp: "2024-06-07T16:00:00Z",
    type: "report",
  },
  {
    id: "5",
    action: "Permissions Updated",
    description: "HR Officer Kemi Adeleke permissions modified",
    timestamp: "2024-06-06T11:00:00Z",
    type: "auth",
  },
];

const iconMap = {
  create: { icon: UserPlus, color: "text-green-600", bg: "bg-green-50" },
  edit: { icon: Edit2, color: "text-blue-600", bg: "bg-blue-50" },
  delete: { icon: Trash2, color: "text-red-600", bg: "bg-red-50" },
  upload: { icon: Upload, color: "text-purple-600", bg: "bg-purple-50" },
  report: { icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
  auth: { icon: Shield, color: "text-gray-600", bg: "bg-gray-100" },
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK_ACTIVITY.map((item) => {
          const { icon: Icon, color, bg } = iconMap[item.type];
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`rounded-full p-1.5 ${bg} shrink-0`}>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.action}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                <p className="text-xs text-muted-foreground/70">{formatDateTime(item.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
