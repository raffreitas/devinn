# DevInn - Front-end

Sistema de gestão de hospedagem (PMS) desenvolvido com React + TypeScript.

## 🚀 Tecnologias Utilizadas

- **React 19** com TypeScript
- **Vite** para build e dev server
- **TailwindCSS 4** para estilização
- **ShadcnUI** para componentes
- **React Router DOM** para roteamento
- **React Query** para gerenciamento de estado assíncrono
- **React Hook Form + Zod** para formulários e validação
- **Axios** para requisições HTTP
- **date-fns** para manipulação de datas
- **Lucide React** para ícones

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── layouts/          # Layouts da aplicação
│   └── ui/              # Componentes do ShadcnUI
├── features/            # Features organizadas por domínio
│   ├── auth/           # Autenticação
│   ├── rooms/          # Gestão de quartos e categorias
│   ├── bookings/       # Gestão de reservas
│   ├── availability/   # Mapa de disponibilidade (Gantt)
│   └── financial/      # Dashboard financeiro e despesas
├── lib/                # Utilitários e configurações
├── providers/          # Providers (React Query, Auth)
├── types/              # Tipos TypeScript globais
└── app.tsx             # Configuração de rotas
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- Login com JWT via cookies httpOnly
- Context de autenticação
- Rotas protegidas
- Logout

### ✅ Gestão de Quartos
- CRUD completo de categorias de quartos
- CRUD completo de quartos/unidades
- Vinculação de quartos a categorias
- Configuração de capacidade e preços
- Status de quartos (ativo, manutenção, inativo)

### ✅ Gestão de Reservas
- Formulário completo com validações
- Cálculo automático de valores com:
  - Preço base (2 adultos)
  - Pessoas extras
  - Descontos por idade (0-4 anos gratuito, 5-10 anos 50%, 11+ integral)
- Listagem com filtros por status
- Detalhes da reserva
- Adicionar pagamentos parciais
- Cancelamento de reservas
- Status automático (agendada, hospedado, concluída)
- Status de pagamento (pendente, parcial, pago)

### ✅ Mapa de Disponibilidade (Gantt)
- Visualização mensal em formato de calendário
- Grid de dias com destaque:
  - Dia atual
  - Finais de semana
- Barras de reservas coloridas por status de pagamento:
  - Verde: Pago
  - Amarelo: Parcial
  - Vermelho: Pendente
- Interatividade:
  - Click em célula vazia: Nova reserva
  - Click em barra: Detalhes da reserva
- Tooltips com informações
- Navegação mensal

### ✅ Dashboard Financeiro
- Métricas consolidadas:
  - Receita total
  - Receita recebida
  - Receita pendente
  - Total de despesas
  - Balanço real
  - Balanço projetado
  - Comissões OTA
- Despesas por categoria com gráficos
- CRUD completo de despesas
- Alertas de pagamentos pendentes
- Navegação mensal
- Filtros por período

## 🔧 Configuração

### Pré-requisitos
- Node.js 18+
- pnpm

### Instalação

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com a URL da sua API

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:3000/api
```

## 📋 Endpoints da API Esperados

O front-end espera os seguintes endpoints no backend:

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

