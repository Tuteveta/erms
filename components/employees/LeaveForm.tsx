"use client";

import React, { useState } from "react";
import { LeaveFormData, LeaveType, LeaveStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface LeaveFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveFormData) => Promise<void>;
  employeeName: string;
  initial?: Partial<LeaveFormData>;
}

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: "Sick", label: "Sick Leave" },
  { value: "Annual", label: "Annual Leave" },
  { value: "Maternity", label: "Maternity Leave" },
  { value: "Paternity", label: "Paternity Leave" },
  { value: "Emergency", label: "Emergency Leave" },
  { value: "Other", label: "Other" },
];

const LEAVE_STATUSES: { value: LeaveStatus; label: string }[] = [
  { value: "Approved", label: "Approved" },
  { value: "Pending", label: "Pending" },
  { value: "Rejected", label: "Rejected" },
];

export function LeaveForm({ open, onClose, onSubmit, employeeName, initial }: LeaveFormProps) {
  const [form, setForm] = useState<LeaveFormData>({
    LeaveType: initial?.LeaveType ?? "Annual",
    StartDate: initial?.StartDate ?? "",
    EndDate: initial?.EndDate ?? "",
    Reason: initial?.Reason ?? "",
    Status: initial?.Status ?? "Approved",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeaveFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  function validate(): boolean {
    const errs: Partial<Record<keyof LeaveFormData, string>> = {};
    if (!form.StartDate) errs.StartDate = "Start date is required.";
    if (!form.EndDate) errs.EndDate = "End date is required.";
    if (form.StartDate && form.EndDate && form.EndDate < form.StartDate) {
      errs.EndDate = "End date must be on or after start date.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({ ...form, Reason: form.Reason || undefined });
      onClose();
    } catch (err: any) {
      setServerError(err.message ?? "Failed to save leave record.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Leave</DialogTitle>
          <DialogDescription>Record a leave period for {employeeName}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Type */}
          <div className="space-y-1.5">
            <Label htmlFor="leave-type">Leave Type</Label>
            <Select
              value={form.LeaveType}
              onValueChange={(v) => setForm((f) => ({ ...f, LeaveType: v as LeaveType }))}
            >
              <SelectTrigger id="leave-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={form.StartDate}
                onChange={(e) => setForm((f) => ({ ...f, StartDate: e.target.value }))}
                className={errors.StartDate ? "border-destructive" : ""}
              />
              {errors.StartDate && <p className="text-xs text-destructive">{errors.StartDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={form.EndDate}
                min={form.StartDate || undefined}
                onChange={(e) => setForm((f) => ({ ...f, EndDate: e.target.value }))}
                className={errors.EndDate ? "border-destructive" : ""}
              />
              {errors.EndDate && <p className="text-xs text-destructive">{errors.EndDate}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="leave-status">Approval Status</Label>
            <Select
              value={form.Status}
              onValueChange={(v) => setForm((f) => ({ ...f, Status: v as LeaveStatus }))}
            >
              <SelectTrigger id="leave-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="reason"
              placeholder="Brief description of leave reason"
              value={form.Reason ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, Reason: e.target.value }))}
            />
          </div>

          {serverError && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {serverError}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Leave
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
