# Feature Flag Rollout Plan

All user-facing behavior changes must ship behind flags first.

## Required Rollout Stages

1. **Development:** Enabled only in local/dev environments.
2. **Internal Dogfood:** Enabled for maintainers and test cohorts.
3. **Limited Rollout:** Enable for a small percentage of users.
4. **General Availability:** Enable by default after metrics and telemetry checks pass.

## Required Metadata per Flag

- Owner
- Scope (features and surfaces impacted)
- Rollback strategy
- Success metrics
- Target removal date

## Immediate Scope

- Model search dual-ranking behavior.
- Future model grading behavior.
