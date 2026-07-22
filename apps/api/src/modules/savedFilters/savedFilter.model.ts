import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const savedFilterSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    // Structured query only (never raw Mongo/user-supplied query strings) —
    // translated to a safe filter in savedFilter.service.ts.
    query: {
      status: { type: [String], default: undefined },
      priority: { type: [String], default: undefined },
      labels: { type: [Schema.Types.ObjectId], default: undefined },
      projectId: { type: Schema.Types.ObjectId, default: null },
      dueBefore: { type: Date, default: null },
      dueAfter: { type: Date, default: null },
    },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

savedFilterSchema.index({ userId: 1 });

export type SavedFilterDoc = HydratedDocument<InferSchemaType<typeof savedFilterSchema>>;
export const SavedFilter = model("SavedFilter", savedFilterSchema);
