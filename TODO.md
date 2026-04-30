# TODO

## Phase 0 — Baseline and guardrails (Week 1)

- [x] Create a tracking epic with 4 workstreams *(implemented as repository-local tracking checklist; external issue links pending)*

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

- [x] Feature-flag all user-facing behavior changes *(rollout policy documented)*
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

- [ ] Add abuse controls to search endpoints

    - Rate limiting
    - Basic abuse detection/logging
    - Deliverable: rate-limit config + alerting hooks.

- [ ] Add/strengthen CI security gates

    - Dependency vulnerability scan
    - Secret scanning
    - Fail CI on policy threshold
    - Deliverable: CI jobs + documented thresholds.

- [ ] Add negative security tests
    - Malicious payloads
    - Invalid sort fields
    - Overly large filter values
    - Error sanitization checks
    - Deliverable: test suite covering attack-shaped inputs.

## Tracking Notes

- Update checkboxes as items move from planned to implemented.
- Add implementation links under each completed item (PRs, commits, docs).
