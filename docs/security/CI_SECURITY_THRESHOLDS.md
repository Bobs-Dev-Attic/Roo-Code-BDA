# CI Security Gates & Thresholds

- **Dependency vulnerability scan**: `pnpm audit --audit-level=high`.
    - CI fails on high or critical vulnerabilities.
- **Secret scanning**: `gitleaks` GitHub Action.
    - CI fails on detected leaked credentials/secrets.

These gates are enforced by `.github/workflows/security-gates.yml`.
