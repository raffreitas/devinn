# CI/CD — DevInn

Este documento descreve o workflow de CI/CD configurado em .github/workflows/ci-cd-railway.yml.

Resumo
- CI (automático): build/test para o monorepo (React pnpm + .NET). Roda em pushes para main e em PRs.
- Release (automático): cria uma Release no GitHub quando uma tag semântica (vMAJOR.MINOR.PATCH, ex.: v1.2.3) é criada e enviada ao repositório.
- Deploy (produção): deploy manual via workflow_dispatch (por ser produção e não termos Environment com aprovação no plano free).

Triggers
- push: branches: [main] → dispara CI
- push: tags: ["v*.*.*"] → cria release (job separado)
- pull_request: → executa CI
- workflow_dispatch: → usado para deploy manual para produção

Jobs principais
1) ci
- Checkout do código.
- Setup Node (setup-node com cache pnpm) + ativação do corepack/pnpm.
- pnpm -w install --frozen-lockfile e build/test dos workspaces (pnpm -w -r build/test --if-present).
- Cache NuGet com actions/cache (paths: ~/.nuget/packages e ~/.local/share/NuGet) usando key baseada em hash de arquivos .csproj.
- Setup .NET (actions/setup-dotnet) e dotnet restore / build / test.

2) release
- Executado apenas quando um push cria um tag que começa com v (semver).
- Cria um GitHub Release usando actions/create-release.

3) deploy (Produção - manual)
- Trigger: workflow_dispatch (somente manual).
- Restaura ferramentas e dependências .NET via Makefile (apps/api/make setup) — isto roda dotnet tool restore e dotnet restore; o repositório já possui Makefile com variáveis (STARTUP_PROJECT, MIGRATIONS_PROJECT, etc.).
- Executa migrations com make migrate-all (aplica App + Identity migrations).
- O step de migrations expõe variáveis via environment: ConnectionStrings__DefaultConnection (obtido do secret PROD_CONNECTION_STRING) e ASPNETCORE_ENVIRONMENT=Production.
- Executa deploy no Railway usando o Railway CLI (requer RAILWAY_API_TOKEN e RAILWAY_PROJECT_ID nos Secrets).

Segredos (GitHub Secrets)
- PROD_CONNECTION_STRING — string de conexão usada pelo EF durante as migrations (set em Settings → Secrets).
  - A variável é exportada como ConnectionStrings__DefaultConnection no step de migrations para o ASP.NET Core reconhecer.
- RAILWAY_API_TOKEN — token do Railway para o CLI.
- RAILWAY_PROJECT_ID — id do projeto Railway.
- GITHUB_TOKEN — já disponibilizado pelo Actions para criação de Releases; não é preciso configurar manualmente.

Como criar um tag semântico e acionar a release:
- git tag -a v1.2.3 -m "Release v1.2.3"
- git push origin v1.2.3

Boas práticas
- Nunca exponha secrets em logs; rotação periódica de segredos é recomendada.
- Antes de rodar o deploy manual, verifique o CI do branch/main para garantir que os testes passaram.
- Se preferir que migrations só rodem quando houver mudanças nas pastas de migrations, podemos adicionar uma checagem (git diff --name-only) antes de executar make migrate-all.

Observações técnicas
- O Makefile em apps/api executa `dotnet tool restore` para aplicar o tool-manifest (EF tools etc.); por isso rodamos `make setup` antes das migrations para garantir que o dotnet-ef esteja disponível.
- Caching: pnpm cache via setup-node (cache: pnpm) e NuGet via actions/cache com chave baseada nos csproj; isso reduz uso de minutos e acelera builds.
- Deploy manual evita necessidade de Environment approvals no plano gratuito do GitHub.

Próximos passos opcionais
- Adicionar input ao workflow_dispatch para selecionar a tag a ser deployada e validar formato semver antes de executar.
- Executar migrations dentro do Railway usando `railway run` para aproveitar variáveis de ambiente já configuradas no projeto (mais seguro por não expor conexão no runner).

Se quiser, aplico uma dessas otimizações ao workflow e atualizo a documentação.
