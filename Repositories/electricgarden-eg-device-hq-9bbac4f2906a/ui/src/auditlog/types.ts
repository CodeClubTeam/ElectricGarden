export interface AuditLog {
  createdOn: Date;
  type: string;
  content?: unknown;
}
