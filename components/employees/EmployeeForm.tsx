"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeFormData, DEPARTMENTS, EmployeeStatus } from "@/types";
import { Loader2 } from "lucide-react";

interface EmployeeFormProps {
  initialData?: Partial<EmployeeFormData>;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function EmployeeForm({ initialData, onSubmit, onCancel, submitLabel = "Save" }: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    FirstName: initialData?.FirstName || "",
    LastName: initialData?.LastName || "",
    Department: initialData?.Department || "",
    Position: initialData?.Position || "",
    Email: initialData?.Email || "",
    Phone: initialData?.Phone || "",
    Status: initialData?.Status || "Active",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};
    if (!formData.FirstName.trim()) newErrors.FirstName = "First name is required";
    if (!formData.LastName.trim()) newErrors.LastName = "Last name is required";
    if (!formData.Department) newErrors.Department = "Department is required";
    if (!formData.Position.trim()) newErrors.Position = "Position is required";
    if (!formData.Email.trim()) {
      newErrors.Email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      newErrors.Email = "Invalid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof EmployeeFormData) => ({
    value: formData[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="FirstName">First Name *</Label>
          <Input id="FirstName" placeholder="First name" {...field("FirstName")} />
          {errors.FirstName && <p className="text-xs text-destructive">{errors.FirstName}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="LastName">Last Name *</Label>
          <Input id="LastName" placeholder="Last name" {...field("LastName")} />
          {errors.LastName && <p className="text-xs text-destructive">{errors.LastName}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="Email">Email Address *</Label>
        <Input id="Email" type="email" placeholder="employee@org.gov" {...field("Email")} />
        {errors.Email && <p className="text-xs text-destructive">{errors.Email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="Phone">Phone Number</Label>
        <Input id="Phone" placeholder="+234-800-000-0000" {...field("Phone")} />
      </div>

      <div className="space-y-1.5">
        <Label>Department *</Label>
        <Select
          value={formData.Department}
          onValueChange={(val) => setFormData((prev) => ({ ...prev, Department: val }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.Department && <p className="text-xs text-destructive">{errors.Department}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="Position">Job Title / Position *</Label>
        <Input id="Position" placeholder="e.g. Senior Officer" {...field("Position")} />
        {errors.Position && <p className="text-xs text-destructive">{errors.Position}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Employment Status</Label>
        <Select
          value={formData.Status}
          onValueChange={(val) => setFormData((prev) => ({ ...prev, Status: val as EmployeeStatus }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="OnLeave">On Leave</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
