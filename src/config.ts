import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  API_BASE_URL: z.url().default('https://petstore.swagger.io/v2'),
  API_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
}

export const config = {
  /**
   * Always ends with "/" so relative endpoint paths ("pet", not "/pet") are
   * resolved *under* it. A leading slash on the path would drop the "/v2"
   * segment of the base URL (standard URL resolution).
   */
  baseUrl: parsed.data.API_BASE_URL.replace(/\/?$/, '/'),
  timeoutMs: parsed.data.API_TIMEOUT_MS,
} as const;
