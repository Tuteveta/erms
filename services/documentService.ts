import { EmployeeDocument } from "@/types";
import { generateID } from "@/lib/utils";

// Mock documents — replace with Amplify Storage + DynamoDB calls in production
let mockDocuments: EmployeeDocument[] = [
  {
    DocumentID: "DOC-001",
    EmployeeID: "EMP-001",
    FileName: "James_Okafor_Appointment_Letter.pdf",
    FileKey: "documents/EMP-001/appointment_letter.pdf",
    FileSize: 245760,
    UploadedAt: "2023-01-15T10:00:00Z",
    UploadedBy: "admin@org.gov",
    Description: "Appointment Letter",
  },
  {
    DocumentID: "DOC-002",
    EmployeeID: "EMP-001",
    FileName: "James_Okafor_ID_Card.pdf",
    FileKey: "documents/EMP-001/id_card.pdf",
    FileSize: 102400,
    UploadedAt: "2023-01-16T11:00:00Z",
    UploadedBy: "admin@org.gov",
    Description: "Staff ID Card Copy",
  },
  {
    DocumentID: "DOC-003",
    EmployeeID: "EMP-002",
    FileName: "Amina_Bello_Contract.pdf",
    FileKey: "documents/EMP-002/contract.pdf",
    FileSize: 358400,
    UploadedAt: "2023-02-20T12:00:00Z",
    UploadedBy: "hr@org.gov",
    Description: "Employment Contract",
  },
];

export const documentService = {
  async getByEmployeeId(employeeId: string): Promise<EmployeeDocument[]> {
    // TODO: Replace with Amplify Storage list + DynamoDB query
    return Promise.resolve(mockDocuments.filter((d) => d.EmployeeID === employeeId));
  },

  async upload(
    file: File,
    employeeId: string,
    description: string,
    uploadedBy: string
  ): Promise<EmployeeDocument> {
    // TODO: Replace with Amplify Storage upload
    // const result = await uploadData({ key: fileKey, data: file }).result;
    const fileKey = `documents/${employeeId}/${Date.now()}_${file.name}`;
    const newDoc: EmployeeDocument = {
      DocumentID: generateID(),
      EmployeeID: employeeId,
      FileName: file.name,
      FileKey: fileKey,
      FileSize: file.size,
      UploadedAt: new Date().toISOString(),
      UploadedBy: uploadedBy,
      Description: description,
    };
    mockDocuments = [...mockDocuments, newDoc];
    return Promise.resolve(newDoc);
  },

  async delete(documentId: string): Promise<void> {
    // TODO: Replace with Amplify Storage remove + DynamoDB delete
    mockDocuments = mockDocuments.filter((d) => d.DocumentID !== documentId);
    return Promise.resolve();
  },

  async getDownloadUrl(fileKey: string): Promise<string> {
    // TODO: Replace with Amplify Storage getUrl
    // const { url } = await getUrl({ key: fileKey });
    return Promise.resolve(`#download/${fileKey}`);
  },

  getTotalCount(): number {
    return mockDocuments.length;
  },
};
