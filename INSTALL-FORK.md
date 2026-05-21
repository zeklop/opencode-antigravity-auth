# Fork Install

Use this path when you need the changes maintained in
`zeklop/opencode-antigravity-auth`.

`opencode-antigravity-auth@latest` is the upstream npm package. It does not
install this fork. The fork currently runs from a built local checkout.

## Install

Clone and build the fork:

```bash
git clone https://github.com/zeklop/opencode-antigravity-auth.git
cd opencode-antigravity-auth
npm ci
npm run typecheck
npm test
npm run build
```

Get the absolute checkout path:

```bash
pwd -P
```

Keep existing plugins and add the built entrypoint to
`~/.config/opencode/opencode.json`:

```json
{
  "plugin": [
    "file:///absolute/path/to/opencode-antigravity-auth/dist/index.js"
  ]
}
```

Login and let the plugin configure its models:

```bash
opencode auth login
```

Then verify that OpenCode can see the Google models:

```bash
opencode models google
```

## Quota Command

The quota CLI uses the same OAuth storage as the plugin:

```bash
node dist/src/quota-cli.js
```

To install the `/gquota` template for the current checkout, replace
`__FORK_ROOT__` while copying it into the OpenCode command directory:

```bash
mkdir -p ~/.config/opencode/command
sed "s|__FORK_ROOT__|$(pwd -P)|g" templates/opencode-command/gquota.md > ~/.config/opencode/command/gquota.md
```

The tested OpenCode `1.14.50` setup loads `~/.config/opencode/command/`.
Current OpenCode docs use `~/.config/opencode/commands/`; if your OpenCode
version uses that path, put the generated `gquota.md` there instead.

Confirm that OpenCode loaded the command:

```bash
opencode debug config | jq '.command | keys'
```

## Update

Update the checkout and rebuild before restarting OpenCode:

```bash
git pull --ff-only origin main
npm ci
npm run typecheck
npm test
npm run build
```

The `/gquota` command keeps working as long as the checkout path stays the
same.

## Why Not Git Spec Yet

OpenCode can load npm plugins and local plugin files. A raw Git install of this
repository is not a fork install path yet: `package.json` points at
`./dist/index.js`, while `dist/` is build output and is not committed to Git.

The clean non-`file://` path is to publish the fork under its own npm package
name, or to add an explicitly tested Git install build path.
