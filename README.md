# DevInn

DevInn é um sistema de gestão de reservas para pousadas e pequenos hotéis — um monorepo com frontend em React + Vite e backend em .NET/C#.

## Visão geral

- Frontend: apps/web — React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query.
- Backend: apps/api — .NET (Clean Architecture), C#, Entity Framework Core, PostgreSQL.
- Monorepo gerenciado com pnpm.

Para detalhes técnicos e documentação do projeto veja o arquivo `AGENTS.md` na raiz do repositório.

## Pré-requisitos

- Node.js >= 18
- pnpm >= 8
- .NET SDK (versão compatível com o projeto)
- PostgreSQL (para rodar a API localmente, se necessário)

Docker Compose está incluído para subir serviços (Postgres e outros). Para usar o docker-compose:

```bash
# a partir da pasta da api
docker compose up -d
# para subir e reconstruir imagens (se houver Dockerfiles)
docker compose up -d --build
# parar e remover containers
docker compose down
```

Por padrão o serviço Postgres expõe a porta 5432; verifique o arquivo `docker-compose.yml` para variáveis de ambiente e credenciais (ex.: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB). Ajuste seu `.env` da API conforme necessário (ex.: DATABASE_URL ou conexões separadas).

## Instalação

No diretório raiz do repositório:

```bash
pnpm install
```

## Rodando em desenvolvimento

- Frontend (dev server):

```bash
pnpm dev:web
```

- Backend (API em modo watch):

```bash
pnpm dev:api
```

Esses scripts iniciam os serviços de frontend e backend em modo de desenvolvimento. Consulte `package.json` na raiz e em `apps/web` / `apps/api` para scripts adicionais.

## Build para produção

- Build do frontend:

```bash
pnpm build:web
```

- Build do backend:

```bash
pnpm build:api
```

## Estrutura do repositório (resumo)

- apps/web — aplicação frontend React + Vite
- apps/api — backend .NET/C# (DevInn.WebApi e projetos correlatos)
- docs — documentação adicional

## Contribuição

1. Abra uma issue descrevendo a mudança ou bug.
2. Crie uma branch com um nome descritivo: `feature/descricao` ou `fix/descricao`.
3. Faça commits pequenos e claros.
4. Abra um Pull Request apontando a branch `main`.

Considere seguir as convenções de código do projeto descritas em `AGENTS.md`.

## CI/CD

O repositório possui workflows de CI/CD configurados em `.github/workflows` para builds, testes e deploy (Railway). As regras de release são acionadas por tags semânticas (ex.: `v1.2.3`).

## Onde encontrar mais informação

- Documentação do projeto: `AGENTS.md`
- Frontend: `apps/web/README.md`
- Backend: `apps/api/README.md` (quando existente)
