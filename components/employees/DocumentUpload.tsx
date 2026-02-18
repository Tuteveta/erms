"use client";

import React, { useState, useRef } from "react";
import { EmployeeDocument } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { documentService } from "@/services/documentService";
import { formatDate, formatFileSize } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Trash2, Download, Loader2 } from "lucide-react";

interface DocumentUploadProps {
  employeeId: string;
  documents: EmployeeDocument[];
  onUpdate: () => void;
  canUpload?: boolean;
  canDelete?: boolean;
}

export function DocumentUpload({
  employeeId,
  documents,
  onUpdate,
  canUpload = true,
  canDelete = false,
}: DocumentUploadProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "Invalid File", description: "Only PDF files are accepted.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    setUploading(true);
    try {
      await documentService.upload(selectedFile, employeeId, description, user.email);
      toast({ title: "Document Uploaded", description: `${selectedFile.name} has been uploaded.` });
      setSelectedFile(null);
      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUpdate();
    } catch {
      toast({ title: "Upload Failed", description: "Could not upload the document.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: EmployeeDocument) => {
    try {
      await documentService.delete(doc.DocumentID);
      toast({ title: "Document Removed", description: `${doc.FileName} has been deleted.` });
      onUpdate();
    } catch {
      toast({ title: "Error", description: "Could not delete document.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {canUpload && (
        <div className="rounded-lg border border-dashed p-4 space-y-3">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Upload Document</p>
            <p className="text-xs text-muted-foreground">PDF files only, max 10MB</p>
          </div>
          <div className="space-y-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            {selectedFile && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded">
                  Selected: <strong>{selectedFile.name}</strong> ({formatFileSize(selectedFile.size)})
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description (optional)</Label>
                  <Input
                    placeholder="e.g. Appointment Letter"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <Button onClick={handleUpload} disabled={uploading} className="w-full h-8" size="sm">
                  {uploading ? (
                    <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="mr-2 h-3 w-3" /> Upload to S3</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-2">
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No documents uploaded yet.
          </p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.DocumentID}
              className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded bg-red-50 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doc.FileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.Description && <span className="mr-2">{doc.Description} •</span>}
                    {formatFileSize(doc.FileSize)} • {formatDate(doc.UploadedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => window.open(doc.FileKey, "_blank")}
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(doc)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
