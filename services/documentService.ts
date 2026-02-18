import { EmployeeDocument } from "@/types";
import { generateID } from "@/lib/utils";
import { uploadData, getUrl, remove } from "aws-amplify/storage";
import { client } from "@/lib/amplify-client";

function mapDocument(item: any): EmployeeDocument {
  return {
    DocumentID: item.DocumentID,
    EmployeeID: item.EmployeeID,
    FileName: item.FileName,
    FileKey: item.FileKey,
    FileSize: item.FileSize ?? 0,
    UploadedAt: item.createdAt ?? new Date().toISOString(),
    UploadedBy: item.UploadedBy ?? "",
    Description: item.Description ?? undefined,
  };
}

export const documentService = {
  async getByEmployeeId(employeeId: string): Promise<EmployeeDocument[]> {
    const { data } = await client.models.EmployeeDocument.list({
      filter: { EmployeeID: { eq: employeeId } },
    });
    return (data ?? []).map(mapDocument);
  },

  async upload(
    file: File,
    employeeId: string,
    description: string,
    uploadedBy: string
  ): Promise<EmployeeDocument> {
    const fileKey = `documents/${employeeId}/${Date.now()}_${file.name}`;

    // Upload file to S3
    await uploadData({ path: fileKey, data: file }).result;

    // Save metadata to DynamoDB via AppSync
    const { data } = await client.models.EmployeeDocument.create({
      DocumentID: generateID(),
      EmployeeID: employeeId,
      FileName: file.name,
      FileKey: fileKey,
      FileSize: file.size,
      UploadedBy: uploadedBy,
      Description: description,
    });
    if (!data) throw new Error("Failed to save document metadata");
    return mapDocument(data);
  },

  async delete(documentId: string): Promise<void> {
    const { data: records } = await client.models.EmployeeDocument.list({
      filter: { DocumentID: { eq: documentId } },
    });
    if (!records || records.length === 0) return;
    const record = records[0];

    // Delete from S3
    await remove({ path: record.FileKey });

    // Delete metadata from DynamoDB
    await client.models.EmployeeDocument.delete({ id: record.id });
  },

  async getDownloadUrl(fileKey: string): Promise<string> {
    const { url } = await getUrl({ path: fileKey });
    return url.toString();
  },

  async getTotalCount(): Promise<number> {
    const { data } = await client.models.EmployeeDocument.list();
    return (data ?? []).length;
  },
};
