import type { TestDetails } from '@playwright/test';

interface KnownIssue {
  id: string;
  summary: string;
}

/**
 * Deviations between the Swagger spec and the live sandbox, found during
 * manual testing (Task 1). Tests tagged with these assert the *observed*
 * behavior so they act as regression guards: if the API is fixed upstream,
 * the test fails and signals that the issue entry must be revisited.
 */
export const KnownIssues = {
  BUG_01: { id: 'BUG-01', summary: 'POST /pet accepts payloads missing required fields (expected 400, got 200)' },
  BUG_02: { id: 'BUG-02', summary: 'POST /pet returns 500 for a non-numeric id (expected 400)' },
  BUG_03: { id: 'BUG-03', summary: 'findByStatus returns 200 [] for an unsupported status (expected 400)' },
  BUG_04: { id: 'BUG-04', summary: 'findByStatus returns 200 [] when required "status" is omitted (expected 400)' },
  BUG_05: { id: 'BUG-05', summary: 'DELETE /pet/{petId} leaks a Java stack trace for a non-numeric id (expected 400)' },
} as const satisfies Record<string, KnownIssue>;

/** Test details that tag a test as a known issue and surface it in the HTML report. */
export function knownIssue(issue: KnownIssue): TestDetails {
  return {
    tag: '@known-issue',
    annotation: { type: 'issue', description: `${issue.id}: ${issue.summary}` },
  };
}
