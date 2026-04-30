# Senior Engineering Review (Memory, Security, Reliability, Performance)

## Scope

This review focused on core persistence, shell/terminal integration, and networking behavior.

## Key Findings

### 1) **Potential secret exposure in logs from terminal bootstrap** (High, Security)

`ShellIntegrationManager.zshInitTmpDir()` logs the entire generated `.zshrc` content, including the resolved shell integration path and environment wiring. In many environments, startup files can include sensitive values (tokens exported via shell init chain). Logging bootstrap content increases accidental credential disclosure risk in diagnostics/log uploads.

- Evidence: verbose content log in `zshInitTmpDir`.
- Recommendation:
    - Remove content-level logging entirely, or gate behind an explicit ultra-verbose debug flag.
    - Keep only structural logs (`created tmp dir`, `wrote .zshrc`).
    - Consider centralized redaction for any future env/script logging.

### 2) **Temporary directory creation is async but returned immediately** (Medium, Reliability + Race)

`zshInitTmpDir()` starts async `createDirectory`/`writeFile` operations but returns `tmpDir` immediately. Any downstream consumer that assumes `.zshrc` is already present can race and intermittently fail.

- Evidence: function returns at end while write is in promise chain.
- Recommendation:
    - Make `zshInitTmpDir` async and await both directory and file creation.
    - Surface errors to caller instead of logging-only fire-and-forget behavior.

### 3) **Insecure randomness for filesystem temp names** (Medium, Security hardening)

Both JSON temp files and ZDOTDIR temp directory names use `Math.random()` for suffixes. While collisions are unlikely, this is predictable compared to cryptographically strong IDs.

- Evidence: temp names based on `Math.random().toString(36)`.
- Recommendation:
    - Use `crypto.randomUUID()` (Node 16+) or `randomBytes` for suffixes.
    - Prefer `fs.mkdtemp` for temp directories where available.

### 4) **Custom storage path is accepted without canonicalization/boundary policy** (Medium, Security + Ops)

`getStorageBasePath()` accepts any absolute user path, creates it recursively, and uses it for tasks/settings/cache. This is flexible, but without realpath normalization/policy checks, symlink redirection or problematic mount points can cause data placement surprises.

- Evidence: absolute-path check exists in prompt validation, but no realpath/containment/denylist policy before usage.
- Recommendation:
    - Canonicalize with `fs.realpath` before use and display resolved path to user.
    - Add warnings for network mounts, root/system directories, or world-writable directories.
    - Optionally require a confirmation step when path is outside user home/workspace.

### 5) **Global TLS verification override can impact unrelated requests in debug sessions** (Medium, Security)

When debug proxy is enabled with insecure TLS, code sets `NODE_TLS_REJECT_UNAUTHORIZED=0` process-wide. This is intentionally scoped to development mode, but still affects all TLS connections in the extension host process.

- Evidence: `process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"`.
- Recommendation:
    - Prefer per-agent/per-dispatcher TLS settings instead of process-global override.
    - If process-global remains necessary, add stronger UX warnings and timeout-based auto-revert.

### 6) **Large static shell allowlist can create maintenance drag and false negatives** (Low/Medium, Maintainability + UX)

`SHELL_ALLOWLIST` hardcodes many absolute paths. This can reject valid shells in custom installations and requires continual updates.

- Evidence: extensive fixed-path set.
- Recommendation:
    - Keep allowlist, but augment with executable signature checks:
        - resolve realpath,
        - verify basename against approved binaries,
        - optionally perform `--version` probing.
    - Normalize path casing on Windows to avoid casing mismatches.

## Optimization Opportunities

1. **File-write path simplification**

    - `safeWriteJson` is robust, but complexity is high (multiple cleanup branches and backup lifecycle). Consider simplifying by writing temp file + atomic rename and using backups only behind a feature flag.

2. **Rate-limit repetitive error logs**

    - Some operational errors (storage path unusable, cleanup failure) can repeat. Add throttled logging to reduce log noise and memory overhead in output channels.

3. **Telemetry for failure classes**
    - Add categorized telemetry for `lock acquisition`, `rollback failed`, `proxy bootstrap failed`, `temp cleanup failed` to quantify real-world incidence before refactors.

## Better Options / Services

- **Secrets hygiene**: adopt structured logger with builtin redaction (e.g., pino redaction rules) for all sensitive domains.
- **Safer temp handling**: use Node `fs.mkdtemp` and `crypto.randomUUID` instead of manual random suffixes.
- **Proxy management**: prefer undici dispatcher-scoped proxy/TLS controls to avoid global env mutation.
- **Policy-driven paths**: create a storage path policy module (canonicalization + risk scoring + prompts) to centralize path safety behavior.

## Priority Plan (Suggested)

1. Remove sensitive/verbose terminal init logging and make temp init async/await.
2. Replace `Math.random` temp suffixes with crypto-strong IDs.
3. Add storage path canonicalization + warnings for unsafe locations.
4. Reduce process-global TLS override scope and add explicit user-facing warning when enabled.
5. Refine shell validation strategy to lower maintenance burden.
