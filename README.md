# DevInn

DevInn é um sistema de gestão de reservas para pousadas e pequenos hotéis. Ele reúne controle de disponibilidade, gestão
de quartos e categorias, acompanhamento financeiro e sincronização de calendários iCal.

| Componente                   | Responsabilidade                                                 |
|------------------------------|------------------------------------------------------------------|
| [`apps/web`](apps/web)       | Interface em React, TypeScript e Vite                            |
| [`apps/api`](apps/api)       | API ASP.NET Core, persistência em PostgreSQL e migrações         |
| [`apps/backup`](apps/backup) | Worker de backup PostgreSQL para armazenamento compatível com S3 |

## Desenvolvimento local

Você precisa de Node.js 24 ou superior, pnpm 10 ou superior, SDK do .NET 10 e Docker com Compose. Execute os comandos a
partir da raiz do repositório.

### 1. Instale as dependências e prepare o banco

```sh
pnpm install --frozen-lockfile
docker compose up -d --wait postgres
dotnet run --project apps/api/src/DevInn.DatabaseMigrator -- "--ConnectionStrings:DatabaseConnection=Host=localhost;Database=devinn;Username=postgres;Password=postgres"
```

O Compose publica o PostgreSQL apenas em `127.0.0.1:5432`. Se você já usou um Compose antigo do DevInn, faça um backup
do banco local antes de recriar o contêiner. A versão anterior podia armazenar dados em um volume anônimo.

### 2. Configure a API e os dados de demonstração

Gere uma chave de assinatura para esta instalação e salve-a em User Secrets. O comando funciona em Bash e PowerShell.

```sh
node -p "require('node:crypto').randomBytes(32).toString('hex')"
dotnet user-secrets set "Jwt:SecretKey" "COLE_A_CHAVE_GERADA" --project apps/api/src/DevInn.WebApi
```

Para criar uma pousada, reservas de exemplo e as duas contas administrativas locais, configure duas senhas fortes e
diferentes. Substitua cada marcador por uma senha gerada para essa instalação. O seed só roda em `Development` e precisa
ser habilitado explicitamente.

```sh
dotnet user-secrets set "DevelopmentSeed:SuperAdminPassword" "SENHA_DO_SUPERADMIN" --project apps/api/src/DevInn.WebApi
dotnet user-secrets set "DevelopmentSeed:InnAdminPassword" "SENHA_DO_ADMIN_DA_POUSADA" --project apps/api/src/DevInn.WebApi
dotnet user-secrets set "DevelopmentSeed:Enabled" "true" --project apps/api/src/DevInn.WebApi
```

Use `innadmin@pousada.local` para acessar a pousada de exemplo ou `superadmin@devinn.local` para administração global. O
seed usa as senhas apenas na criação dessas contas. Depois do primeiro início, você pode desabilitar o seed definindo
`DevelopmentSeed:Enabled` como `false`.

A recuperação de senha por e-mail exige configurar `EmailOptions:ApiKey` e `EmailOptions:FromAddress` com uma conta
Resend.

### 3. Inicie a API e o frontend

Abra dois terminais na raiz do repositório.

```sh
pnpm --filter @dev-inn/api dev
```

```sh
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @dev-inn/web dev --strictPort
```

A interface fica em `http://localhost:5173` e a API em `http://localhost:5109`. Ajuste `VITE_API_URL` em
`apps/web/.env.local` se usar outro endereço. Para outra origem do frontend, configure também `ALLOWED_ORIGINS` na API.

## Build e testes

```sh
pnpm --filter @dev-inn/web lint
pnpm --filter @dev-inn/web build
dotnet build apps/api/DevInn.slnx
dotnet test --solution apps/api/DevInn.slnx
dotnet test --solution apps/backup/DevInn.Backup.slnx
```

Consulte o [guia do worker](apps/backup/README.md) para configuração e restauração de backups.

## Contribuição

Abra uma issue para discutir uma mudança ou relatar um bug. Envie pull requests para `main` com uma descrição e os
testes realizados. Inclua exatamente um marcador de versão no título, entre `[Patch]`, `[Minor]` e `[Major]`. Siga as
convenções do [AGENTS.md](AGENTS.md).

## Licença

O DevInn é distribuído sob a [Apache License 2.0](LICENSE). As atribuições dos materiais incorporados estão
em [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES).
