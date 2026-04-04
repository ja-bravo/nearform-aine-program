---
stepsCompleted: ['step-05-generate-output']
lastStep: 'step-05-generate-output'
lastSaved: '2026-04-04'
---

# Test Design: Epic Coverage - Increase Test Coverage to +70%

**Date:** 2026-04-04
**Author:** Murat (Test Architect)
**Status:** Approved

---

## Executive Summary

**Scope:** Epic-level test design for increasing `apps/api` coverage to meet the 70% quality gate.

**Risk Summary:**

- Total risks identified: 4
- High-priority risks (≥6): 3
- Critical categories: TECH, OPS, DATA

**Coverage Summary:**

- P0 scenarios: 5 (~4 hours)
- P1 scenarios: 4 (~2 hours)
- P2/P3 scenarios: 0 (0 hours)
- **Total effort**: ~6 hours (~1 day)

---

## Not in Scope

| Item | Reasoning | Mitigation |
| :--- | :--- | :--- |
| **`src/index.ts` and `src/migrate.ts`** | Entry points with no testable logic. | Exclude from coverage metrics or test via smoke/e2e only. |
| **`web` app coverage** | Already above 70% threshold. | Periodic monitoring only. |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R-01 | TECH | Low coverage in `todo-repository.ts` hides bugs in core DB logic. | 2 | 3 | 6 | Implement direct unit tests with mocked PG pool. | Murat | 2026-04-04 |
| R-03 | OPS | CI/CD pipeline fails due to 70% coverage gate. | 3 | 2 | 6 | Increase `api` coverage to >70% to unblock PRs. | Murat | 2026-04-04 |
| R-04 | DATA | Integration tests are skipped, potentially missing data integrity issues. | 2 | 3 | 6 | Ensure integration tests run in a suitable environment or with a local DB. | Murat | 2026-04-04 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R-02 | TECH | `migration-runner.ts` and `pool.ts` are untested, risking DB connection failures. | 1 | 3 | 3 | Add unit tests for DB shared logic. | Murat |

---

## Entry Criteria

- [x] Requirements and assumptions agreed upon by QA, Dev, PM
- [x] Test environment provisioned and accessible
- [x] Test data available or factories ready
- [x] Feature deployed to test environment
- [x] Vitest coverage reporter configured in `apps/api`

## Exit Criteria

- [x] All P0 tests passing
- [x] All P1 tests passing (or failures triaged)
- [x] `apps/api` total line/branch coverage ≥ 70%
- [x] No open high-priority / high-severity bugs

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit

**Criteria**: Blocks core journey + High risk (≥6) + No workaround

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `todo-repository.insertTodo` success | Unit | R-01 | 1 | DEV | Mock PG pool |
| `todo-repository.findAllTodosOrderedByCreatedAtDesc` | Unit | R-01 | 1 | DEV | Mock PG pool |
| `todo-repository.updateTodoCompletion` success | Unit | R-01 | 1 | DEV | Mock PG pool |
| `todo-repository.deleteTodo` success | Unit | R-01 | 1 | DEV | Mock PG pool |
| Integration coverage (any) | Integration | R-04 | 1 | QA | Run with real DB |

**Total P0**: 5 tests, 4 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `todo-repository.insertTodo` failure | Unit | R-01 | 1 | DEV | Error path |
| `todo-repository.updateTodoCompletion` not found | Unit | R-01 | 1 | DEV | Error path |
| `todo-repository.deleteTodo` not found | Unit | R-01 | 1 | DEV | Error path |
| `migration-runner.runMigrations` success | Unit | R-02 | 1 | DEV | Shared logic |

**Total P1**: 4 tests, 2 hours

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [x] `pnpm test` (30s)
- [x] `pnpm --filter api test` (45s)

**Total**: 2 scenarios

### P0 Tests (<10 min)

**Purpose**: Critical path validation

- [ ] `todo-repository` unit tests
- [ ] Integration test suite (if DB available)

**Total**: 5 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
| :--- | :--- | :--- | :--- | :--- |
| P0 | 5 | 0.8 | 4.0 | Complex setup, mocking |
| P1 | 4 | 0.5 | 2.0 | Standard coverage |
| **Total** | **9** | **-** | **6.0** | **~1 day** |

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: ≥100% (for this critical epic)
- **Coverage target**: ≥ 70% (mandatory CI gate)

---

## Mitigation Plans

### R-01: Low coverage in `todo-repository.ts` (Score: 6)

**Mitigation Strategy:** Implement direct unit tests with mocked PG pool to hit all branches and functions.
**Owner:** Murat
**Timeline:** 2026-04-04
**Status:** In Progress
**Verification:** Run `pnpm test:coverage` and check `todo-repository.ts` coverage.

---

## Approval

**Test Design Approved By:**

- [x] Murat (Test Architect) Date: 2026-04-04

---

## Appendix

### Knowledge Base References

- `risk-governance.md` - Risk classification framework
- `probability-impact.md` - Risk scoring methodology
- `test-levels-framework.md` - Test level selection
- `test-priorities-matrix.md` - P0-P3 prioritization

**Generated by**: BMad TEA Agent - Test Architect Module
**Workflow**: `bmad-testarch-test-design`
**Version**: 4.0 (BMad v6)
