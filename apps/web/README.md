# DevInn Web

Interface de gestão de reservas em React, TypeScript e Vite. Os módulos ficam em [`src/features`](src/features), os componentes e utilitários reutilizáveis em [`src/shared`](src/shared) e as rotas em [`src/routes.tsx`](src/routes.tsx).

## Desenvolvimento

Siga o [guia de desenvolvimento local](../../docs/desenvolvimento-local.md) para preparar o banco, iniciar a API e configurar o frontend.

A interface roda em `http://localhost:5173`. A variável `VITE_API_URL`, definida em `.env.local` a partir de [`.env.example`](.env.example), aponta para a origem da API, como `http://localhost:5109`. O cliente acrescenta o prefixo `/api/v1`.

## Lint e build

Execute na raiz do repositório.

```sh
pnpm --filter @dev-inn/web lint
pnpm --filter @dev-inn/web build
```

O build é gravado em `apps/web/dist`.
