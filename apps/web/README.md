# DevInn Web

Este projeto é o frontend do sistema DevInn, uma plataforma moderna de gestão de reservas para pousadas e hotéis.

## Visão Geral

O DevInn Web é uma aplicação React 19 com TypeScript, construída com Vite, Tailwind CSS e shadcn/ui. Ela oferece uma interface rica para visualização de reservas (Gantt), dashboard financeiro e gestão de inventário.

## Tecnologias Utilizadas

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS v4** (com oklch colors)
- **shadcn/ui** (Radix UI)
- **TanStack Query v5**
- **React Router v7**
- **React Hook Form + Zod**
- **date-fns**
- **Biome** (lint/format)

## Estrutura do Projeto

O frontend segue a estrutura de feature folders, com código organizado por funcionalidades. Utiliza aliases (@/) para imports absolutos.

## Como rodar o projeto

### Pré-requisitos
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Instalação

No diretório raiz do monorepo:

```bash
pnpm install
```

### Ambiente de desenvolvimento

Para rodar o frontend em modo desenvolvimento:

```bash
pnpm dev:web
```

Acesse: http://localhost:5173

### Build de produção

```bash
pnpm build:web
```

Os arquivos finais estarão em `apps/web/dist`.

## Convenções
- Código organizado por feature
- Uso de TypeScript para segurança de tipos
- Tailwind para estilização
- Biome para lint/format

## Sobre o Monorepo

O DevInn é um monorepo gerenciado por pnpm, contendo também a API backend em .NET. Consulte o README na raiz para mais detalhes sobre a arquitetura geral.

---

Para dúvidas ou contribuições, abra uma issue ou pull request.
