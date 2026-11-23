# Desenvolvimento local

Você vai precisar de Git, Node.js 24 ou superior, pnpm 10 ou superior, SDK do .NET 10 e Docker em execução. Use um banco dedicado à demonstração e execute os comandos a partir da raiz do repositório.

## Instale as dependências e prepare o banco

O contêiner abaixo publica a porta do PostgreSQL apenas em `127.0.0.1:5432` e usa um volume para manter os dados da demonstração.

```sh
git clone https://github.com/raffreitas/devinn.git
cd devinn
pnpm install --frozen-lockfile
docker run --detach --name devinn-demo-postgres --publish 127.0.0.1:5432:5432 --env POSTGRES_DB=devinn --env POSTGRES_USER=postgres --env POSTGRES_PASSWORD=postgres --volume devinn_demo_pgdata:/var/lib/postgresql/data postgres:17
docker exec devinn-demo-postgres pg_isready -h 127.0.0.1 -U postgres -d devinn
```

Quando `pg_isready` indicar que o banco aceita conexões, aplique as migrações.

```sh
dotnet run --project apps/api/src/DevInn.DatabaseMigrator -- "--ConnectionStrings:DatabaseConnection=Host=localhost;Database=devinn;Username=postgres;Password=postgres"
```

Se o contêiner já existir e estiver parado, inicie-o com `docker start devinn-demo-postgres`. Se a porta `5432` estiver em uso, escolha outra porta no comando `docker run` e informe a mesma porta na string de conexão do migrador e em `ConnectionStrings:DatabaseConnection` nos User Secrets da API.

## Configure e inicie a API

Gere uma chave local de assinatura JWT e copie o valor exibido no lugar de `COLE_A_CHAVE_GERADA`. Os comandos funcionam em PowerShell e em Bash.

```sh
node -p "require('node:crypto').randomBytes(32).toString('hex')"
dotnet user-secrets set "Jwt:SecretKey" "COLE_A_CHAVE_GERADA" --project apps/api/src/DevInn.WebApi
dotnet user-secrets set "Observability:Enabled" "false" --project apps/api/src/DevInn.WebApi
pnpm --filter @dev-inn/api dev
```

O perfil `http` habilita o ambiente `Development`. Com a API em execução, abra `http://localhost:5109/health/ready` para verificar a conexão com o banco e `http://localhost:5109/scalar` para explorar a API.

## Inicie o frontend

Em outro terminal, copie o arquivo de configuração de exemplo.

**PowerShell**

```powershell
Copy-Item apps/web/.env.example apps/web/.env.local
```

**Bash**

```sh
cp apps/web/.env.example apps/web/.env.local
```

```sh
pnpm --filter @dev-inn/web dev --strictPort
```

Abra `http://localhost:5173`. Se a API usar outro endereço, ajuste `VITE_API_URL` em `apps/web/.env.local`. Se o frontend usar outra origem, informe essa origem em `ALLOWED_ORIGINS` no processo da API. Use vírgulas para listar múltiplas origens.

## Explore os dados de demonstração

Em `Development`, a API provisiona a **Pousada Exemplo**, o quarto 101 e reservas fictícias quando executada em um banco vazio.

| Conta | Acesso |
| --- | --- |
| `innadmin@pousada.local` | Administração da pousada de exemplo. |
| `superadmin@devinn.local` | Administração global e seleção de pousadas. |

As contas são criadas com a senha de demonstração definida em [`DatabaseSeed.cs`](../apps/api/src/DevInn.Infrastructure/Persistence/SeedData/DatabaseSeed.cs). Execute o ambiente de demonstração apenas na sua máquina.

## Integrações opcionais

- **Recuperação de senha por e-mail** requer uma conta Resend. Configure `EmailOptions:ApiKey` e `EmailOptions:FromAddress` nos User Secrets da API.
- **Sincronização periódica de iCal** é habilitada com `BackgroundJobs:Enabled` nos User Secrets da API. A sincronização manual fica disponível na lista de integrações para feeds ativos.
- **Telemetria local** pode ser visualizada no Aspire Dashboard. Execute `docker compose up -d aspire`, defina `Observability:Enabled` como `true` nos User Secrets e reinicie a API. O perfil `http` envia dados por OTLP para `localhost:4317`.
