# DevInn - Planejamento de Issues

**Versão:** 1.0
**Data:** 12/01/2026
**Baseado em:** PRD v1.0

---

## Estrutura de Épicos

### 🏗️ Épico 1: Setup Inicial e Infraestrutura
### 🏨 Épico 2: Gestão de Inventário
### 📅 Épico 3: Mapa de Disponibilidade e Reservas
### 🔗 Épico 4: Integrações (Channel Manager)
### 💰 Épico 5: Módulo Financeiro
### 💵 Épico 6: Módulo de Precificação
### 🔄 Épico 7: Gestão do Ciclo de Vida da Reserva

---

## 🏗️ Épico 1: Setup Inicial e Infraestrutura

### Issue #1: Configurar Arquitetura Multi-tenant
**Prioridade:** 🔴 Crítica
**Complexidade:** 8 pontos
**Dependências:** Nenhuma

**Descrição:**
Implementar a arquitetura base do sistema com suporte multi-tenant, garantindo isolamento total de dados entre pousadas.

**Tarefas:**
- [ ] Definir estratégia de multi-tenancy (schema por tenant, row-level security)
- [ ] Criar entidade `Inn` (Pousada) com campos básicos
- [ ] Implementar middleware de tenant resolution
- [ ] Adicionar `inn_id` em todas as entidades do domínio
- [ ] Configurar políticas de Row-Level Security (se PostgreSQL)
- [ ] Implementar filtros automáticos de tenant em queries

**Critérios de Aceite:**
- ✅ Todas as entidades possuem `inn_id` obrigatório
- ✅ Queries automáticas filtram por tenant corrente
- ✅ Não é possível acessar dados de outras pousadas
- ✅ Teste de isolamento passa com sucesso

**Stack Técnica:**
- Backend: .NET Core / Entity Framework
- Banco: PostgreSQL com RLS

---

### Issue #2: Implementar Autenticação e Autorização
**Prioridade:** 🔴 Crítica
**Complexidade:** 5 pontos
**Dependências:** #1

**Descrição:**
Implementar sistema de autenticação com suporte a dois níveis de acesso: Super Admin (plataforma) e Admin da Pousada.

**Tarefas:**
- [ ] Configurar JWT Authentication
- [ ] Criar entidade `User` com roles (SuperAdmin, InnAdmin)
- [ ] Implementar endpoint de login/register
- [ ] Criar middleware de autorização por role
- [ ] Implementar refresh token
- [ ] Adicionar proteção de rotas no frontend

**Critérios de Aceite:**
- ✅ Super Admin pode acessar todas as pousadas
- ✅ Admin Pousada só acessa seus dados
- ✅ Tokens expiram e fazem refresh automático
- ✅ Rotas protegidas retornam 401/403 apropriadamente

---

### Issue #3: Configurar CI/CD e Ambientes
**Prioridade:** 🟡 Alta
**Complexidade:** 3 pontos
**Dependências:** #1

**Descrição:**
Configurar pipeline de CI/CD para deploy automatizado em ambientes de staging e produção.

**Tarefas:**
- [ ] Configurar GitHub Actions para backend (.NET)
- [ ] Configurar GitHub Actions para frontend (Next.js)
- [ ] Definir estratégia de versionamento (semver)
- [ ] Configurar ambientes (dev, staging, prod)
- [ ] Implementar testes automatizados no pipeline
- [ ] Configurar rollback automático em caso de falha

**Critérios de Aceite:**
- ✅ Push para `main` deploya em staging automaticamente
- ✅ Tag de release deploya em produção
- ✅ Testes quebrados bloqueiam deploy
- ✅ Rollback funciona em menos de 5 minutos

---

## 🏨 Épico 2: Gestão de Inventário

### Issue #4: RF01 - Cadastro de Categorias de Quartos
**Prioridade:** 🔴 Crítica
**Complexidade:** 3 pontos
**Dependências:** #1

**Descrição:**
Implementar CRUD de categorias de quartos (ex: Chalé Master, Quarto Família) com atributos de nome, capacidade e descrição.

**Tarefas:**
- [ ] Criar entidade `RoomCategory` (inn_id, name, capacity, description)
- [ ] Implementar endpoints REST (GET, POST, PUT, DELETE)
- [ ] Criar service layer com validações
- [ ] Implementar página de listagem de categorias
- [ ] Criar formulário modal de criação/edição
- [ ] Adicionar validação de capacidade (mínimo 1, máximo 10)

**Critérios de Aceite:**
- ✅ Admin pode criar categoria com nome, capacidade e descrição
- ✅ Capacidade deve ser número inteiro positivo
- ✅ Nome da categoria é obrigatório e único por pousada
- ✅ Listagem exibe todas as categorias da pousada
- ✅ Não é possível deletar categoria com quartos vinculados

**Regras de Negócio:**
- RN03: Multi-tenancy - `inn_id` obrigatório
- Capacidade mínima: 1 pessoa
- Nome único por pousada

---

### Issue #5: RF02 - Cadastro de Unidades (Quartos)
**Prioridade:** 🔴 Crítica
**Complexidade:** 5 pontos
**Dependências:** #4

**Descrição:**
Implementar cadastro de quartos físicos vinculados às categorias (ex: Chalé 01 → Categoria "Chalé Master").

**Tarefas:**
- [ ] Criar entidade `Room` (inn_id, category_id, number, name, active)
- [ ] Implementar endpoints REST completos
- [ ] Criar interface de listagem com agrupamento por categoria
- [ ] Implementar formulário de cadastro com seleção de categoria
- [ ] Adicionar toggle de ativo/inativo
- [ ] Implementar validação de número único por pousada

**Critérios de Aceite:**
- ✅ Quarto vinculado obrigatoriamente a uma categoria
- ✅ Número do quarto é único por pousada
- ✅ Quartos inativos não aparecem no calendário
- ✅ Interface mostra capacidade herdada da categoria
- ✅ Não é possível deletar quarto com reservas existentes

**Regras de Negócio:**
- Número do quarto único por `inn_id`
- Categoria obrigatória
- Status ativo/inativo para manutenção

---

## 📅 Épico 3: Mapa de Disponibilidade e Reservas

### Issue #6: RF04 - Visualização em Mapa de Gantt (Estrutura Base)
**Prioridade:** 🔴 Crítica
**Complexidade:** 13 pontos
**Dependências:** #5

**Descrição:**
Implementar estrutura base do calendário estilo Gantt com quartos no eixo Y e dias do mês no eixo X.

**Tarefas:**
- [ ] Criar componente `BookingCalendar` no Next.js
- [ ] Implementar grid responsivo (quartos × dias)
- [ ] Criar coluna fixa à esquerda com números dos quartos
- [ ] Implementar header com dias da semana
- [ ] Adicionar navegação mensal (anterior/próximo/hoje)
- [ ] Implementar destaque do dia atual
- [ ] Adicionar destaque de finais de semana
- [ ] Otimizar performance para 30+ quartos

**Critérios de Aceite:**
- ✅ Calendário carrega em menos de 2 segundos (RNF03)
- ✅ Coluna de quartos fixa no scroll horizontal
- ✅ Dia atual destacado com cor primária
- ✅ Finais de semana com background diferenciado
- ✅ Navegação mensal funcional
- ✅ Botão "Hoje" retorna ao mês atual

**Stack Técnica:**
- React + TypeScript
- CSS Grid para layout
- date-fns para manipulação de datas

---

### Issue #7: RF04 - Renderização de Barras de Reserva no Gantt
**Prioridade:** 🔴 Crítica
**Complexidade:** 8 pontos
**Dependências:** #6

**Descrição:**
Implementar renderização de barras horizontais representando períodos de reserva com informações visuais.

**Tarefas:**
- [ ] Criar componente `ReservationBar`
- [ ] Calcular posicionamento e largura das barras (span de dias)
- [ ] Implementar cores por status de pagamento (verde/amarelo/vermelho)
- [ ] Adicionar ícones de status (✓ pago, ⚠ parcial)
- [ ] Exibir nome do hóspede truncado
- [ ] Exibir valor total formatado (R$ X.XXX,XX)
- [ ] Implementar barras que estendem entre meses
- [ ] Adicionar tooltip com detalhes ao hover

**Critérios de Aceite:**
- ✅ Barra verde para reservas quitadas
- ✅ Barra amarela para pagamento parcial
- ✅ Barra vermelha para pagamento pendente
- ✅ Nome do hóspede visível na barra
- ✅ Tooltip mostra: nome completo, datas, valor total, status
- ✅ Barras se estendem corretamente entre meses
- ✅ Ícones de status visíveis

**Regras de Negócio:**
- RN07: Status de pagamento baseado em paidValue vs totalValue

---

### Issue #8: RF04 - Interatividade do Calendário
**Prioridade:** 🟡 Alta
**Complexidade:** 5 pontos
**Dependências:** #7

**Descrição:**
Implementar interações do usuário com o calendário (cliques em células e barras).

**Tarefas:**
- [ ] Implementar click em célula vazia → Abrir modal de nova reserva
- [ ] Pré-preencher quarto e data no formulário
- [ ] Implementar click em barra → Abrir modal de edição
- [ ] Carregar dados da reserva no formulário
- [ ] Adicionar feedback visual de hover
- [ ] Implementar cursor apropriado (pointer em áreas clicáveis)

**Critérios de Aceite:**
- ✅ Click em célula abre formulário com quarto/data preenchidos
- ✅ Click em barra abre formulário de edição com todos os dados
- ✅ Hover em célula vazia mostra cursor pointer
- ✅ Hover em barra mostra tooltip
- ✅ Modal fecha ao salvar ou cancelar

---

### Issue #9: RF05 - Formulário de Reserva Manual (Parte 1: Dados Básicos)
**Prioridade:** 🔴 Crítica
**Complexidade:** 8 pontos
**Dependências:** #5

**Descrição:**
Implementar formulário para criar reservas manuais com campos obrigatórios e opcionais.

**Tarefas:**
- [ ] Criar entidade `Reservation` no backend
- [ ] Implementar endpoints POST /reservations e PUT /reservations/:id
- [ ] Criar componente `BookingForm` modal
- [ ] Adicionar campos obrigatórios: nome, telefone, quarto, check-in, check-out
- [ ] Adicionar campos opcionais: email, documento, data nascimento, observações
- [ ] Implementar máscaras (telefone, CPF)
- [ ] Adicionar validação de campos obrigatórios

**Critérios de Aceite:**
- ✅ Campos obrigatórios não permitem salvar se vazios
- ✅ Telefone com máscara (XX) XXXXX-XXXX
- ✅ CPF com máscara XXX.XXX.XXX-XX
- ✅ Data de check-out > check-in (RN03)
- ✅ Modal fecha ao salvar com sucesso
- ✅ Mensagem de erro clara em caso de falha

**Regras de Negócio:**
- RN08: Dados mínimos obrigatórios
- RN09: Campos opcionais não bloqueiam criação

---

### Issue #10: RF05 - Validações em Tempo Real (Capacidade e Conflitos)
**Prioridade:** 🔴 Crítica
**Complexidade:** 8 pontos
**Dependências:** #9

**Descrição:**
Implementar validações de capacidade do quarto e detecção de conflitos de datas (overbooking).

**Tarefas:**
- [ ] Criar endpoint GET /rooms/:id/availability?from=X&to=Y
- [ ] Implementar lógica de detecção de conflitos no backend
- [ ] Validar capacidade total (adultos + crianças) vs capacidade do quarto
- [ ] Exibir alerta visual de conflito em tempo real
- [ ] Sugerir quartos disponíveis em caso de conflito
- [ ] Bloquear submit se houver conflito ou excesso de capacidade
- [ ] Adicionar exceção para edição (não conflitar consigo mesmo)

**Critérios de Aceite:**
- ✅ Sistema detecta overbooking antes de salvar
- ✅ Mensagem clara: "Quarto X já reservado de DD/MM a DD/MM"
- ✅ Sistema valida capacidade: adultos + crianças ≤ capacidade
- ✅ Sugestões de quartos disponíveis exibidas
- ✅ Ao editar, reserva não conflita consigo mesma
- ✅ Submit bloqueado enquanto houver conflito

**Regras de Negócio:**
- RN01: Limite de ocupação por quarto
- RN02: Prevenção de overbooking

---

### Issue #11: RF06 - Ficha FNRH Opcional
**Prioridade:** 🟢 Média
**Complexidade:** 3 pontos
**Dependências:** #9

**Descrição:**
Implementar campos opcionais da Ficha Nacional de Registro de Hóspedes (FNRH) que podem ser preenchidos posteriormente.

**Tarefas:**
- [ ] Adicionar campos à entidade Reservation: cpf, vehicle_plate
- [ ] Criar seção "Dados FNRH" no formulário (colapsável)
- [ ] Adicionar campo de placa de veículo
- [ ] Implementar validação opcional (só valida se preenchido)
- [ ] Adicionar botão "Preencher FNRH" na lista de hóspedes
- [ ] Permitir salvar reserva sem FNRH completo

**Critérios de Aceite:**
- ✅ Reserva pode ser criada sem dados FNRH
- ✅ Dados FNRH podem ser preenchidos posteriormente
- ✅ CPF validado apenas se preenchido
- ✅ Interface indica visualmente FNRH pendente
- ✅ FNRH completo tem indicador verde

---

## 🔗 Épico 4: Integrações (Channel Manager)

### Issue #12: RF07 - Integração Booking.com API (Setup e Autenticação)
**Prioridade:** 🟡 Alta
**Complexidade:** 8 pontos
**Dependências:** #1

**Descrição:**
Configurar infraestrutura de integração com Booking.com Connectivity API usando OAuth 2.0.

**Tarefas:**
- [ ] Criar entidade `BookingIntegration` (inn_id, hotel_id, client_id, etc)
- [ ] Implementar fluxo OAuth 2.0 com Booking.com
- [ ] Criar service `BookingApiClient` com refresh token automático
- [ ] Implementar endpoint de configuração POST /integrations/booking
- [ ] Adicionar criptografia para credentials (client_secret)
- [ ] Criar job de verificação de saúde da conexão

**Critérios de Aceite:**
- ✅ OAuth 2.0 funcional com Booking.com
- ✅ Tokens refresh automaticamente antes de expirar
- ✅ Credentials armazenadas de forma segura (criptografadas)
- ✅ Status de conexão verificável (conectado/erro)
- ✅ Logs de autenticação registrados

**Documentação:**
Ver: [INTEGRACAO-BOOKING.md](./INTEGRACAO-BOOKING.md)

---

### Issue #13: RF07 - Sincronização de Reservas Booking.com (Pull)
**Prioridade:** 🟡 Alta
**Complexidade:** 13 pontos
**Dependências:** #12, #9

**Descrição:**
Implementar sincronização automática de reservas do Booking.com via polling (a cada 10 minutos).

**Tarefas:**
- [ ] Criar endpoint no Booking API: GET /reservations
- [ ] Implementar job scheduled (Hangfire/Quartz) executando a cada 10min
- [ ] Mapear dados do Booking para entidade Reservation local
- [ ] Adicionar campo `source` (booking_api, manual, ical)
- [ ] Adicionar campo `external_id` para rastreamento
- [ ] Implementar lógica de upsert (criar se novo, atualizar se existente)
- [ ] Importar dados financeiros: valor bruto, comissão, valor líquido
- [ ] Adicionar campo `commission_amount` e `commission_percentage`
- [ ] Criar badge visual "Booking.com" na interface

**Critérios de Aceite:**
- ✅ Reservas do Booking sincronizam automaticamente a cada 10min
- ✅ Dados do hóspede importados: nome, telefone, email, documento
- ✅ Valores financeiros completos: bruto, comissão, líquido
- ✅ Reservas marcadas com origem "booking_api"
- ✅ Badge azul "Booking.com" visível no calendário
- ✅ Não cria duplicatas (usa external_id)
- ✅ Log de sincronização com timestamp e status

**Regras de Negócio:**
- Comissão Booking calculada e armazenada
- Status de pagamento sincronizado
- Data de repasse registrada

---

### Issue #14: RF07 - Webhooks Booking.com (Tempo Real)
**Prioridade:** 🟢 Média
**Complexidade:** 5 pontos
**Dependências:** #13

**Descrição:**
Implementar recebimento de webhooks do Booking.com para sincronização em tempo real.

**Tarefas:**
- [ ] Criar endpoint POST /webhooks/booking
- [ ] Implementar validação de assinatura do webhook
- [ ] Processar eventos: nova reserva, cancelamento, modificação
- [ ] Atualizar reserva local baseado no evento
- [ ] Adicionar retry logic para falhas
- [ ] Configurar URL do webhook no Booking.com

**Critérios de Aceite:**
- ✅ Webhook recebe notificações do Booking em tempo real
- ✅ Assinatura validada para segurança
- ✅ Reservas atualizadas instantaneamente
- ✅ Eventos de cancelamento processados
- ✅ Retry automático em caso de falha (3 tentativas)

---

### Issue #15: RF07A - Dashboard de Integração Booking.com
**Prioridade:** 🟢 Média
**Complexidade:** 5 pontos
**Dependências:** #13

**Descrição:**
Criar painel específico para análise financeira das reservas do Booking.com.

**Tarefas:**
- [ ] Criar página `/dashboard/booking-analytics`
- [ ] Implementar cards de métricas:
  - Receita bruta total (soma valor bruto)
  - Total de comissões pagas
  - Receita líquida (bruto - comissão)
  - Taxa média de comissão (%)
- [ ] Adicionar gráfico comparativo: Direto vs Booking vs Airbnb
- [ ] Implementar tooltip com breakdown de valores em cada reserva
- [ ] Adicionar filtro por período

**Critérios de Aceite:**
- ✅ Métricas calculadas corretamente
- ✅ Gráfico exibe comparativo de canais
- ✅ Tooltip mostra: valor bruto, comissão, líquido
- ✅ Filtro por período funcional
- ✅ Dashboard responsivo

---

### Issue #16: RF08 - Interface de Configuração de Integração Booking.com
**Prioridade:** 🟡 Alta
**Complexidade:** 5 pontos
**Dependências:** #12

**Descrição:**
Criar interface administrativa para configurar credenciais e mapeamento de quartos do Booking.com.

**Tarefas:**
- [ ] Criar página `/settings/integrations/booking`
- [ ] Adicionar formulário de configuração:
  - Hotel ID
  - Client ID e Client Secret
  - URL do webhook
  - Frequência de sincronização
- [ ] Implementar mapeamento de quartos (Room ID Booking → Quarto Local)
- [ ] Adicionar botão "Testar Conexão"
- [ ] Adicionar botão "Sincronizar Agora"
- [ ] Exibir log de sincronizações (últimas 50)
- [ ] Exibir status de saúde da integração (verde/vermelho)

**Critérios de Aceite:**
- ✅ Admin pode configurar credenciais
- ✅ Teste de conexão valida credenciais
- ✅ Mapeamento de quartos funcional
- ✅ Sincronização manual dispara job imediatamente
- ✅ Log exibe horário, status (sucesso/erro), quantidade de reservas
- ✅ Status de saúde atualiza em tempo real

---

### Issue #17: RF09 - Importação iCal (Airbnb)
**Prioridade:** 🟢 Média
**Complexidade:** 5 pontos
**Dependências:** #5

**Descrição:**
Implementar importação de calendários iCal externos (Airbnb) para bloqueio automático de datas.

**Tarefas:**
- [ ] Criar entidade `ICalIntegration` (inn_id, room_id, ical_url)
- [ ] Implementar parser de iCal (biblioteca ical.net ou similar)
- [ ] Criar job scheduled executando a cada 30 minutos
- [ ] Extrair eventos do iCal (summary, dtstart, dtend)
- [ ] Criar reservas de bloqueio (source: ical, read-only)
- [ ] Adicionar interface de configuração de URLs iCal por quarto
- [ ] Marcar visualmente reservas iCal no calendário

**Critérios de Aceite:**
- ✅ URLs iCal podem ser configuradas por quarto
- ✅ Sincronização a cada 30 minutos
- ✅ Datas bloqueadas automaticamente
- ✅ Reservas iCal são read-only (não editáveis)
- ✅ Badge "Airbnb" visível no calendário
- ✅ Não cria duplicatas

**Limitações:**
- Apenas bloqueio de datas (sem valores financeiros)
- Hóspede exibido como "Reserva Airbnb"

---

## 💰 Épico 5: Módulo Financeiro

### Issue #18: RF10 - Ponto de Venda (Extras)
**Prioridade:** 🟡 Alta
**Complexidade:** 8 pontos
**Dependências:** #9

**Descrição:**
Implementar funcionalidade de adicionar consumos extras (café da manhã, passeios, frigobar) à conta da reserva.

**Tarefas:**
- [ ] Criar entidade `Extra` (reservation_id, description, amount, date)
- [ ] Implementar endpoints POST /reservations/:id/extras
- [ ] Criar modal "Adicionar Extra" no painel da reserva
- [ ] Adicionar lista de extras na reserva
- [ ] Calcular `totalValue` automaticamente (diárias + extras)
- [ ] Implementar edição/exclusão de extras
- [ ] Adicionar campo de categoria de extra (Alimentação, Passeio, etc)

**Critérios de Aceite:**
- ✅ Admin pode adicionar extra com descrição e valor
- ✅ Extras aparecem listados na reserva
- ✅ Valor total recalcula automaticamente
- ✅ Extras podem ser editados/excluídos
- ✅ Data do lançamento registrada
- ✅ Breakdown de valores exibe extras separadamente

---

### Issue #19: RF11 - Fluxo de Caixa (Lançamento de Despesas)
**Prioridade:** 🟡 Alta
**Complexidade:** 5 pontos
**Dependências:** #1

**Descrição:**
Implementar CRUD de despesas da pousada (luz, manutenção, comissões) para controle financeiro.

**Tarefas:**
- [ ] Criar entidade `Expense` (inn_id, description, amount, category, date)
- [ ] Implementar endpoints REST completos
- [ ] Criar página `/financial/expenses`
- [ ] Adicionar formulário de lançamento de despesa
- [ ] Implementar categorização (dropdown com categorias)
- [ ] Adicionar edição inline de despesas
- [ ] Implementar filtro por categoria e período

**Critérios de Aceite:**
- ✅ Admin pode lançar despesas com descrição, valor, categoria e data
- ✅ Categorias padrão: Água, Energia, Internet, Funcionários, Manutenção, Limpeza, Alimentação, Marketing, Impostos, Comissões OTA, Outros
- ✅ Despesas listadas ordenadas por data (mais recente primeiro)
- ✅ Edição inline funcional
- ✅ Exclusão com confirmação
- ✅ Filtros funcionais

---

### Issue #20: RF12 - Registro de Pagamentos
**Prioridade:** 🔴 Crítica
**Complexidade:** 8 pontos
**Dependências:** #9

**Descrição:**
Implementar funcionalidade de registrar pagamentos parciais/totais de reservas com método de pagamento.

**Tarefas:**
- [ ] Criar entidade `Payment` (reservation_id, amount, method, date)
- [ ] Implementar endpoints POST /reservations/:id/payments
- [ ] Criar modal "Registrar Pagamento"
- [ ] Adicionar campos: valor, método (PIX/Dinheiro/Cartão), data
- [ ] Calcular `paidValue` automaticamente (soma de payments)
- [ ] Atualizar status de pagamento (Pendente/Parcial/Quitado)
- [ ] Exibir lista de pagamentos na reserva
- [ ] Mostrar saldo devedor (totalValue - paidValue)

**Critérios de Aceite:**
- ✅ Admin pode registrar múltiplos pagamentos para uma reserva
- ✅ Status de pagamento atualiza automaticamente (RN07)
- ✅ Saldo devedor exibido claramente
- ✅ Métodos disponíveis: PIX, Dinheiro, Cartão de Crédito, Cartão de Débito
- ✅ Histórico de pagamentos visível
- ✅ Soma de pagamentos = paidValue

**Regras de Negócio:**
- RN07: Status calculado automaticamente
- Permitir pagamentos que excedam o total (troco calculado)

---

### Issue #21: RF13 - Gestão de Cancelamentos
**Prioridade:** 🟡 Alta
**Complexidade:** 3 pontos
**Dependências:** #9, #20

**Descrição:**
Implementar funcionalidade de cancelar reservas com registro de multa.

**Tarefas:**
- [ ] Adicionar status "Cancelada" à reserva
- [ ] Criar modal "Cancelar Reserva"
- [ ] Adicionar campo para valor de multa
- [ ] Adicionar campo para motivo do cancelamento
- [ ] Lançar multa como receita automaticamente
- [ ] Marcar reserva como cancelada (não exclui)
- [ ] Adicionar filtro de canceladas na lista

**Critérios de Aceite:**
- ✅ Admin pode cancelar reserva
- ✅ Campo de multa opcional (padrão R$ 0,00)
- ✅ Motivo do cancelamento registrado
- ✅ Reserva cancelada não aparece no calendário principal
- ✅ Multa lançada como receita se > 0
- ✅ Histórico de cancelamentos acessível

---

### Issue #22: RF14 - Dashboard Financeiro (Métricas)
**Prioridade:** 🔴 Crítica
**Complexidade:** 13 pontos
**Dependências:** #18, #19, #20

**Descrição:**
Criar dashboard financeiro com visão consolidada de receitas, despesas e balanço mensal.

**Tarefas:**
- [ ] Criar página `/dashboard/financial`
- [ ] Implementar navegação mensal (anterior/próximo)
- [ ] Criar cards de métricas:
  - Receita Total (soma de reservas + extras do período)
  - Receita Recebida (soma de paidValue)
  - Receita Pendente (totalValue - paidValue)
  - Total de Despesas
  - Balanço Real (Recebida - Despesas)
  - Balanço Projetado (Total - Despesas)
  - Comissões de OTAs
- [ ] Implementar filtro automático por período (RF16)
- [ ] Adicionar indicadores visuais com cores (RF17)
- [ ] Criar gráfico de evolução mensal

**Critérios de Aceite:**
- ✅ Todas as métricas calculadas corretamente
- ✅ Filtro por mês funcional
- ✅ Cards verde para balanço positivo, vermelho para negativo
- ✅ Reservas filtradas por check-in/out dentro do mês (RF16)
- ✅ Despesas filtradas por data de lançamento
- ✅ Gráfico exibe últimos 12 meses
- ✅ Dashboard responsivo

**Regras de Negócio:**
- RN05: Valores com 2 casas decimais
- RF16: Critério temporal de filtragem

---

### Issue #23: RF15 - Categorização e Totalização de Despesas
**Prioridade:** 🟡 Alta
**Complexidade:** 5 pontos
**Dependências:** #19, #22

**Descrição:**
Adicionar totalizadores de despesas por categoria no dashboard financeiro.

**Tarefas:**
- [ ] Criar componente "Despesas por Categoria"
- [ ] Implementar endpoint GET /expenses/summary?month=X&year=Y
- [ ] Agrupar despesas por categoria
- [ ] Exibir total por categoria
- [ ] Adicionar gráfico de pizza/barras
- [ ] Destacar categoria com maior gasto

**Critérios de Aceite:**
- ✅ Dashboard exibe total por categoria
- ✅ Categorias sem despesas não aparecem
- ✅ Gráfico visual facilita interpretação
- ✅ Click na categoria filtra lista de despesas
- ✅ Total geral confere com soma das categorias

---

### Issue #24: Lançamento Automático de Comissões OTA
**Prioridade:** 🟢 Média
**Complexidade:** 3 pontos
**Dependências:** #13, #19

**Descrição:**
Automatizar lançamento de comissões do Booking.com como despesa ao confirmar pagamento.

**Tarefas:**
- [ ] Criar listener de evento `PaymentConfirmed`
- [ ] Verificar se reserva é de origem `booking_api`
- [ ] Lançar despesa automática categoria "Comissões OTA"
- [ ] Descrição: "Comissão Booking.com - Reserva #XXX"
- [ ] Valor = `commission_amount`
- [ ] Data = data do pagamento

**Critérios de Aceite:**
- ✅ Comissão lançada automaticamente ao confirmar pagamento
- ✅ Despesa vinculada à reserva
- ✅ Categoria "Comissões OTA" automaticamente selecionada
- ✅ Descrição auto-gerada com número da reserva
- ✅ Não lança duplicata se já existir

---

## 💵 Épico 6: Módulo de Precificação

### Issue #25: RF17 - Tabela de Preços por Categoria
**Prioridade:** 🔴 Crítica
**Complexidade:** 5 pontos
**Dependências:** #4

**Descrição:**
Implementar configuração de preços base diferenciados por categoria de quarto.

**Tarefas:**
- [ ] Adicionar campos à entidade `RoomCategory`:
  - base_price (Decimal)
  - extra_person_price (Decimal)
- [ ] Criar página `/settings/pricing`
- [ ] Listar categorias com campos editáveis inline
- [ ] Implementar validação: preços > 0
- [ ] Adicionar histórico de alterações de preço (audit log)
- [ ] Exibir capacidade base (2 adultos) no formulário

**Critérios de Aceite:**
- ✅ Admin pode configurar preço base por categoria
- ✅ Admin pode configurar preço de pessoa adicional
- ✅ Preços devem ser maiores que zero
- ✅ Alterações salvas e aplicadas imediatamente
- ✅ Histórico de preços acessível
- ✅ Valores exibidos em formato monetário brasileiro

**Regras de Negócio:**
- RN04: Preço base inclui 2 adultos
- RN05: 2 casas decimais

---

### Issue #26: RF18 - Cálculo de Pessoa Adicional
**Prioridade:** 🔴 Crítica
**Complexidade:** 3 pontos
**Dependências:** #25

**Descrição:**
Implementar lógica de cálculo de valores incrementais para adultos adicionais (a partir do 3º).

**Tarefas:**
- [ ] Adicionar campo `adults_count` à reserva
- [ ] Implementar função `calculateExtraAdultsCharge()`
- [ ] Regra: Se adultos > 2, então (adultos - 2) × extra_person_price
- [ ] Aplicar valor extra por noite
- [ ] Exibir breakdown no formulário

**Critérios de Aceite:**
- ✅ 2 adultos ou menos: sem cobrança extra
- ✅ 3+ adultos: cobra valor adicional por pessoa
- ✅ Valor calculado por noite
- ✅ Breakdown exibe: "2 adultos inclusos + X extras"
- ✅ Recalcula em tempo real ao alterar quantidade

**Regras de Negócio:**
- RN04: Base = 2 adultos inclusos

---

### Issue #27: RF19 - Política de Gratuidades e Descontos Infantis
**Prioridade:** 🔴 Crítica
**Complexidade:** 8 pontos
**Dependências:** #25

**Descrição:**
Implementar sistema de cobrança diferenciada por faixa etária de crianças.

**Tarefas:**
- [ ] Criar entidade `Guest` (reservation_id, name, age, guest_type)
- [ ] Adicionar campo array `children_ages` à reserva
- [ ] Implementar função `calculateChildrenCharge(ages[])`
- [ ] Regras:
  - 0-4 anos: R$ 0,00
  - 5-10 anos: 50% de extra_person_price
  - 11+ anos: 100% de extra_person_price
- [ ] Adicionar interface para informar idade de cada criança
- [ ] Exibir breakdown por criança

**Critérios de Aceite:**
- ✅ 0-4 anos: gratuito
- ✅ 5-10 anos: 50% do valor de pessoa adicional
- ✅ 11+ anos: valor integral de pessoa adicional
- ✅ Idade obrigatória para cada criança
- ✅ Breakdown exibe: "Criança 1 (6 anos): R$ X"
- ✅ Total recalcula automaticamente

**Regras de Negócio:**
- RF19: Faixas etárias definidas
- Idades informadas individualmente

---

### Issue #28: RF20 - Cálculo Automático de Diárias
**Prioridade:** 🔴 Crítica
**Complexidade:** 5 pontos
**Dependências:** #26, #27

**Descrição:**
Implementar cálculo completo e automático do valor total da reserva.

**Tarefas:**
- [ ] Criar função `calculateTotalValue(reservation)`
- [ ] Fórmula: (BasePrice + ExtrasAdults + Σ Children) × Nights
- [ ] Implementar recálculo em tempo real no formulário
- [ ] Atualizar `totalValue` ao salvar reserva
- [ ] Adicionar debounce para performance
- [ ] Validar cálculo no backend antes de salvar

**Critérios de Aceite:**
- ✅ Valor recalcula ao alterar qualquer parâmetro:
  - Categoria do quarto
  - Datas (check-in/out)
  - Número de adultos
  - Idades das crianças
- ✅ Cálculo no frontend = cálculo no backend
- ✅ Valor salvo na reserva (não recalculado depois)
- ✅ Performance: recalcula em < 200ms

**Regras de Negócio:**
- RN04: Fórmula completa aplicada
- Valor persistido (não dinâmico após salvar)

---

### Issue #29: RF21 - Breakdown Transparente de Precificação
**Prioridade:** 🟡 Alta
**Complexidade:** 5 pontos
**Dependências:** #28

**Descrição:**
Criar componente visual que exibe detalhamento completo do cálculo da diária.

**Tarefas:**
- [ ] Criar componente `PricingBreakdown`
- [ ] Exibir linha por linha:
  - Preço base da categoria (2 adultos inclusos)
  - X adultos extras × R$ Y = R$ Z
  - Criança 1 (idade X) × R$ Y = R$ Z
  - Criança 2 (idade X) × R$ Y = R$ Z
  - Subtotal diário
  - Número de noites
  - **Valor Total**
- [ ] Adicionar ao formulário de reserva
- [ ] Adicionar ao painel de detalhes do hóspede
- [ ] Styling com destaque no total

**Critérios de Aceite:**
- ✅ Breakdown exibe todas as parcelas do cálculo
- ✅ Valores formatados em R$ X.XXX,XX
- ✅ Subtotal diário calculado corretamente
- ✅ Total final destacado visualmente
- ✅ Componente reutilizável
- ✅ Responsivo

---

## 🔄 Épico 7: Gestão do Ciclo de Vida da Reserva

### Issue #30: RF22 - Status Automático de Reserva
**Prioridade:** 🔴 Crítica
**Complexidade:** 5 pontos
**Dependências:** #9

**Descrição:**
Implementar cálculo automático do status da reserva baseado na data atual.

**Tarefas:**
- [ ] Adicionar enum `ReservationStatus` (Agendada, Hospedado, Concluída, Cancelada)
- [ ] Criar computed property/getter `currentStatus`
- [ ] Lógica:
  - hoje < checkIn → Agendada
  - checkIn ≤ hoje < checkOut → Hospedado
  - hoje ≥ checkOut → Concluída
  - manual → Cancelada
- [ ] Exibir badges com cores distintas
- [ ] Implementar filtro por status na lista

**Critérios de Aceite:**
- ✅ Status calculado automaticamente (não armazenado)
- ✅ Badges coloridos: Azul (Agendada), Verde (Hospedado), Cinza (Concluída), Vermelho (Cancelada)
- ✅ Filtro por status funcional
- ✅ Transição automática à meia-noite
- ✅ Status "Cancelada" é permanente (manual)

**Regras de Negócio:**
- RN06: Transição automática de status

---

### Issue #31: RF23 - Indicadores Visuais de Status de Pagamento
**Prioridade:** 🟡 Alta
**Complexidade:** 3 pontos
**Dependências:** #20, #30

**Descrição:**
Implementar sistema de indicadores visuais tricotômicos para status de pagamento.

**Tarefas:**
- [ ] Criar computed property `paymentStatus`
- [ ] Lógica:
  - paidValue = 0 → Pendente (vermelho)
  - 0 < paidValue < totalValue → Parcial (amarelo)
  - paidValue ≥ totalValue → Quitado (verde)
- [ ] Criar badges com ícones:
  - 🔴 Pendente
  - 🟡 Parcial
  - 🟢 Quitado
- [ ] Aplicar cores nas barras do calendário
- [ ] Exibir ícones nas barras (✓ pago, ⚠ parcial)

**Critérios de Aceite:**
- ✅ Badge vermelho para pagamento pendente
- ✅ Badge amarelo para pagamento parcial
- ✅ Badge verde para pagamento quitado
- ✅ Cores aplicadas no calendário (barras)
- ✅ Ícones visíveis nas barras
- ✅ Transição automática ao registrar pagamento

**Regras de Negócio:**
- RN07: Cálculo de status de pagamento

---

### Issue #32: RF24 - Painel de Detalhes do Hóspede
**Prioridade:** 🟡 Alta
**Complexidade:** 8 pontos
**Dependências:** #9, #18, #20, #29, #30, #31

**Descrição:**
Criar painel consolidado com todas as informações da reserva e hóspede.

**Tarefas:**
- [ ] Criar página `/reservations/:id`
- [ ] Seção 1: Dados Pessoais
  - Nome, telefone, email, documento, data nascimento
- [ ] Seção 2: Detalhes da Reserva
  - Quarto, check-in/out, número de noites
  - Composição: X adultos + Y crianças (idades)
  - Status da reserva e status de pagamento
- [ ] Seção 3: Breakdown Financeiro
  - Componente PricingBreakdown
  - Lista de extras
  - Lista de pagamentos
  - Saldo devedor
- [ ] Seção 4: Observações e Notas
- [ ] Botões de ação: Adicionar Extra, Registrar Pagamento, Cancelar

**Critérios de Aceite:**
- ✅ Todas as informações organizadas em seções
- ✅ Breakdown financeiro completo e transparente
- ✅ Histórico de pagamentos e extras visível
- ✅ Saldo devedor destacado se > 0
- ✅ Botões de ação funcionais
- ✅ Layout responsivo

---

### Issue #33: RF25 - Lista Ordenada de Hóspedes
**Prioridade:** 🟡 Alta
**Complexidade:** 5 pontos
**Dependências:** #9, #30, #31

**Descrição:**
Criar lista de todas as reservas ordenada cronologicamente com filtros.

**Tarefas:**
- [ ] Criar página `/reservations`
- [ ] Listar reservas ordenadas por check-in (próxima primeiro)
- [ ] Exibir: nome, quarto, check-in/out, status reserva, status pagamento
- [ ] Implementar filtros:
  - Todas
  - Agendadas
  - Hospedados
  - Concluídas
  - Canceladas
- [ ] Adicionar busca por nome do hóspede
- [ ] Implementar paginação (20 por página)
- [ ] Click na linha → abrir painel de detalhes

**Critérios de Aceite:**
- ✅ Reservas ordenadas por check-in ascendente
- ✅ Filtros funcionais
- ✅ Busca filtra em tempo real
- ✅ Paginação funcional
- ✅ Status visuais (badges coloridos)
- ✅ Click abre detalhes da reserva
- ✅ Responsivo (tabela → cards em mobile)

---

## 📊 Métricas de Sucesso do MVP

### Issue #34: Implementar Analytics e Métricas de Uso
**Prioridade:** 🟢 Baixa
**Complexidade:** 3 pontos
**Dependências:** Todas as issues anteriores

**Descrição:**
Configurar sistema de analytics para rastrear uso e validar hipóteses do produto.

**Tarefas:**
- [ ] Integrar ferramenta de analytics (Mixpanel/Amplitude)
- [ ] Rastrear eventos-chave:
  - Reserva criada (manual vs importada)
  - Pagamento registrado
  - Extras adicionados
  - Sincronização de OTAs
  - Dashboard financeiro acessado
- [ ] Criar dashboard interno de métricas para Super Admin
- [ ] Implementar GDPR compliance (opt-out)

**Critérios de Aceite:**
- ✅ Eventos rastreados sem afetar performance
- ✅ Dashboard exibe métricas de uso
- ✅ Compliance com LGPD/GDPR

---

## 🎯 Ordem de Implementação Sugerida (MVP)

**Sprint 1 - Fundação (Issues #1-3):**
- Setup multi-tenant
- Autenticação
- CI/CD

**Sprint 2 - Inventário (Issues #4-5):**
- Categorias
- Quartos

**Sprint 3 - Calendário Base (Issues #6-8):**
- Gantt estrutura
- Barras de reserva
- Interatividade

**Sprint 4 - Reservas (Issues #9-11):**
- Formulário básico
- Validações
- FNRH opcional

**Sprint 5 - Precificação (Issues #25-29):**
- Preços por categoria
- Cálculo de adultos/crianças
- Breakdown transparente

**Sprint 6 - Ciclo de Vida (Issues #30-33):**
- Status automático
- Painel de detalhes
- Lista de hóspedes

**Sprint 7 - Financeiro (Issues #18-24):**
- Extras
- Despesas
- Pagamentos
- Dashboard

**Sprint 8 - Integrações (Issues #12-17):**
- Booking.com setup
- Sincronização
- Dashboard Booking
- iCal Airbnb

**Sprint 9 - Refinamento e Testes:**
- Testes E2E
- Correções de bugs
- Performance

---

## 📝 Template de Issue para GitHub

```markdown
## Descrição
[Descrição detalhada da issue]

## Tarefas
- [ ] Tarefa 1
- [ ] Tarefa 2

## Critérios de Aceite
- [ ] Critério 1
- [ ] Critério 2

## Regras de Negócio
- RN0X: Descrição da regra

## Dependências
- #X - Issue dependente

## Complexidade
X pontos

## Labels
`feature`, `backend`, `frontend`, `crítico`, `épico-X`
```

---

**Próximos Passos:**
1. Revisar e aprovar este planejamento
2. Criar issues no GitHub usando o template acima
3. Estimar pontos de complexidade com a equipe
4. Definir sprints e roadmap
5. Iniciar desenvolvimento pelo Sprint 1
