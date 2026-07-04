# Repository Guidelines

## Project Structure & Module Organization

DevInn is a pnpm monorepo for a booking management system.

- `apps/web`: React, TypeScript, Vite frontend. Source lives in `apps/web/src`, with feature code in `src/features`, shared UI/utilities in `src/shared`, and static assets in `apps/web/public`.
- `apps/api`: .NET backend using Clean Architecture. Main projects are under `apps/api/src`: `DevInn.Domain`, `DevInn.Application`, `DevInn.Infrastructure`, `DevInn.WebApi`, and `DevInn.DatabaseMigrator`.
- `apps/api/tests`: .NET test projects, including `DevInn.UnitTests`, `DevInn.IntegrationTests`, and `LoadTests`.
- `apps/backup`: backup worker app with its own source and tests.
- `.railway`: Railway infrastructure-as-code configuration.
- `docs` and `pocs`: supporting documentation and experiments.

## Build, Test, and Development Commands

Run commands from the repository root unless noted.

- `pnpm install`: install workspace dependencies and Husky hooks.
- `pnpm --filter @dev-inn/web dev`: start the Vite frontend.
- `pnpm --filter @dev-inn/web build`: type-check and build the frontend.
- `pnpm --filter @dev-inn/web lint`: run Biome checks and formatting for the web app.
- `dotnet build apps/api/DevInn.slnx`: build the API solution.
- `dotnet test apps/api/DevInn.slnx`: run API tests.
- `dotnet test apps/backup/DevInn.Backup.slnx`: run backup app tests.
- `pnpm railway:plan`: preview Railway configuration changes.

## Coding Style & Naming Conventions

Use spaces with 2-space indentation, CRLF line endings, UTF-8, trimmed trailing whitespace, and final newlines as defined in `.editorconfig`. Frontend code is formatted and linted with Biome; JavaScript/TypeScript uses double quotes and organized imports.

For React, keep feature-specific components, hooks, schemas, and API clients colocated under `src/features`. Use PascalCase for components and C# types, camelCase for local variables and functions, and descriptive test names ending in `Tests`.

## Testing Guidelines

Backend tests use .NET test projects under `apps/api/tests` and `apps/backup/tests`. Write focused unit tests in the appropriate project under `apps/api/tests` or `apps/backup/tests`, scoped tightly to the class or method being changed. Add integration tests in those same test projects when endpoint, persistence, or cross-layer behavior is affected. Name test files after the target type or use case, for example `CreateRoomHandlerTests.cs`.

Frontend tests live under `apps/web/src` alongside feature code. Use Vitest for unit tests and React Testing Library for component tests. Run them with `pnpm --filter @dev-inn/web test`.

## Commit & Pull Request Guidelines

Git history follows Conventional Commit prefixes such as `feat:`, `fix:`, and `chore:`. Keep commits focused and describe the user-visible or maintenance outcome.

Pull requests should include a short summary, linked issue when applicable, validation commands run, and screenshots for visible UI changes. Do not commit secrets, local `.env` files, generated build output, or unrelated formatter churn.

## Security & Configuration Tips

Use `.env.example` as the template for local frontend configuration. Keep production secrets in the deployment platform, not in Git. When changing Railway config, run `pnpm railway:plan` before opening the PR.
