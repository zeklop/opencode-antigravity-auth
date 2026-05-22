# Workspace Relocation Design

## Goal

Move the full Antigravity auth working bundle from the temporary Codex session
directory into `/Users/zeandre/dev/tech/opencode/antigravity-auth` without
breaking the main fork repository, its local project brain, or the vault
pointer.

## Scope

Move the current workspace entries that belong to this effort:

- `.firecrawl/`
- `artifacts/`
- `forks/`
- `opencode-antigravity-auth/`
- `opencode-antigravity-desktop-patch.md`
- `plans/`
- `upstream-clean/`

Keep their relative layout intact. The primary git repository remains nested at
`/Users/zeandre/dev/tech/opencode/antigravity-auth/opencode-antigravity-auth`.

## References

Update the head-vault pointer at
`~/brain/10-projects/opencode-antigravity-auth/index.md` to the new repository
path and new `.business/INDEX.md` path. Search the moved bundle for absolute
references to the old Codex session directory and update only project-owned
notes where the old location is a path pointer rather than historical context.

## Verification

- The target directory contains the moved workspace entries.
- The old workspace no longer contains those entries.
- The primary repository remains on `main`, synced with `origin/main`, with its
  `.git` directory and ignored `.business/` files intact.
- Vault status is committed through `brain-autosync`.
