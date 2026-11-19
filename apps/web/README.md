# DevInn Web

Interface de gestão de reservas do DevInn, construída com React, TypeScript, Vite, Tailwind CSS e shadcn/ui. As
funcionalidades ficam em `src/features`, e os componentes e utilitários compartilhados em `src/shared`.

## Desenvolvimento

Siga o [guia de desenvolvimento do monorepo](../../README.md#desenvolvimento-local) para instalar as dependências,
configurar a API e criar os dados de demonstração. A partir da raiz do repositório, rode:

```sh
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @dev-inn/web dev --strictPort
```

A interface roda em `http://localhost:5173`. `VITE_API_URL` deve apontar para a origem da API, sem o prefixo `/api/v1`.

## Lint e build

```sh
pnpm --filter @dev-inn/web lint
pnpm --filter @dev-inn/web build
```

O build é gravado em `apps/web/dist`.
