// WHAT: Generic trash operations across every soft-deletable model, keyed
// by the TRASHABLE_MODELS registry. WHY: CLAUDE.md §2 asks for "soft delete
// + trash endpoints (list, restore, purge) generic across models via a
// shared plugin" rather than one trash implementation per module.
import mongoose from "mongoose";
import { TRASHABLE_MODELS, type TrashableModel } from "../../db/softDeletePlugin.js";
import { AppError } from "../../utils/AppError.js";

function assertTrashable(modelName: string): asserts modelName is TrashableModel {
  if (!(TRASHABLE_MODELS as readonly string[]).includes(modelName)) {
    throw AppError.badRequest(`Unknown or non-trashable model: ${modelName}`);
  }
}

export interface TrashItem {
  model: TrashableModel;
  id: string;
  deletedAt: Date;
  data: Record<string, unknown>;
}

export async function listTrash(userId: string): Promise<TrashItem[]> {
  const results = await Promise.all(
    TRASHABLE_MODELS.map(async (modelName) => {
      const Model = mongoose.model(modelName);
      const docs = await Model.find({ userId, deletedAt: { $ne: null } })
        .setOptions({ withDeleted: true })
        .sort({ deletedAt: -1 })
        .lean();
      return docs.map((doc: Record<string, unknown>) => ({
        model: modelName,
        id: String(doc._id),
        deletedAt: doc.deletedAt as Date,
        data: doc,
      }));
    }),
  );
  return results.flat().sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
}

export async function restoreTrashItem(modelName: string, id: string, userId: string): Promise<void> {
  assertTrashable(modelName);
  const Model = mongoose.model(modelName);
  const result = await Model.updateOne(
    { _id: id, userId, deletedAt: { $ne: null } },
    { $set: { deletedAt: null } },
  ).setOptions({ withDeleted: true });
  if (result.matchedCount === 0) throw AppError.notFound("Trash item not found");
}

export async function purgeTrashItem(modelName: string, id: string, userId: string): Promise<void> {
  assertTrashable(modelName);
  const Model = mongoose.model(modelName);
  const result = await Model.deleteOne({ _id: id, userId, deletedAt: { $ne: null } }).setOptions({
    withDeleted: true,
  });
  if (result.deletedCount === 0) throw AppError.notFound("Trash item not found");
}
