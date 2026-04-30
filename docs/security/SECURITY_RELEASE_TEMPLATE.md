# Security Release Template

Use this template for any release that includes security-related work.

## Security Hardening

- **Severity:** Critical | High | Medium | Low
- **Category:** Input validation | Auth | Dependency | Access control | Other
- **Impact:** Brief user-facing impact statement.
- **Fix Summary:** Concise description of what changed.
- **Backport Status:** N/A | Backported to N-1 | Pending backport
- **Verification:** Tests or checks used to validate the fix.

## Backport Policy

- Critical vulnerabilities must be backported to N-1 immediately.
- High severity vulnerabilities should be backported to N-1 when risk justifies it.
- Medium and Low severity vulnerabilities are assessed case-by-case.
