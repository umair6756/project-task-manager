import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const pomodoroSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", default: null },
    workLenMin: { type: Number, required: true },
    breakLenMin: { type: Number, required: true },
    cycles: { type: Number, required: true },
    currentCycle: { type: Number, default: 1 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

pomodoroSessionSchema.index({ userId: 1, createdAt: -1 });

export type PomodoroSessionDoc = HydratedDocument<InferSchemaType<typeof pomodoroSessionSchema>>;
export const PomodoroSession = model("PomodoroSession", pomodoroSessionSchema);
