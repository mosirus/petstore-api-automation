import { expect as baseExpect, type APIResponse } from '@playwright/test';

export const expect = baseExpect.extend({
  /** Like `toBeOK()`, but for an exact status code; prints the body on failure. */
  async toHaveStatusCode(response: APIResponse, expected: number) {
    const actual = response.status();
    const pass = actual === expected;
    const body = pass === this.isNot ? await response.text().catch(() => '<unreadable body>') : '';

    return {
      pass,
      name: 'toHaveStatusCode',
      expected,
      actual,
      message: () =>
        `${this.utils.matcherHint('toHaveStatusCode', 'response', 'expected', { isNot: this.isNot })}\n\n` +
        `${response.url()}\n` +
        `Expected status: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(expected)}\n` +
        `Received status: ${this.utils.printReceived(actual)}\n` +
        `Response body: ${body}`,
    };
  },
});
