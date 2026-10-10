# Task 2 — API Automation Test Report

**Target:** Swagger Petstore API — `https://petstore.swagger.io/v2`
**Framework:** Playwright Test (`@playwright/test` request context), TypeScript
**Endpoints covered:** `POST /pet`, `GET /pet/findByStatus`, `DELETE /pet/{petId}`

## Suite overview

| Spec file | Tests | Maps to manual TC (Task 1) |
|---|---|---|
| `tests/api/post-pet.spec.ts` | 3 | TC-01, TC-02, TC-03 |
| `tests/api/find-by-status.spec.ts` | 3 | TC-04, TC-05, TC-06 |
| `tests/api/delete-pet.spec.ts` | 3 | TC-07, TC-08, TC-09 |
| **Total** | **9** | |

`npx playwright test --config=config/playwright.config.ts --list` confirms all 9 tests are discovered and wired correctly:

```
api/delete-pet.spec.ts:5:7     › deletes an existing pet and the record is no longer retrievable @smoke
api/delete-pet.spec.ts:18:7    › [known issue BUG-05] returns 200 instead of 404 when deleting a non-existent pet id
api/delete-pet.spec.ts:33:7    › [known issue BUG-06] leaks an internal stack trace for a non-numeric petId
api/find-by-status.spec.ts:5:7 › returns only pets matching the requested status @smoke
api/find-by-status.spec.ts:20:7› [known issue BUG-03] returns 200 with an empty array for an unsupported status value
api/find-by-status.spec.ts:32:7› [known issue BUG-04] returns 200 with an empty array when the required status param is omitted
api/post-pet.spec.ts:5:7       › creates a pet and echoes the submitted payload @smoke
api/post-pet.spec.ts:21:7      › [known issue BUG-01] accepts a payload missing required fields instead of rejecting it
api/post-pet.spec.ts:38:7      › [known issue BUG-02] returns 500 instead of 400 for an invalid id type
Total: 9 tests in 3 files
```

## Validation performed

- `npx tsc --noEmit` — the suite compiles cleanly with TypeScript `strict` mode on.
- `playwright test --list` — all 9 specs are correctly discovered by the configured `testDir`/`baseURL`.
- Every assertion in this suite mirrors a request/response pair that was **manually executed against the live API** as part of Task 1 (see `../QA_Task1_Manual_API_Test_Report.docx` and the accompanying Postman collection). The exact status codes and response bodies asserted here were observed first-hand before being encoded as automated checks.

> **Note on running this suite in this delivery environment:** the sandbox used to assemble this submission restricts outbound network access to a fixed allowlist of package registries, so `npm test` could not be executed end-to-end from here against `petstore.swagger.io`. The suite is fully self-contained and will run normally with `npm test` on any machine with standard internet access, or in the included GitHub Actions workflow (`.github/workflows/api-tests.yml`), which installs dependencies, runs the suite, and uploads the HTML report as a build artifact on every push/PR.

## Expected results when run

| Test | Expected outcome |
|---|---|
| 3 × `@smoke` happy-path tests | **PASS** — match the documented/spec behavior (TC-01, TC-04, TC-07 in Task 1) |
| 6 × `[known issue BUG-0x]` tests | **PASS** — they assert the API's *current observed* behavior (not the spec), so they pass today and double as regression guards: if the underlying bug is ever fixed, the assertion will start failing, signalling that both the test and `REPORT.md`/Task 1 report need to be updated |

## Known issues encoded as tests

See the Task 1 report (`QA_Task1_Manual_API_Test_Report.docx`) for full details. Summary:

| Bug ID | Endpoint | Issue |
|---|---|---|
| BUG-01 | POST /pet | Missing required fields (`name`, `photoUrls`) not rejected |
| BUG-02 | POST /pet | Invalid `id` type returns 500 instead of 400 |
| BUG-03 | GET /pet/findByStatus | Unsupported status value returns 200 + `[]` instead of 400 |
| BUG-04 | GET /pet/findByStatus | Missing required `status` param returns 200 + `[]` instead of 400 |
| BUG-05 | DELETE /pet/{petId} | Deleting a non-existent id returns 200 instead of 404 |
| BUG-06 | DELETE /pet/{petId} | Non-numeric id returns 404 with a leaked Java stack trace instead of 400 |
