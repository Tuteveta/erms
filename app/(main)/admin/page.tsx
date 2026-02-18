"use client";

import React, { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { AllowedAction } from "@/types";
import { ACTION_LABELS as actionLabels } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { UserPlus, Edit2, Trash2, ShieldAlert, Loader2, Shield, CheckSquare, Square } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ALL_ACTIONS: AllowedAction[] = [
  "CREATE_EMPLOYEE",
  "EDIT_EMPLOYEE",
  "DELETE_EMPLOYEE",
  "VIEW_EMPLOYEE",
  "UPLOAD_DOCUMENTS",
  "VIEW_DOCUMENTS",
  "GENERATE_REPORTS",
];

export default function AdminPage() {
  const { user } = useAuth();
  const { isAtLeast } = usePermissions();
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editOfficer, setEditOfficer] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Create officer form state
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedActions, setSelectedActions] = useState<AllowedAction[]>(["VIEW_EMPLOYEE"]);

  const loadOfficers = async () => {
    try {
      const data = await authService.getHROfficers();
      setOfficers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOfficers(); }, []);

  if (!isAtLeast("HRManager")) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader pageTitle="Administration" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="font-semibold">Access restricted to HR Managers and Administrators.</p>
          </div>
        </div>
      </div>
    );
  }

  const toggleAction = (action: AllowedAction, current: AllowedAction[], setter: (v: AllowedAction[]) => void) => {
    if (current.includes(action)) {
      setter(current.filter((a) => a !== action));
    } else {
      setter([...current, action]);
    }
  };

  const handleCreate = async () => {
    if (!newEmail || !newName) {
      toast({ title: "Validation Error", description: "Email and name are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await authService.createHROfficer(newEmail, newName, selectedActions, user?.email || "");
      toast({ title: "HR Officer Created", description: `${newName} has been added.` });
      setShowCreateDialog(false);
      setNewEmail(""); setNewName(""); setSelectedActions(["VIEW_EMPLOYEE"]);
      loadOfficers();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!editOfficer) return;
    setSaving(true);
    try {
      await authService.updateHROfficerPermissions(editOfficer.UserID, editOfficer.AllowedActions);
      toast({ title: "Permissions Updated", description: `${editOfficer.Name}'s permissions have been updated.` });
      setEditOfficer(null);
      loadOfficers();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (officerId: string, name: string) => {
    if (!confirm(`Remove HR Officer ${name}?`)) return;
    await authService.deleteHROfficer(officerId);
    toast({ title: "Officer Removed", description: `${name} has been removed from the system.` });
    loadOfficers();
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader pageTitle="Administration" pageDescription="Manage HR Officers and permissions" />
      <div className="flex-1 p-6 space-y-6">
        <PageHeader
          title="System Administration"
          description="Manage HR Officer accounts and their assigned permissions"
        >
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add HR Officer
          </Button>
        </PageHeader>

        {/* Role Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { role: "Super Admin", desc: "Full system control, infrastructure, logs", color: "bg-purple-50 border-purple-200" },
            { role: "HR Manager", desc: "Create officers, assign permissions, reports", color: "bg-blue-50 border-blue-200" },
            { role: "HR Officer", desc: "Permissions assigned individually by HR Manager", color: "bg-green-50 border-green-200" },
          ].map((r) => (
            <div key={r.role} className={`rounded-lg border p-4 ${r.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <p className="font-semibold text-sm">{r.role}</p>
              </div>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>

        {/* HR Officers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">HR Officers</CardTitle>
            <CardDescription>Manage accounts and individual permission sets</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer</TableHead>
                    <TableHead>Assigned Permissions</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                        No HR Officers created yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    officers.map((officer) => (
                      <TableRow key={officer.UserID}>
                        <TableCell>
                          <p className="font-medium text-sm">{officer.Name}</p>
                          <p className="text-xs text-muted-foreground">{officer.Email}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {officer.AllowedActions.map((action: AllowedAction) => (
                              <Badge key={action} variant="info" className="text-xs">
                                {actionLabels[action]}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(officer.CreatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditOfficer({ ...officer })}
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(officer.UserID, officer.Name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create HR Officer Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create HR Officer</DialogTitle>
            <DialogDescription>
              Add a new HR Officer and assign their permissions. An invitation will be sent via Cognito.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input placeholder="e.g. Jane Smith" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input type="email" placeholder="officer@org.gov" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Allowed Permissions</Label>
              <div className="space-y-2 rounded-md border p-3">
                {ALL_ACTIONS.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => toggleAction(action, selectedActions, setSelectedActions)}
                    className="flex items-center gap-2 w-full text-left text-sm hover:bg-muted px-2 py-1.5 rounded transition-colors"
                  >
                    {selectedActions.includes(action) ? (
                      <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    {actionLabels[action]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Officer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      {editOfficer && (
        <Dialog open={!!editOfficer} onOpenChange={(open) => !open && setEditOfficer(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Permissions</DialogTitle>
              <DialogDescription>
                Update permissions for <strong>{editOfficer.Name}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 rounded-md border p-3">
              {ALL_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() =>
                    setEditOfficer((prev: any) => ({
                      ...prev,
                      AllowedActions: prev.AllowedActions.includes(action)
                        ? prev.AllowedActions.filter((a: AllowedAction) => a !== action)
                        : [...prev.AllowedActions, action],
                    }))
                  }
                  className="flex items-center gap-2 w-full text-left text-sm hover:bg-muted px-2 py-1.5 rounded transition-colors"
                >
                  {editOfficer.AllowedActions.includes(action) ? (
                    <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  {actionLabels[action]}
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOfficer(null)}>Cancel</Button>
              <Button onClick={handleUpdatePermissions} disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Permissions"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
