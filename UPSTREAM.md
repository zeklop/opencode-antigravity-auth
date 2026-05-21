# Upstream Maintenance

This fork tracks `NoeFabris/opencode-antigravity-auth`.

## Remotes

```bash
git remote -v
```

Expected:

```text
origin   https://github.com/zeklop/opencode-antigravity-auth.git
upstream https://github.com/NoeFabris/opencode-antigravity-auth.git (fetch)
upstream DISABLED (push)
```

`upstream` push URL should stay disabled:

```bash
git remote set-url --push upstream DISABLED
```

## Update From Upstream

```bash
git fetch upstream
git checkout main
git merge --ff-only upstream/main
git checkout fork/local-delta-desktop-diagnostics-model-registry
git rebase main
```

Run the full gate after every merge or rebase:

```bash
npm ci
npm run typecheck
npm test
npm run build
node -e "import('./dist/index.js')"
```

## Fork-Specific Areas

- `script/fix-esm-imports.mjs` keeps emitted ESM importable by Node/OpenCode Desktop.
- `src/plugin/models/registry.ts` is the model source of truth.
- `src/plugin/config/models.ts` is generated from the registry at runtime.
- `src/plugin/transform/model-resolver.ts` uses registry routes for model backend ids.
- `src/plugin/request.ts` injects default Gemini 3 thinking config for wrapped and unwrapped requests.
- `src/quota-cli.ts` reports live and cached quota data from plugin OAuth storage.
