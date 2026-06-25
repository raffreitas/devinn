# Railway configuration

This project defines its Railway infrastructure in code.

```txt
.railway/railway.ts
```

Use this file to describe the Railway project you want: services, databases, buckets, custom domains, replicas, groups, and environment variables.

The current target is the `devinn` project in the `production` environment. GitHub remains the source of code and deployment triggers.

## Common commands

Create the configuration files:

```bash
railway config init
```

Import an existing Railway project into code:

```bash
railway config pull
```

Inspect the imported state without overwriting the local file:

```bash
railway config pull --json
```

Import without rendering unknown preserved variables:

```bash
railway config pull --omit-preserved-variables
```

Preview what Railway would change:

```bash
railway config plan
```

Run the CI-compatible drift check:

```bash
pnpm railway:plan:ci
```

CI installs `@railway/cli@5.23.1` explicitly before running the plan. Local usage expects the Railway CLI to be installed and authenticated on the machine.

Apply the planned changes:

```bash
railway config apply
```

Do not run `railway config apply` until the latest plan has been reviewed. Do not use `--yes` or `--confirm-destructive` in CI.

## Drift reconciliation

If an emergency change is made in the Railway dashboard:

1. Run `railway config pull --json` and inspect the live state.
2. Update `.railway/railway.ts` to represent the intended live state.
3. Run `railway config plan`.
4. Commit the IaC update only after the plan is clean or shows only reviewed intentional changes.

If a plan proposes deleting services, variables, volumes, buckets, or domains, stop and review the change manually before applying anything.

## CI drift check

`.github/workflows/iac-drift.yaml` runs `pnpm railway:plan:ci`, which uses `railway config plan --detailed-exit-code`. Exit code `0` means no drift. Exit code `2` means Railway has pending changes relative to `.railway/railway.ts`.

The workflow requires `RAILWAY_TOKEN` in GitHub Actions secrets. It only plans; it never applies changes and never prints decrypted variable values.

## Notes

- `railway config plan` is safe and does not change Railway.
- `railway config apply` previews changes and asks before applying unless you pass `--yes`.
- Destructive changes in non-interactive or agent sessions require `railway config apply --confirm-destructive` after reviewing the plan.
- Services already managed by `railway.json` / `railway.toml` must be migrated before `.railway/railway.ts` can manage them.
- Use `replicas` for scaling; advanced placement can still specify region names.
- Use `group("Name", [resources])` to keep large projects organized on the Railway canvas.
- Secrets imported from Railway are rendered as `preserve()` so existing values are retained without writing secret values to source. Use `railway config pull --omit-preserved-variables` for a smaller import.
