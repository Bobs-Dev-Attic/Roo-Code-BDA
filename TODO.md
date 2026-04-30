# TODO

## Phase 0 — Baseline and guardrails (Week 1)

- [x] Create a tracking epic with 4 workstreams _(implemented as repository-local tracking checklist; external issue links pending)_

    - Compatibility
    - Security
    - Onboarding
    - Roadmap/architecture
    - Deliverable: GitHub epic + linked issues with owners and due dates.

- [x] Define success metrics before implementation

    - Security: mean time to patch critical vuln
    - Compatibility: break/fix time after upstream runtime/editor changes
    - Onboarding: first-run completion rate
    - Model search: first model works rate
    - Deliverable: `docs/metrics.md` (or equivalent) with metric definitions.

- [x] Feature-flag all user-facing behavior changes _(rollout policy documented)_
    - Especially model search dual-ranking/grading changes.
    - Deliverable: feature flags + rollout plan.

## Phase 1 — Security hardening first (Weeks 1–2)

- [x] Publish a Security Release Template

    - Standard release-note section: Security Hardening
    - Severity classification (critical/high/medium/low)
    - Backport policy (critical fixes backported to N-1)
    - Deliverable: `SECURITY_RELEASE_TEMPLATE.md`.

- [x] Define vuln triage SLA

    - Critical: triage < 24h, patch < 72h
    - High: triage < 3d, patch < 7d
    - Deliverable: `SECURITY_SLA.md`.

- [x] Harden model-search input surface

    - Strict schema validation
    - Numeric bounds for VRAM/RAM/context filters
    - Sort-field and sort-direction allowlists
    - Deliverable: validation middleware + tests.

- [x] Add abuse controls to search endpoints _(implemented for marketplace filtering requests; broader endpoint coverage can extend this guard pattern)_

    - Rate limiting
    - Basic abuse detection/logging
    - Deliverable: rate-limit config + alerting hooks.

- [x] Add/strengthen CI security gates

    - Dependency vulnerability scan
    - Secret scanning
    - Fail CI on policy threshold
    - Deliverable: CI jobs + documented thresholds.

- [x] Add negative security tests
    - Malicious payloads
    - Invalid sort fields
    - Overly large filter values
    - Error sanitization checks
    - Deliverable: test suite covering attack-shaped inputs.

## Tracking Notes

- Update checkboxes as items move from planned to implemented.
- Add implementation links under each completed item (PRs, commits, docs).

### Implementation links

- Abuse controls: `src/core/security/requestGuards.ts`, `src/core/webview/webviewMessageHandler.ts`
- CI security gates: `.github/workflows/security-gates.yml`, `docs/security/CI_SECURITY_THRESHOLDS.md`
- Negative security tests: `src/core/security/__tests__/requestGuards.spec.ts`
