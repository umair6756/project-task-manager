// WHAT: Shape of an exported user-data blob, as produced by
// export.service.ts and consumed by import.service.ts. Fields are `any`-
// shaped on purpose (lean Mongo documents straight off the wire) — this is
// a data-transfer format, not a runtime-validated domain type.
export interface ExportedData {
  exportedAt: string;
  version: number;
  data: Record<string, Array<Record<string, unknown> & { _id: unknown }>>;
}
