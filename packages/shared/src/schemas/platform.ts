import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.enum(["read", "write"])).optional(),
});
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

export const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  active: z.boolean().optional(),
});
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export const updateWebhookSchema = createWebhookSchema.partial();
