# Workspace Relocation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Antigravity auth workspace bundle into the permanent `~/dev/tech/opencode/antigravity-auth` directory and update path pointers.

**Architecture:** Move the workspace entries as directories/files without flattening the bundle so each git checkout keeps its own metadata. Update only pointer documents that must follow the new location: the head-vault index and any project-owned notes that contain old absolute paths.

**Tech Stack:** macOS filesystem, git, Markdown vault notes

---

## File Structure

- Source workspace: `/Users/zeandre/Documents/Codex/2026-05-20/files-mentioned-by-the-user-opencode`
- Target workspace: `/Users/zeandre/dev/tech/opencode/antigravity-auth`
- Vault pointer: `/Users/zeandre/brain/10-projects/opencode-antigravity-auth/index.md`

### Task 1: Move workspace entries

**Files:**
- Move: `.firecrawl/`, `artifacts/`, `forks/`, `opencode-antigravity-auth/`, `opencode-antigravity-desktop-patch.md`, `plans/`, `upstream-clean/`

- [ ] **Step 1: Verify source and target**

Run:

```bash
find /Users/zeandre/Documents/Codex/2026-05-20/files-mentioned-by-the-user-opencode -maxdepth 1 -mindepth 1 -print
find /Users/zeandre/dev/tech/opencode/antigravity-auth -maxdepth 1 -mindepth 1 -print
```

Expected: source lists the workspace entries and target is empty.

- [ ] **Step 2: Move the entries without flattening**

Run:

```bash
mv \
  /Users/zeandre/Documents/Codex/2026-05-20/files-mentioned-by-the-user-opencode/.firecrawl \
  /Users/zeandre/Documents/Codex/2026-05-20/files-mentioned-by-the-user-opencode/artifacts \
  /Users/zeandre/Documents/Codex/2026-05-20/files-mentioned-by-the-user-opencode/forks \
  /Users/zeandre/Documents/Codex/2026-05-20/files-mentioned-by-the-user-opencode/opencode-antigravity-auth \
  /Users/zeandre/Documents/Codex/2026-05-20/files-mentioned-by-the-user-opencode/opencode-antigravity-desktop-patch.md \
  /Users/zeandre/Documents/Codex/2026-05-20/files-mentioned-by-the-user-opencode/plans \
  /Users/zeandre/Documents/Codex/2026-05-20/files-mentioned-by-the-user-opencode/upstream-clean \
  /Users/zeandre/dev/tech/opencode/antigravity-auth/
```

Expected: all named entries exist below the target directory.

### Task 2: Update path pointers

**Files:**
- Modify: `/Users/zeandre/brain/10-projects/opencode-antigravity-auth/index.md`
- Inspect: `/Users/zeandre/dev/tech/opencode/antigravity-auth`

- [ ] **Step 1: Search for old absolute paths**

Run:

```bash
rg -n "/Users/zeandre/Documents/Codex/2026-05-20/files-mentioned-by-the-user-opencode" \
  /Users/zeandre/dev/tech/opencode/antigravity-auth \
  /Users/zeandre/brain/10-projects/opencode-antigravity-auth
```

Expected: path-pointer hits are identified before editing.

- [ ] **Step 2: Update the vault pointer**

Replace the repository and `.business/INDEX.md` paths in the vault index with
the new target paths. Keep the vault file as an index, not the project decision
store.

- [ ] **Step 3: Commit vault pointer**

Run:

```bash
brain-autosync
```

Expected: vault changes are committed and pushed.

### Task 3: Verify relocation

**Files:**
- Verify: `/Users/zeandre/dev/tech/opencode/antigravity-auth/opencode-antigravity-auth`

- [ ] **Step 1: Verify filesystem and git state**

Run:

```bash
find /Users/zeandre/dev/tech/opencode/antigravity-auth -maxdepth 1 -mindepth 1 -print
git -C /Users/zeandre/dev/tech/opencode/antigravity-auth/opencode-antigravity-auth status --short --branch
find /Users/zeandre/dev/tech/opencode/antigravity-auth/opencode-antigravity-auth/.business -maxdepth 3 -type f
```

Expected: moved entries are present, the primary repository is still synced on
`main`, and local project-brain files remain present.

- [ ] **Step 2: Verify old workspace residue**

Run:

```bash
find /Users/zeandre/Documents/Codex/2026-05-20/files-mentioned-by-the-user-opencode -maxdepth 1 -mindepth 1 -print
```

Expected: the moved entries are absent.
