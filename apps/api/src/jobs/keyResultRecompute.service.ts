import { KeyResult } from "../modules/goals/keyResult.model.js";
import { recomputeKeyResultBinding } from "../modules/goals/keyResultBinding.service.js";

export async function recomputeAllBoundKeyResults(): Promise<number> {
  const bound = await KeyResult.find({ binding: { $ne: null } });
  for (const kr of bound) {
    await recomputeKeyResultBinding(kr);
  }
  return bound.length;
}
