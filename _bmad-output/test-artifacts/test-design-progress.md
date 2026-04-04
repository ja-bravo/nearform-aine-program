---
stepsCompleted: ['step-01-detect-mode', 'step-03-risk-and-testability', 'step-04-coverage-plan']
lastStep: 'step-04-coverage-plan'
lastSaved: '2026-04-04'
---

# Test Design Progress

## Step 1: Detect Mode & Prerequisites

**Mode Detected:** Epic-Level Mode
**Reason:** `_bmad-output/implementation-artifacts/sprint-status.yaml` exists, and we are targeting a specific quality requirement (70% coverage) within the current sprint/context.

**Prerequisite Check:**
- Epic/Story Requirements: Found in `_bmad-output/planning-artifacts/epics.md` and coverage-related implementation artifacts.
- Architecture Context: Available in `apps/api/src/features/todos/todo-repository.ts` and related files.
- Current Coverage Status: Analyzed (API at 62.91%, Web at 79.98%).

## Step 3: Risk Assessment (Epic-Level)

### Risk Matrix

| ID | Category | Risk Description | Prob (1-3) | Imp (1-3) | Score (P×I) | Mitigation | Owner | Timeline |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R-01 | TECH | Low coverage in `todo-repository.ts` hides bugs in core DB logic. | 2 | 3 | 6 | Implement direct unit tests with mocked PG pool. | Murat | Immediate |
| R-02 | TECH | `migration-runner.ts` and `pool.ts` are untested, risking DB connection failures in prod. | 1 | 3 | 3 | Add unit tests for DB shared logic. | Murat | Next Sprint |
| R-03 | OPS | CI/CD pipeline fails due to 70% coverage gate. | 3 | 2 | 6 | Increase `api` coverage to >70% to unblock PRs. | Murat | Immediate |
| R-04 | DATA | Integration tests are skipped, potentially missing data integrity issues. | 2 | 3 | 6 | Ensure integration tests run in a suitable environment or with a local DB. | Murat | Immediate |

**Highest Risks:** R-01, R-03, R-04 (Score 6).

## Step 4: Coverage Plan & Execution Strategy

### Coverage Matrix

| Scenario | Test Level | Priority | Justification |
| :--- | :--- | :--- | :--- |
| `todo-repository.insertTodo` success | Unit | P0 | Core data insertion logic. |
| `todo-repository.insertTodo` failure (no row) | Unit | P1 | Error handling for failed insert. |
| `todo-repository.findAllTodosOrderedByCreatedAtDesc` | Unit | P0 | Core data retrieval logic. |
| `todo-repository.updateTodoCompletion` success | Unit | P0 | Core data update logic. |
| `todo-repository.updateTodoCompletion` not found | Unit | P1 | Edge case for missing ID. |
| `todo-repository.deleteTodo` success | Unit | P0 | Core data deletion logic. |
| `todo-repository.deleteTodo` not found | Unit | P1 | Edge case for missing ID. |
| `pool.getPool` connection handling | Unit | P1 | Shared infrastructure stability. |
| `migration-runner.runMigrations` success | Unit | P1 | Infrastructure setup stability. |

### Execution Strategy

- **PR:** All unit tests for `todo-repository` and shared DB logic. Must pass before merging.
- **Nightly:** Integration tests (with real PG) to verify the mocks were accurate.

### Resource Estimates

- P0: ~2–4 hours (implementation of tests)
- P1: ~1–2 hours
- Total: ~3–6 hours

### Quality Gates

- P0 pass rate = 100%
- Coverage target ≥ 70% for `apps/api` (current gate). Target 80% to have a safety margin.

**Next Step:** Load `./step-05-generate-output.md`
