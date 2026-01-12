# Especificação Técnica da Stack - StayManager SaaS

**Versão:** 1.0
**Data:** Janeiro 2026
**Responsável:** Equipe de Desenvolvimento
**Relacionado:** [PRD](./PRD.md) | [Integração Booking.com](./INTEGRACAO-BOOKING.md)

---

## 1. Visão Geral da Arquitetura

### 1.1 Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                     │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │   Pages    │  │ Components  │  │   Server Actions     │ │
│  │  (Routes)  │  │  (shadcn)   │  │   (Form handling)    │ │
│  └────────────┘  └─────────────┘  └──────────────────────┘ │
│                                                               │
│  Deploy: Vercel                                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                       HTTPS/JWT
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              BACKEND API (.NET 10 Web API)                    │
│  ┌───────────┐  ┌────────────┐  ┌─────────────────────────┐│
│  │Controllers│  │  Services  │  │  Background Jobs        ││
│  │  (REST)   │  │ (Business) │  │   (Hangfire)            ││
│  └───────────┘  └────────────┘  └─────────────────────────┘│
│                                                               │
│  Deploy: Azure App Service / Railway / Render                │
└───┬───────────────┬────────────────┬─────────────────────┬──┘
    │               │                │                     │
    │               │                │                     │
┌───▼─────┐  ┌─────▼──────┐  ┌─────▼──────┐  ┌─────────▼─────┐
│PostgreSQL│  │   Redis    │  │  Hangfire  │  │ External APIs │
│ (Neon/   │  │ (Upstash)  │  │ Dashboard  │  │  (Booking)    │
│ Supabase)│  │            │  │            │  │               │
└──────────┘  └────────────┘  └────────────┘  └───────────────┘
```

### 1.2 Padrão de Comunicação
- **Frontend → Backend:** REST API + JSON
- **Autenticação:** JWT Bearer Token (OAuth 2.0 / OpenID Connect)
- **Webhook:** Backend expõe endpoints públicos para Booking.com
- **Background Jobs:** Hangfire com Redis para filas

---

## 2. Stack Frontend

### 2.1 Framework e Core

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** | 15.x (App Router) | Framework React com SSR/SSG |
| **React** | 19.x | Biblioteca UI |
| **TypeScript** | 5.x | Tipagem estática |
| **Node.js** | 20 LTS | Runtime |

### 2.2 UI/Design System

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Tailwind CSS** | 3.x | Framework CSS utility-first |
| **shadcn/ui** | Latest | Componentes UI (Radix UI + Tailwind) |
| **Lucide Icons** | Latest | Ícones SVG |
| **class-variance-authority** | Latest | Variantes de componentes |
| **tailwind-merge** | Latest | Merge de classes Tailwind |

**Componentes shadcn/ui utilizados:**
```bash
npx shadcn@latest init
npx shadcn@latest add button card input label select
npx shadcn@latest add calendar dialog dropdown-menu
npx shadcn@latest add table badge separator sheet
npx shadcn@latest add form toast tooltip tabs
```

### 2.3 Gerenciamento de Estado e Dados

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **TanStack Query (React Query)** | 5.x | Cache e sincronização de dados server-side |
| **Zustand** | 4.x | State management global (UI state) |
| **React Hook Form** | 7.x | Gerenciamento de formulários |
| **Zod** | 3.x | Validação e schema de dados |

### 2.4 Autenticação Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **NextAuth.js (Auth.js)** | 5.x | Autenticação com JWT do backend |
| **jose** | Latest | JWT verification no edge |

**Configuração NextAuth:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // Chama backend .NET
        const response = await fetch(`${process.env.API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials)
        });

        if (!response.ok) return null;

        const data = await response.json();
        return {
          id: data.userId,
          email: data.email,
          name: data.name,
          innId: data.innId,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.innId = user.innId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.innId = token.innId;
      session.accessToken = token.accessToken;
      return session;
    }
  }
});
```

### 2.5 API Client

```typescript
// lib/api-client.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor para adicionar token
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login ou tentar refresh
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2.6 Estrutura de Pastas Frontend

```
staymanager-web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Layout do dashboard
│   │   ├── page.tsx                # Dashboard home
│   │   ├── calendar/
│   │   │   └── page.tsx            # Calendário Gantt
│   │   ├── bookings/
│   │   │   ├── page.tsx            # Lista de reservas
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx        # Detalhes da reserva
│   │   │   └── new/
│   │   │       └── page.tsx        # Nova reserva
│   │   ├── guests/
│   │   │   └── page.tsx            # Lista de hóspedes
│   │   ├── financial/
│   │   │   ├── page.tsx            # Dashboard financeiro
│   │   │   └── expenses/
│   │   │       └── page.tsx        # Gestão de despesas
│   │   ├── rooms/
│   │   │   └── page.tsx            # Gestão de quartos
│   │   └── settings/
│   │       ├── page.tsx            # Configurações gerais
│   │       ├── integrations/
│   │       │   └── page.tsx        # Integrações (Booking)
│   │       └── pricing/
│   │           └── page.tsx        # Configuração de preços
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                          # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── features/
│   │   ├── booking/
│   │   │   ├── booking-calendar.tsx
│   │   │   ├── booking-form.tsx
│   │   │   └── booking-list.tsx
│   │   ├── financial/
│   │   │   ├── financial-dashboard.tsx
│   │   │   ├── expense-form.tsx
│   │   │   └── revenue-chart.tsx
│   │   └── guests/
│   │       └── guest-details.tsx
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── footer.tsx
├── lib/
│   ├── api-client.ts               # Axios instance
│   ├── utils.ts                     # Utility functions
│   └── types.ts                     # TypeScript types
├── hooks/
│   ├── use-bookings.ts             # React Query hooks
│   ├── use-rooms.ts
│   └── use-financial.ts
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Stack Backend (.NET)

### 3.1 Framework e Core

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **ASP.NET Core** | 10.0 LTS | Framework Web API |
| **C#** | 14 | Linguagem |
| **.NET SDK** | 10.0 | Runtime e compilação |

### 3.2 ORM e Database

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Entity Framework Core** | 10.0 | ORM para PostgreSQL |
| **Npgsql.EntityFrameworkCore.PostgreSQL** | 8.0 | Provider PostgreSQL |
| **PostgreSQL** | 18.x | Banco de dados relacional |

### 3.3 Autenticação e Autorização Backend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **ASP.NET Core Identity** | 10.0 | Gerenciamento de usuários |
| **Microsoft.AspNetCore.Authentication.JwtBearer** | 10.0 | Autenticação JWT |
| **System.IdentityModel.Tokens.Jwt** | Latest | Geração/validação de JWT |

**Configuração de Autenticação:**

```csharp
// Program.cs
builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
        )
    };
});

builder.Services.AddAuthorization();
```

**Modelo de Usuário:**

```csharp
// Domain/Entities/ApplicationUser.cs
public class ApplicationUser : IdentityUser<Guid>
{
    public Guid InnId { get; set; }  // Multi-tenancy
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Inn Inn { get; set; }
}
```

**Serviço de Autenticação:**

```csharp
// Services/AuthService.cs
public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            throw new UnauthorizedException("Invalid credentials");
        }

        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        return new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email,
            Name = $"{user.FirstName} {user.LastName}",
            InnId = user.InnId,
            AccessToken = token,
            RefreshToken = refreshToken,
            ExpiresIn = 3600
        };
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("inn_id", user.InnId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])
        );
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

### 3.4 Background Jobs

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Hangfire** | 1.8.x | Background jobs e scheduling |
| **Hangfire.PostgreSql** | Latest | Storage para Hangfire |
| **StackExchange.Redis** | 2.x | Cache e queue (opcional) |

**Configuração Hangfire:**

```csharp
// Program.cs
builder.Services.AddHangfire(config =>
{
    config.UsePostgreSqlStorage(
        builder.Configuration.GetConnectionString("DefaultConnection")
    );
});

builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = 5;
});

// app configuration
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAuthorizationFilter() }
});

// Schedule recurring jobs
RecurringJob.AddOrUpdate<BookingSyncJob>(
    "sync-booking-reservations",
    job => job.SyncAllInnsAsync(),
    "*/10 * * * *" // Every 10 minutes
);
```

### 3.5 Outras Bibliotecas Backend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **FluentValidation** | 11.x | Validação de modelos |
| **AutoMapper** | 13.x | Mapeamento de DTOs |
| **Serilog** | 3.x | Logging estruturado |
| **Polly** | 8.x | Resilience e retry policies |
| **Swashbuckle (Swagger)** | 6.x | Documentação API |
| **MediatR** | 12.x | CQRS pattern (opcional) |

### 3.6 Estrutura de Pastas Backend

```
StayManager.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── BookingsController.cs
│   ├── RoomsController.cs
│   ├── FinancialController.cs
│   └── WebhooksController.cs
├── Domain/
│   ├── Entities/
│   │   ├── Inn.cs
│   │   ├── Room.cs
│   │   ├── RoomCategory.cs
│   │   ├── Booking.cs
│   │   ├── Expense.cs
│   │   └── ApplicationUser.cs
│   ├── Enums/
│   │   ├── BookingSource.cs
│   │   ├── BookingStatus.cs
│   │   └── ExpenseCategory.cs
│   └── Interfaces/
│       ├── IRepository.cs
│       └── IBookingService.cs
├── Application/
│   ├── DTOs/
│   │   ├── BookingDto.cs
│   │   ├── CreateBookingDto.cs
│   │   └── AuthResponse.cs
│   ├── Services/
│   │   ├── BookingService.cs
│   │   ├── AuthService.cs
│   │   ├── FinancialService.cs
│   │   └── PricingService.cs
│   ├── Validators/
│   │   └── CreateBookingValidator.cs
│   └── Mappings/
│       └── AutoMapperProfile.cs
├── Infrastructure/
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   ├── Configurations/
│   │   │   ├── BookingConfiguration.cs
│   │   │   └── RoomConfiguration.cs
│   │   └── Migrations/
│   ├── Repositories/
│   │   ├── Repository.cs
│   │   └── BookingRepository.cs
│   ├── Integrations/
│   │   ├── BookingCom/
│   │   │   ├── BookingComService.cs
│   │   │   ├── BookingComClient.cs
│   │   │   └── Models/
│   │   └── Airbnb/
│   │       └── AirbnbICalService.cs
│   └── BackgroundJobs/
│       ├── BookingSyncJob.cs
│       ├── FinancialSyncJob.cs
│       └── HangfireAuthorizationFilter.cs
├── Middleware/
│   ├── ExceptionHandlingMiddleware.cs
│   └── MultiTenancyMiddleware.cs
├── Extensions/
│   ├── ServiceCollectionExtensions.cs
│   └── ApplicationBuilderExtensions.cs
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
└── StayManager.API.csproj
```

---

## 4. Banco de Dados (PostgreSQL)

### 4.1 Provedor de Banco de Dados

**Opções recomendadas:**

| Provedor | Plano Gratuito | Performance | Propósito |
|----------|----------------|-------------|-----------|
| **Neon** | 10 GB | Excelente | Produção (serverless) |
| **Supabase** | 500 MB | Boa | MVP + Auth alternativa |
| **Railway** | 1 GB | Boa | All-in-one (DB + backend) |
| **Azure Database** | Não | Excelente | Enterprise |

**Recomendação:** **Neon** para produção (serverless, fast, econômico)

### 4.2 Configuração Connection String

```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=your-neon-host.neon.tech;Port=5432;Database=staymanager;Username=your-user;Password=your-password;SSL Mode=Require"
  }
}
```

### 4.3 Migrations com EF Core

```bash
# Criar migration
dotnet ef migrations add InitialCreate -p StayManager.API -s StayManager.API

# Aplicar migration
dotnet ef database update -p StayManager.API -s StayManager.API

# Gerar script SQL
dotnet ef migrations script -p StayManager.API -o migration.sql
```

### 4.4 Estratégias de Multi-tenancy

**Opção 1: Query Filters (Recomendado)**

```csharp
// Infrastructure/Data/AppDbContext.cs
protected override void OnModelCreating(ModelBuilder builder)
{
    base.OnModelCreating(builder);

    // Global query filter para multi-tenancy
    builder.Entity<Booking>().HasQueryFilter(b =>
        b.InnId == _currentInnId);

    builder.Entity<Room>().HasQueryFilter(r =>
        r.InnId == _currentInnId);

    builder.Entity<Expense>().HasQueryFilter(e =>
        e.InnId == _currentInnId);
}

// Middleware para capturar InnId do JWT
public class MultiTenancyMiddleware
{
    public async Task InvokeAsync(HttpContext context, ICurrentUserService currentUser)
    {
        var innIdClaim = context.User.FindFirst("inn_id")?.Value;
        if (!string.IsNullOrEmpty(innIdClaim))
        {
            currentUser.InnId = Guid.Parse(innIdClaim);
        }
        await _next(context);
    }
}
```

---

## 5. DevOps e Deploy

### 5.1 Frontend (Next.js)

**Plataforma:** Vercel (Recomendado)

```bash
# Deploy automático via Git
# 1. Conectar repositório no Vercel
# 2. Configurar variáveis de ambiente:

NEXT_PUBLIC_API_URL=https://api.staymanager.com
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://staymanager.com
```

**Alternativas:** Netlify, Cloudflare Pages

### 5.2 Backend (.NET)

**Opções de Deploy:**

| Plataforma | Custo/mês | Propósito |
|------------|-----------|-----------|
| **Railway** | $5-20 | MVP rápido (DB + API juntos) |
| **Render** | $7+ | Fácil setup, CI/CD |
| **Azure App Service** | $13+ (B1) | Enterprise, escalável |
| **AWS Elastic Beanstalk** | $15+ | AWS ecosystem |
| **Fly.io** | $3+ | Global edge |

**Recomendação inicial:** **Railway** (simples, inclui PostgreSQL)

### 5.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/backend.yml
name: Deploy Backend

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'

      - name: Restore dependencies
        run: dotnet restore
        working-directory: ./backend

      - name: Build
        run: dotnet build --no-restore
        working-directory: ./backend

      - name: Test
        run: dotnet test --no-build --verbosity normal
        working-directory: ./backend

      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 6. Monitoramento e Observabilidade

### 6.1 Logging

**Backend:**
```csharp
// Serilog configuration
builder.Host.UseSerilog((context, config) =>
{
    config
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.Seq("http://localhost:5341"); // Seq para dev
});
```

**Frontend:**
- Vercel Analytics (built-in)
- Sentry (error tracking)

### 6.2 APM (Application Performance Monitoring)

| Ferramenta | Custo | Propósito |
|------------|-------|-----------|
| **Sentry** | Free tier | Error tracking (front + back) |
| **Application Insights** | Pay-as-you-go | Azure native APM |
| **New Relic** | Free tier | Full stack observability |

---

## 7. Variáveis de Ambiente

### 7.1 Frontend (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:5000

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Feature Flags (opcional)
NEXT_PUBLIC_ENABLE_BOOKING_INTEGRATION=true
```

### 7.2 Backend (appsettings.json / Environment Variables)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=staymanager;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Key": "your-super-secret-jwt-key-min-32-chars",
    "Issuer": "staymanager-api",
    "Audience": "staymanager-web",
    "ExpiresInHours": 1
  },
  "BookingCom": {
    "BaseUrl": "https://api.booking.com",
    "ClientId": "",
    "ClientSecret": ""
  },
  "Hangfire": {
    "DashboardEnabled": true,
    "WorkerCount": 5
  },
  "Serilog": {
    "MinimumLevel": "Information"
  }
}
```

---

## 8. Segurança

### 8.1 Checklist de Segurança

**Backend:**
- ✅ HTTPS obrigatório em produção
- ✅ JWT com expiração curta (1h) + refresh token
- ✅ Rate limiting (ASP.NET Core Rate Limiting)
- ✅ CORS configurado para domínio específico
- ✅ SQL Injection prevenido (EF Core parametrizado)
- ✅ Validação de inputs (FluentValidation)
- ✅ Multi-tenancy com query filters
- ✅ Secrets em variáveis de ambiente (não no código)

**Frontend:**
- ✅ HTTPOnly cookies para refresh tokens
- ✅ CSRF protection (NextAuth built-in)
- ✅ XSS prevention (React escaping automático)
- ✅ Content Security Policy headers
- ✅ Dependências auditadas (npm audit)

### 8.2 CORS Configuration

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "https://staymanager.com"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

---

## 9. Estimativa de Custos (MVP)

| Recurso | Provedor | Custo/mês |
|---------|----------|-----------|
| Frontend Hosting | Vercel | $0 (Hobby) |
| Backend Hosting | Railway | $10 (Starter) |
| PostgreSQL | Neon | $0 (Free tier) |
| Redis (Hangfire) | Upstash | $0 (Free tier) |
| Domain | Namecheap | $12/ano (~$1) |
| **Total Inicial** | | **~$11/mês** |

**Produção (100 pousadas):**
- Frontend: Vercel Pro $20
- Backend: Railway Pro $20
- Database: Neon Scale $19
- Redis: Upstash Pay-as-you-go $10
- **Total:** ~$69/mês

---

## 10. Próximos Passos

### 10.1 Roadmap Técnico

**Semana 1-2: Setup**
- [ ] Criar projeto Next.js com shadcn/ui
- [ ] Criar projeto .NET Web API
- [ ] Configurar PostgreSQL (Neon)
- [ ] Configurar autenticação (Identity + NextAuth)

**Semana 3-4: Core Features**
- [ ] Implementar CRUD de Bookings
- [ ] Calendário Gantt (frontend)
- [ ] Dashboard financeiro
- [ ] Multi-tenancy setup

**Semana 5-6: Integração Booking.com**
- [ ] Implementar BookingComService
- [ ] Configurar Hangfire jobs
- [ ] Webhook endpoints

**Semana 7-8: Polish & Deploy**
- [ ] Testes (unit + integration)
- [ ] Deploy (Railway + Vercel)
- [ ] Monitoramento (Sentry)

---

**Última atualização:** Janeiro 2026
**Próxima revisão:** Após setup inicial
