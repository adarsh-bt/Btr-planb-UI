
---

## Part XXXII — Partial runs: estimate the panchayats that are ready

### What it does

An operator can now run an estimation for the part of the state whose data has passed validation,
instead of waiting for the last zone. The drawer that lists the not-ready zones gained an
**Estimate Ready Panchayats Only** action; it appears whenever at least one zone is ready.

### The grain trap, and why the unit is the panchayat

Validation measures **zones**. Estimation produces **panchayats**. They do not nest — a panchayat can
draw clusters from several zones.

A panchayat's multiplier is `village area ÷ enumerated cluster area`. Village area is a property of
the whole panchayat and arrives complete regardless of validation. Estimating "the zones that
passed" would leave a straddling panchayat with a **short denominator against a whole numerator**:
the multiplier inflates and every figure for that panchayat comes out too high, with nothing on the
result to show it.

Measured on live 2025-26 Autumn wet data:

| | Panchayats | Wet clusters |
|---|---:|---:|
| Wholly inside ready zones → estimable | **293** | 3,910 |
| No clusters in any ready zone → excluded | 675 | 12,710 |
| **Straddle ready and not-ready zones** | **9** | 386 |

Nine of 977 — few, but precisely the ones that would fail silently. So a panchayat is included only
when **every** one of its clusters of the run's land types lies in a ready zone. Excluding a
panchayat loses a row; including it corrupts one.

A dry cluster in a not-ready zone does not block a wet run — it is never read. An ALL run considers
both land types, so the same cluster does block it.

### A partial run is analysis, not a statistic

Its panchayat figures are sound. Its block, district and state figures are sums over the subset that
happened to be ready. `ApprovalService` therefore **refuses to advance a partial run**, checked
before authorization so that no role and no permission can get past it — this is a property of the
run, not of the caller. `getStatus` reports `partial`, sets `canAdvance` false and explains why, so
the screen never offers an action the transition would refuse.

The dashboard shows a standing warning naming the coverage, and the run log records the shortfall at
**WARN** rather than INFO, because the run log is where an auditor discovers that a figure covers
part of the state.

### Design notes

- **Scope is read from the stored validation**, not recomputed. The run covers exactly the scope the
  operator saw when they chose to proceed; re-reading upstream could widen or narrow it in between.
- **`markPartial` is called on every initiation**, true or false. A run that was partial and is
  re-run after the remaining zones complete must stop carrying the caveat.
- **A partial run with nothing estimable fails** rather than writing an empty result set, which
  would read as "no agricultural land" instead of "nothing was ready".
- **`@PrePersist` defaults `is_partial`.** The column's SQL `DEFAULT FALSE` cannot cover it —
  Hibernate names every column in its INSERT, so an unset field is written as an explicit NULL and
  the default never applies. Defaulting on the entity means no builder, in production or in a test
  fixture, can create a run whose partiality is unknown; that is the one thing the approval guard
  must be able to rely on.

### Database — changelog-0.0.14

`earas_estimation_run.is_partial BOOLEAN NOT NULL DEFAULT FALSE`,
`earas_estimation_run.excluded_localbodies INTEGER` (written only for partial runs — a stored zero
on a full run would be indistinguishable from a partial run that excluded nothing), and
`idx_estimation_run_partial (is_partial, status)`.

### Files

`PartialRunScopeService` (new), `EstimationContextLoader`, `EstimationContext`,
`EstimationExecutionService`, `EstimationRunService`, `EstimationPersistenceService`,
`ApprovalService`, `EstimationRun`, `InitiateEstimationRequest`, `ExecutionController`,
`DashboardService`, `ApprovalDtos`, `ValidationDtos`, `ReportDtos`, `areaEstimationApi.js`,
`AreaEstimationDashboard.jsx`.

### Verification

- **177 unit tests** and **131 integration tests** pass, the latter against the real database.
- New `PartialRunScopingTest` (7 tests) pins the scoping rule: wholly-ready included, straddling
  excluded, other land type does not block, no-clusters-of-this-land-type excluded, nothing
  estimable fails, full run unrestricted, ALL run considers both land types.
- New execution tests: a full run never asks for a ready-zone set, a partial run passes the zones to
  the loader and records the shortfall, and the partial coverage is logged at WARN.
- New approval test: a partial run is refused with full permissions, and `getStatus` reports it as
  unable to advance.
- ESLint 0 errors; `vite build` succeeds.

### Not changed

Rejection and return-to-previous-stage routing remain undefined, as before. Nothing about the
calculation formulas changed — a partial run computes each included panchayat exactly as a full run
would.
