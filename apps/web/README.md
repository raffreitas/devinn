# DevInn Frontend - MVP

Sistema completo de gestão de pousadas com inventário, reservas (calendário Gantt), precificação e controle financeiro.

## 🚀 Tecnologias

- **React 19** - Framework de UI com novos recursos
- **TypeScript** - Type safety
- **Vite 7** - Build tool rápido
- **Tailwind CSS v4** - Estilização com oklch
- **shadcn/ui** - Componentes UI modernos (Radix + Tailwind)
- **React Hook Form + Zod** - Validação de formulários type-safe
- **TanStack Query v5** - Gerenciamento de estado assíncrono
- **React Router v7** - Roteamento moderno
- **date-fns** - Manipulação de datas (pt-BR)
- **next-themes** - Dark mode com system detection
- **localStorage** - Persistência local (bookings e financial)

## 📁 Estrutura do Projeto

```
apps/web/src/
├── features/
│   ├── auth/              # Autenticação com JWT
│   ├── bookings/          # Reservas e calendário Gantt
│   │   ├── components/   # BookingFormDialog, ReservationBar, GuestDetails
│   │   ├── services/     # localStorage CRUD + pricing engine
│   │   ├── pages/        # BookingsList, Calendar (Gantt)
│   │   └── types/        # Booking, Guest, Payment, PricingBreakdown
│   ├── financial/         # Dashboard financeiro e despesas
│   │   ├── components/   # ExpenseFormDialog, ExpenseList, Metrics
│   │   ├── services/     # Agregação de receitas/despesas
│   │   ├── pages/        # FinancialDashboard, ExpensesPage
│   │   └── types/        # Expense, FinancialMetrics
│   └── inventory/         # Categorias e quartos
│       ├── components/   # CategoryFormDialog, RoomFormDialog
│       ├── services/     # REST API integration
│       ├── pages/        # CategoriesPage, RoomsPage
│       └── types/        # Category, Room, RoomStatus
├── shared/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── ui/           # shadcn components (33 componentes)
│   │   ├── app-sidebar.tsx  # Sidebar responsivo mobile/desktop
│   │   ├── theme-provider.tsx  # next-themes wrapper
│   │   └── theme-toggle.tsx    # Sun/Moon/System toggle
│   ├── contexts/         # TenantContext (multi-tenant)
│   ├── hooks/            # Custom hooks
│   ├── layouts/          # AppLayout (Top Nav + Sidebar), AuthLayout
│   └── lib/              # http-client (axios + auth interceptors)
└── routes.tsx            # React Router v7 configuration
```

## 🎨 Design System

O projeto utiliza o sistema de design do shadcn/ui com temas configurados:

### Temas Disponíveis
- **Light Mode**: Tema claro padrão com background branco
- **Dark Mode**: Tema escuro elegante com background #09090b
- **System**: Detecta preferência do sistema operacional

### Padrão de Cores (oklch)
Cores definidas em [index.css](./src/index.css):
- **Primary**: Azul escuro (#1a1a1a light, #eaeaea dark)
- **Destructive**: Vermelho para ações destrutivas
- **Success/Green**: Status positivo (pagamentos confirmados, receitas)
- **Warning/Yellow**: Status intermediário (pagamento parcial)
- **Danger/Red**: Status negativo (pendências, despesas)
- **Muted**: Cinza para texto secundário e backgrounds

### Breakpoints Mobile-First
```css
sm: 640px   /* Tablet */
md: 768px   /* Desktop pequeno */
lg: 1024px  /* Desktop médio */
xl: 1280px  /* Desktop grande */
```

## 🔐 Autenticação

### Login Real (API)
```typescript
// Endpoint: POST /api/v1/auth/login
// Body: { email, password }
// Response: { access_token }
```

**Token JWT armazenado no localStorage contém:**
- `role`: 'SuperAdmin' | 'InnAdmin'
- `inn_id`: ID da pousada (para InnAdmin)
- `exp`: Timestamp de expiração

### Fluxo de Autenticação
1. Login via [SignInPage](./src/features/auth/pages/sign-in-page.tsx)
2. Token JWT armazenado em `localStorage.getItem('token')`
3. Interceptor HTTP adiciona `Authorization: Bearer <token>` em todas requisições
4. [AuthContext](./src/shared/contexts/auth-context.tsx) extrai `inn_id`:
   - **InnAdmin**: Extrai `inn_id` direto do JWT
   - **SuperAdmin**: Mostra dropdown para selecionar pousada
5. Header `X-Inn-Id` enviado em todas requisições para API multi-tenant

## 📦 Módulos Implementados

### 1. Inventário (API Integration)
**Páginas:**
- `/inventory/categories` - CRUD de categorias
- `/inventory/rooms` - CRUD de quartos com filtros

**Validações Implementadas:**
- ✅ Nome único (validação client-side)
- ✅ Capacidade: 1-10 pessoas
- ✅ Preço base > 0 e preço pessoa extra >= 0
- ✅ Número do quarto: 1-999
- ✅ Status: Active, Maintenance, Inactive

**API Endpoints:**
- GET/POST `/api/v1/categories`
- GET/PUT/DELETE `/api/v1/categories/:id`
- GET/POST `/api/v1/rooms` (com query params: categoryId, status, page, limit)
- GET/PUT/DELETE `/api/v1/rooms/:id`

**Features:**
- Filtros por categoria e status
- Paginação com TanStack Query
- Cache automático e invalidação
- Toast notifications (sucesso/erro)

### 2. Reservas (localStorage até API estar disponível)
**Páginas:**
- `/bookings` - Lista de reservas com filtros (status, payment, search)
- `/` (home) - **Calendário Gantt mensal**

**Funcionalidades Implementadas:**

- ✅ **Validação de conflitos (RF02)**: Verifica sobreposição de datas antes de criar/atualizar
- ✅ **Cálculo automático de precificação (RF17-RF21)**:
  ```typescript
  const nights = differenceInDays(checkOut, checkIn);
  const extraGuests = Math.max(0, numberOfGuests - roomCapacity);
  const baseTotal = basePrice * nights;
  const extraTotal = extraGuestPrice * extraGuests * nights;
  const total = baseTotal + extraTotal;
  ```
- ✅ **Status da reserva**: scheduled, hosting, completed, Canceled
- ✅ **Status de pagamento**: Pending, Partial, Paid
- ✅ **Detalhes do hóspede**: Nome completo, email, telefone, CPF
- ✅ **Registro de pagamentos**: Adicionar pagamentos parciais com método (PIX, Dinheiro, Cartão)
- ✅ **Filtros**: Por status, payment status, busca por nome de hóspede

**localStorage Schema:**
```typescript
// Key: bookings_<inn_id>
{
  id: string;
  roomId: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  numberOfGuests: number;
  guest: {
    name: string;
    email: string;
    phone: string;
    document: string;
  };
  pricing: {
    basePrice: number;
    extraGuestPrice: number;
    nights: number;
    extraGuests: number;
    baseTotal: number;
    extraTotal: number;
    total: number;
  };
  payments: Array<{
    id: string;
    amount: number;
    method: 'pix' | 'cash' | 'credit_card' | 'debit_card';
    date: string;
  }>;
  status: 'scheduled' | 'hosting' | 'completed' | 'Canceled';
  paymentStatus: 'Pending' | 'Partial' | 'Paid';
}
```

### Calendário Gantt (Home Page)
**Features Implementadas:**
- ✅ **Grid Layout CSS**: Quartos (Y-axis) × Dias do mês (X-axis)
- ✅ **Navegação mensal**: Botões anterior/próximo/hoje
- ✅ **Indicador visual de "hoje"**: Coluna destacada
- ✅ **Barras de reserva coloridas**:
  - 🟢 Verde (`bg-green-500`): Pagamento completo (Paid)
  - 🟡 Amarelo (`bg-yellow-500`): Pagamento parcial (Partial)
  - 🔴 Vermelho (`bg-red-500`): Pagamento pendente (Pending)
- ✅ **Interações**:
  - Click em célula vazia → Abre dialog de criação com quarto/data pré-preenchidos
  - Click em barra → Abre painel de detalhes do hóspede (GuestDetailsPanel)
- ✅ **Informações na barra**: Nome do hóspede + valor total
- ✅ **Grid responsivo**: Scroll horizontal em telas pequenas

**Implementação Técnica:**
```typescript
// CSS Grid dinâmico
<div className="grid" style={{
  gridTemplateColumns: `200px repeat(${daysInMonth}, 50px)`,
  gridTemplateRows: `repeat(${rooms.length}, 60px)`
}}>
  {/* Linha de cabeçalho com datas */}
  {/* Linhas de quartos com células clicáveis */}
  {/* Barras de reserva posicionadas via gridColumn */}
</div>
```

### 3. Financeiro (localStorage até API estar disponível)
**Páginas:**
- `/financial` - Dashboard com métricas do mês
- `/financial/expenses` - Gestão de despesas

**Dashboard Financeiro:**
- ✅ **Métricas Consolidadas**:
  - 💰 **Receita Total**: Soma de todos pagamentos recebidos no mês (checkIn ou checkOut no mês)
  - 📉 **Despesas Totais**: Soma de despesas lançadas no mês
  - 📊 **Balanço**: Receita - Despesas
- ✅ **Navegação Mensal**: Filtro por mês/ano
- ✅ **Despesas por Categoria**: Gráfico de barras com porcentagem
- ✅ **Cards com cores semânticas**:
  - Verde: Receitas
  - Vermelho: Despesas
  - Azul: Balanço positivo / Vermelho: Balanço negativo

**Gestão de Despesas:**
- ✅ **10 Categorias Suportadas**:
  - 💧 Água
  - ⚡ Energia
  - 🔥 Gás
  - 📡 Internet
  - 🔧 Manutenção
  - 👥 Funcionários
  - 📦 Suprimentos
  - 📢 Marketing
  - 💼 Impostos
  - 📋 Outros
- ✅ **CRUD Completo**: Criar, editar, excluir despesas
- ✅ **Filtro por mês**: Navegação mensal
- ✅ **Validações**: Valor > 0, descrição obrigatória

**localStorage Schema:**
```typescript
// Key: expenses_<inn_id>
{
  id: string;
  category: 'water' | 'energy' | 'gas' | 'internet' | 'maintenance' |
            'employees' | 'supplies' | 'marketing' | 'taxes' | 'others';
  description: string;
  amount: number;
  date: string; // ISO date
}
```

**Registro de Pagamentos (Bookings):**
- ✅ Dialog para adicionar pagamento em reserva
- ✅ Métodos suportados: PIX, Dinheiro, Cartão de Crédito, Cartão de Débito
- ✅ Validação: Soma dos pagamentos não pode exceder total
- ✅ Atualização automática de `paymentStatus`:
  - `Pending`: Nenhum pagamento
  - `Partial`: 0 < pagamentos < total
  - `Paid`: pagamentos >= total

## 🎯 Regras de Negócio Implementadas

### Precificação Automática (RF17-RF21)
```typescript
// Serviço: bookingService.calculatePricing()
const nights = differenceInDays(checkOut, checkIn);
const capacity = room.capacity;
const extraGuests = Math.max(0, numberOfGuests - capacity);

const baseTotal = room.basePrice * nights;
const extraTotal = room.extraGuestPrice * extraGuests * nights;
const total = baseTotal + extraTotal;
```

### Validação de Conflitos (RF02)
```typescript
// Serviço: bookingService.checkConflict()
function checkConflict(roomId: string, checkIn: Date, checkOut: Date, excludeId?: string): boolean {
  const bookings = getBookings(innId).filter(b =>
    b.roomId === roomId &&
    b.id !== excludeId &&
    b.status !== 'Canceled'
  );

  return bookings.some(booking => {
    const existingCheckIn = parseISO(booking.checkIn);
    const existingCheckOut = parseISO(booking.checkOut);

    // Verifica sobreposição de intervalos
    return (
      (checkIn >= existingCheckIn && checkIn < existingCheckOut) ||
      (checkOut > existingCheckIn && checkOut <= existingCheckOut) ||
      (checkIn <= existingCheckIn && checkOut >= existingCheckOut)
    );
  });
}
```

### Filtro Temporal Financeiro
- **Receitas**: Booking com `checkIn` OU `checkOut` no mês selecionado
- **Despesas**: Despesa com `date` no mês selecionado

## 🎨 Componentes shadcn/ui Instalados

Total: **33 componentes** configurados e prontos para uso:

- ✅ Dialog, AlertDialog
- ✅ Select, Dropdown Menu, Command, Context Menu
- ✅ Calendar, Popover
- ✅ Table, Card
- ✅ Badge, Tooltip
- ✅ Tabs, Accordion, Collapsible
- ✅ Checkbox, Switch
- ✅ Skeleton, Separator
- ✅ Form (com React Hook Form)
- ✅ Toast/Sonner (notificações)
- ✅ Button, Input, Textarea, Label
- ✅ Drawer, Sheet
- ✅ Avatar, Progress

## 📱 Responsividade Mobile-First

Todos os componentes seguem o padrão mobile-first:

```css
/* Mobile: Base styles (< 640px) */
.component { width: 100%; }

/* Tablet: sm (640px+) */
@media (min-width: 640px) {
  .component { width: 80%; }
}

/* Desktop: md (768px+), lg (1024px+) */
@media (min-width: 1024px) {
  .component { width: 60%; }
}
```

**Layouts Responsivos:**

**Sidebar:**
- **Mobile** (< 1024px): Menu hambúrguer + Drawer lateral
- **Desktop** (1024px+): Sidebar fixa 256px à esquerda

**Tabelas:**
- **Mobile**: Colunas essenciais apenas, scroll horizontal
- **Desktop**: Todas as colunas visíveis com larguras fixas

**Formulários (Dialogs):**
- **Mobile**: 1 coluna, campos empilhados verticalmente
- **Desktop**: 2 colunas com `grid grid-cols-2 gap-4`

**Calendário Gantt:**
- **Mobile**: Scroll horizontal obrigatório (50px por dia)
- **Desktop**: Zoom out possível (aumentar grid columns)

## 🚀 Como Executar

```bash
# Instalar dependências (na raiz do monorepo)
cd d:\repos\projects\devinn
pnpm install

# Desenvolvimento (frontend apenas)
cd apps/web
pnpm dev
# Abre em http://localhost:5173

# Build de produção
pnpm build

# Preview da build
pnpm preview

# Lint + Format
pnpm biome:check
pnpm biome:fix
```

## 🔄 Migração para API (Próximos Passos)

Quando os endpoints de **Bookings** e **Financial** estiverem disponíveis:

### 1. Substituir localStorage Services
```typescript
// ANTES (localStorage)
// bookingService.ts
export function getBookings(innId: string): Booking[] {
  const key = `bookings_${innId}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

// DEPOIS (API)
// bookingService.ts
export async function getBookings(innId: string): Promise<Booking[]> {
  const response = await api.get('/api/v1/bookings');
  return response.data;
}
```

### 2. Atualizar TanStack Query
```typescript
// Já preparado para transição
const { data: bookings } = useQuery({
  queryKey: ['bookings', innId],
  queryFn: () => bookingService.getBookings(innId), // mesma interface
  enabled: !!innId,
});
```

### 3. Manter mesma Interface
O padrão de serviço foi desenhado para **strategy pattern**:
- Interface permanece a mesma
- Apenas a implementação muda (localStorage → API)
- Componentes não precisam de alterações

## 📋 API Endpoints Esperados (Backend)

### Autenticação ✅ (Já Implementado)
```
POST /api/v1/auth/login
Body: { email, password }
Response: { access_token }
```

### Inventário ✅ (Já Implementado)
```
GET    /api/v1/categories
POST   /api/v1/categories
GET    /api/v1/categories/:id
PUT    /api/v1/categories/:id
DELETE /api/v1/categories/:id

GET    /api/v1/rooms?categoryId=&status=&page=&limit=
POST   /api/v1/rooms
GET    /api/v1/rooms/:id
PUT    /api/v1/rooms/:id
DELETE /api/v1/rooms/:id
```

### Bookings 🔄 (Aguardando Backend)
```
GET    /api/v1/bookings?status=&paymentStatus=&page=&limit=
POST   /api/v1/bookings
GET    /api/v1/bookings/:id
PUT    /api/v1/bookings/:id
DELETE /api/v1/bookings/:id
POST   /api/v1/bookings/:id/payments
```

### Financial 🔄 (Aguardando Backend)
```
GET    /api/v1/financial/dashboard?month=&year=
GET    /api/v1/expenses?month=&year=&category=
POST   /api/v1/expenses
GET    /api/v1/expenses/:id
PUT    /api/v1/expenses/:id
DELETE /api/v1/expenses/:id
```

## 🎯 Features Opcionais Futuras

- [ ] **Virtualização do calendário**: react-virtual para >50 quartos
- [ ] **Sincronização offline-first**: Retry automático com fila
- [ ] **Exportação de relatórios**: PDF/Excel (react-pdf, xlsx)
- [ ] **Gráficos avançados**: Ocupação, revenue, forecast (recharts)
- [ ] **Sistema de notificações**: Push notifications para check-in/check-out
- [ ] **Multi-idioma**: i18next com pt-BR, en-US, es-ES
- [ ] **Pesquisa avançada**: Elasticsearch para busca de hóspedes
- [ ] **Integração OTA**: Booking.com, Airbnb APIs
- [ ] **Dashboard analytics**: Google Analytics, Mixpanel

## 📝 Convenções de Código

### Estrutura de Pastas
- **Feature-folder pattern**: Cada módulo isolado (`features/bookings/*`)
- **Co-location**: Componentes próximos ao uso
- **Types centralizados**: Sempre em `types/index.ts`
- **Services isolados**: Lógica de API/localStorage separada

### Naming Conventions
- **Componentes**: PascalCase (`BookingFormDialog.tsx`)
- **Funções**: camelCase (`calculatePricing()`)
- **Types/Interfaces**: PascalCase (`Booking`, `PricingBreakdown`)
- **Arquivos de serviço**: kebab-case (`booking-service.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`EXPENSE_CATEGORIES`)

### Imports Path Aliases
```typescript
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/contexts/auth-context';
import { bookingService } from '@/features/bookings/services/booking-service';
```

### Validação com Zod
```typescript
const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  capacity: z.number().min(1).max(10),
  basePrice: z.number().min(0.01),
});
```

## 🎨 Acessibilidade (WCAG 2.1 AA)

- ✅ **Navegação por teclado**: Tab, Enter, Escape funcionam em todos dialogs
- ✅ **ARIA labels**: Botões de ação com `aria-label` descritivo
- ✅ **Contrast ratio**: 4.5:1 (texto normal), 3:1 (texto grande)
- ✅ **Focus indicators**: Anel azul visível ao navegar por teclado
- ✅ **Screen reader friendly**: Labels semânticos, roles ARIA corretos
- ✅ **Responsive text**: Aumenta com zoom do navegador
- ✅ **Color-blind safe**: Não depende apenas de cor (ícones + texto)

## 🐛 Troubleshooting

### Erro: "Token expirado"
- **Causa**: JWT expirou após 24h
- **Solução**: Fazer logout e login novamente

### Calendário não mostra reservas
- **Causa**: `inn_id` não selecionado ou localStorage vazio
- **Solução**: Verificar TenantContext, criar reservas de teste

### Build falhando
- **Causa**: Versão Node.js < 18 ou pnpm desatualizado
- **Solução**: `nvm use 18`, `pnpm install -g pnpm@latest`

### Dark mode não persiste
- **Causa**: localStorage bloqueado por política do navegador
- **Solução**: Verificar configurações de privacidade

---

**Desenvolvido com React 19, TypeScript, Tailwind v4 e shadcn/ui** 🚀
**Arquitetura: Feature-folder pattern + Clean Architecture** 🏗️
**Status: MVP Completo - 12/12 todos finalizados** ✅

### Autenticação
- `POST /auth/login` - Login (retorna user no body)
- `POST /auth/logout` - Logout
- `GET /auth/me` - Dados do usuário autenticado

### Quartos
- `GET /room-categories` - Listar categorias
- `POST /room-categories` - Criar categoria
- `PUT /room-categories/:id` - Atualizar categoria
- `DELETE /room-categories/:id` - Deletar categoria
- `GET /rooms` - Listar quartos
- `POST /rooms` - Criar quarto
- `PUT /rooms/:id` - Atualizar quarto
- `DELETE /rooms/:id` - Deletar quarto

### Reservas
- `GET /bookings` - Listar reservas (aceita filtros: status, month)
- `GET /bookings/:id` - Detalhes da reserva
- `POST /bookings` - Criar reserva
- `PUT /bookings/:id` - Atualizar reserva
- `DELETE /bookings/:id` - Deletar reserva
- `POST /bookings/:id/cancel` - Cancelar reserva
- `POST /bookings/:id/payments` - Adicionar pagamento

### Financeiro
- `GET /dashboard/metrics?month=YYYY-MM` - Métricas consolidadas
- `GET /expenses` - Listar despesas (aceita filtros: month, category)
- `POST /expenses` - Criar despesa
- `PUT /expenses/:id` - Atualizar despesa
- `DELETE /expenses/:id` - Deletar despesa

## 🎨 Componentes Principais

### Dialogs
- `RoomCategoryDialog` - Criar/editar categorias
- `RoomDialog` - Criar/editar quartos
- `BookingDialog` - Criar/editar reservas com cálculo automático
- `BookingDetailsDialog` - Visualizar detalhes e gerenciar reserva
- `AddPaymentDialog` - Adicionar pagamentos parciais
- `ExpenseDialog` - Criar/editar despesas

### Pages
- `LoginPage` - Tela de login
- `RoomsPage` - Gestão de quartos e categorias
- `BookingsListPage` - Lista de reservas
- `AvailabilityMapPage` - Mapa Gantt
- `FinancialDashboardPage` - Dashboard financeiro

## 🔐 Segurança

- JWT armazenado em cookies httpOnly (gerenciado pelo backend)
- Axios configurado com `withCredentials: true`
- Interceptor para redirecionar para login em caso de 401
- Rotas protegidas com `ProtectedRoute`

## 📱 Responsividade

- Design responsivo com TailwindCSS
- Mobile-first approach
- Testado em Chrome, Firefox, Safari e Edge

## 🚧 Observações Importantes

1. **Backend Necessário**: O front-end está pronto mas precisa do backend implementado
2. **Imports**: Se houver problemas com imports relativos, usar aliases `@/` nos imports
3. **React Compiler**: Projeto usa React Compiler (Babel plugin)
4. **Mock Data**: Para testar sem backend, você pode criar mocks nas funções da API

## 📝 Próximos Passos

- Dashboard principal com resumo geral
- Integração com Booking.com API
- Importação de reservas via iCal (Airbnb)
- Gestão de extras/consumos
- Relatórios e exportação
- Perfil e configurações do usuário
- Multi-tenancy (gestão de múltiplas pousadas)

## 📄 Licença

Propriedade privada. Todos os direitos reservados.

