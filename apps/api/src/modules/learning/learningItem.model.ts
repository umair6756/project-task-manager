// WHAT: A course/book/video/article/tutorial being tracked through a status
// pipeline, with a flexible progress unit (CLAUDE.md §1 module E).
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { softDeletePlugin } from "../../db/softDeletePlugin.js";

const progressEntrySchema = new Schema(
  {
    value: { type: Number, required: true }, // absolute progressCurrent at this point in time
    note: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const sectionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true, timestamps: false },
);

const learningItemSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["course", "book", "video", "article", "tutorial"], required: true },
    title: { type: String, required: true, trim: true },
    source: { type: String, default: "" }, // platform/publisher name
    url: { type: String, default: "" },
    status: {
      type: String,
      enum: ["wishlist", "learning", "completed", "abandoned"],
      default: "wishlist",
    },
    progressUnit: { type: String, enum: ["percent", "pages", "lectures", "hours"], default: "percent" },
    progressCurrent: { type: Number, default: 0 },
    progressTarget: { type: Number, default: 100 },
    progressHistory: { type: [progressEntrySchema], default: [] },
    sections: { type: [sectionSchema], default: [] },
    skillIds: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    takeaways: { type: String, default: "" },
    noteIds: [{ type: Schema.Types.ObjectId, ref: "Note" }],
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

learningItemSchema.index({ userId: 1, status: 1 });
learningItemSchema.plugin(softDeletePlugin);

export type LearningItemDoc = HydratedDocument<InferSchemaType<typeof learningItemSchema>>;
export const LearningItem = model("LearningItem", learningItemSchema);
