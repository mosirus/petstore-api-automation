import type { APIResponse } from '@playwright/test';
import { z } from 'zod';

/**
 * Parses a JSON response body and validates it against a schema, returning
 * a fully typed value. Contract violations fail with a readable diff.
 */
export async function parseBody<TSchema extends z.ZodType>(
  response: APIResponse,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const body: unknown = await response.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(
      `Response from ${response.url()} does not match the expected schema:\n` +
        `${z.prettifyError(result.error)}\n\nBody: ${JSON.stringify(body, null, 2)}`,
    );
  }
  return result.data;
}
