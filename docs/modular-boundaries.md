# Fronteiras modulares do DevInn

## Objetivo

Padronizar como os módulos do DevInn devem ser organizados no backend e no frontend para reduzir decisões estruturais ad hoc e manter o monólito modular coerente.

## Módulos atuais

- `Auth`
- `Bookings`
- `Financial`
- `Inns`
- `Integrations`
- `Inventory`

## Módulos previstos

- `Guests`
- `Operations`
- `DirectBooking`

## Convenção do backend

### Domain

- Pasta base: `apps\api\src\DevInn.Domain\Aggregates\<Modulo>`
- Colocar aqui agregados, entidades internas, value objects, enums e serviços de domínio do módulo.

### Application

- Pasta base: `apps\api\src\DevInn.Application\Features\<Modulo>`
- Estrutura padrão:
  - `Commands\...`
  - `Queries\...`
  - `Shared\...` quando o artefato for reutilizado dentro do próprio módulo
- Organizar comandos e queries por área do módulo quando necessário, por exemplo:
  - `Features\Inventory\Commands\Rooms\CreateRoom`
  - `Features\Inventory\Queries\RoomCategories\GetRoomCategories`

### Infrastructure

- Repositórios, configurações EF, migrations e serviços concretos continuam em `DevInn.Infrastructure`.
- Implementações devem seguir o módulo de origem sempre que a separação estiver clara.

### WebApi

- Pasta base: `apps\api\src\DevInn.WebApi\Endpoints\<Modulo>`
- Estrutura padrão:
  - quando o módulo expõe um recurso principal, os endpoints podem ficar direto em `Endpoints\<Modulo>`
  - quando o módulo expõe múltiplos recursos, agrupar por recurso, por exemplo `Endpoints\Inventory\Rooms` e `Endpoints\Inventory\RoomCategories`
- Endpoints devem refletir o recurso/rota HTTP da WebApi.
- `Commands` e `Queries` permanecem como convenção da camada de `Application`, não da `WebApi`.

## Convenção do frontend

- Pasta base: `apps\web\src\features\<modulo-em-kebab-ou-lowercase>`
- Estrutura padrão:
  - `components`
  - `hooks`
  - `pages`
  - `services`
  - `types`
  - `utils` quando necessário
- Rotas do módulo ficam no próprio módulo, por exemplo `booking-routes.tsx`, e a composição final permanece em `apps\web\src\routes.tsx`.

## Naming

- Módulos em PascalCase no backend e lowercase no frontend.
- Commands, queries, handlers, DTOs e endpoints devem usar nomes explícitos de ação:
  - `CreateBookingCommand`
  - `ListBookingsQuery`
  - `DeleteRoomEndpoint`
- Tipos compartilhados entre handlers do mesmo módulo ficam em `Shared`.
- Evitar criar `classlib` por módulo neste estágio.

## Regra prática para novos casos

1. Se a mudança pertence claramente a um domínio existente, ela entra no módulo atual.
2. Se ela introduz linguagem própria, fluxo próprio e superfícies próprias de UI/API, ela candidata um novo módulo.
3. Se houver dúvida entre dois módulos, o agregado raiz e o endpoint principal devem apontar para o mesmo módulo.
