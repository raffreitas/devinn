# PRD - Sistema de Gestão de Hospedagem (DevInn SaaS)

**Versão:** 1.0
**Status:** Aprovado
**Responsável:** Especialista em Produto

---

## 1. Visão Geral do Produto
O **DevInn** é uma plataforma SaaS (Software as a Service) de gestão de propriedades (PMS) projetada para proprietários de pousadas que precisam centralizar operações dispersas. O sistema permite a gestão de inventário por categorias, visualização de disponibilidade via mapa (Gantt), integração com canais de venda externos (Booking/Airbnb) e controle financeiro de receitas e despesas.

### 1.1 Problema
Atualmente, a gestão é feita de forma fragmentada, sem um controle centralizado de ocupação, o que gera riscos de overbooking e falta de clareza sobre a saúde financeira (lucro líquido real após taxas).

### 1.2 Objetivos Estratégicos
* **Centralizar:** Unificar reservas diretas (WhatsApp/Balcão) e OTAs em um único calendário.
* **Profissionalizar o Financeiro:** Controlar não apenas as diárias, mas o consumo extra e despesas fixas.
* **Escalabilidade:** Permitir que o sistema aceite múltiplas pousadas com isolamento total de dados.

---

## 2. Personas
1.  **Super Admin (Plataforma):** Gestor do software. Visualiza métricas de crescimento do SaaS e gerencia o cadastro de novas pousadas.
2.  **Admin da Pousada:** Dono ou gerente da unidade. Tem acesso total aos dados financeiros, inventário e relatórios da sua pousada específica.

---

## 3. Requisitos Funcionais

### 3.1 Gestão de Inventário (Configurações)
* **RF01 - Cadastro de Categorias:** O sistema deve permitir criar categorias de quartos (ex: Chalé Master, Quarto Família).
    * *Atributos:* Nome, capacidade (2, 3, 5 pessoas), descrição.
* **RF02 - Cadastro de Unidades:** Vincular quartos físicos às categorias (ex: Chalé 01 vinculado à Categoria "Chalé Master").
* **RF03 - Multi-tenancy:** Toda entidade no banco de dados deve estar atrelada a um `inn_id`.

### 3.2 Mapa de Disponibilidade e Reservas
* **RF04 - Visualização em Mapa de Gantt Interativo:** Interface de calendário estilo Booking.com onde o eixo Y são os quartos e o eixo X os dias do mês.
    * *Layout:*
        * Coluna fixa à esquerda com números dos quartos e capacidade
        * Grid de células representando dias do mês
        * Barras horizontais coloridas representando períodos de reserva
    * *Navegação:*
        * Botões de navegação mensal (anterior/próximo)
        * Botão "Hoje" para retornar ao mês atual rapidamente
        * Exibição do mês e ano atual no centro
    * *Indicadores Visuais:*
        * Header com dias da semana abreviados
        * Destaque do dia atual com cor primária
        * Destaque de finais de semana com fundo diferenciado
        * Cores de barras por status de pagamento:
            * Verde: Pagamento quitado
            * Amarelo: Pagamento parcial
            * Vermelho: Pagamento pendente
        * Ícones nas barras indicando status (✓ pago, ⚠ parcial)
    * *Interatividade:*
        * Click em célula vazia: Abre formulário de nova reserva com quarto e data pré-preenchidos
        * Click em barra de reserva: Abre formulário de edição da reserva
        * Hover em barra: Exibe tooltip com nome do hóspede e valores
        * Barras se estendem corretamente entre meses (corte visual nas bordas)
    * *Informações nas Barras:*
        * Nome do hóspede (truncado se necessário)
        * Valor total da reserva formatado em moeda
        * Indicador visual de pagamento
* **RF05 - Reserva Manual:** Fluxo para registrar reservas que chegam via WhatsApp/Telefone.
    * *Campos obrigatórios:* Nome do hóspede, telefone, quarto, check-in, check-out
    * *Campos opcionais:* Email, documento, data de nascimento, observações
    * *Validações em tempo real:* Capacidade, conflito de datas, cálculo automático de valores
* **RF06 - FNRH Opcional:** Ficha de hóspede com dados (CPF, Nome, Veículo) que pode ser preenchida no check-in ou ignorada.
    * *Flexibilidade:* Sistema não bloqueia criação de reserva sem dados completos da FNRH

### 3.3 Integrações (Channel Manager Lite)

> **📘 Documentação Técnica Detalhada:** [Especificação de Integração Booking.com](./INTEGRACAO-BOOKING.md)

* **RF07 - Integração Booking.com API:** Sincronização de reservas via Booking.com Connectivity API com importação de dados financeiros completos.
    * *Funcionalidades principais:*
        * Sincronização automática de novas reservas (pull + webhook)
        * Importação de dados do hóspede (nome, telefone, email, documento)
        * Importação de valores financeiros:
            * **Valor Bruto:** Valor total cobrado do hóspede
            * **Comissão Booking.com:** Taxa percentual e valor absoluto cobrado pela plataforma
            * **Valor Líquido:** Valor que a pousada efetivamente receberá
        * Rastreamento de status de pagamento (pendente, pago, reembolsado)
        * Data prevista de repasse do Booking.com
        * Método de coleta (Booking.com coleta ou propriedade coleta)
    * *Sincronização:* A cada 10 minutos (pull) + tempo real (webhooks)
    * *Identificação:* Reservas marcadas com origem "booking_api" e badge visual

* **RF07A - Dashboard de Integração Booking.com:** Painel específico para análise financeira das reservas do Booking.
    * *Métricas específicas:*
        * Receita bruta total (valor cobrado dos hóspedes)
        * Total de comissões pagas ao Booking.com
        * Receita líquida (após comissões)
        * Taxa média de comissão
        * Comparativo de receitas por canal (Direto vs Booking vs Airbnb)
    * *Visualizações:*
        * Tooltip detalhado em cada reserva mostrando breakdown de valores
        * Card no dashboard financeiro com métricas do Booking.com
        * Gráfico comparativo de receitas por canal

* **RF08 - Configuração de Integração Booking.com:** Interface administrativa para gerenciar credenciais e sincronização.
    * *Campos de configuração:*
        * Hotel ID no Booking.com
        * Credenciais OAuth (Client ID e Client Secret)
        * URL do webhook para notificações em tempo real
        * Frequência de sincronização
        * Mapeamento de quartos (Room ID Booking → Quarto Local)
    * *Funcionalidades:*
        * Testar conexão
        * Sincronizar agora (manual)
        * Log de sincronizações (sucesso/erro)
        * Status de saúde da integração

* **RF09 - Importação iCal (Airbnb):** Leitura de calendários externos para bloqueio automático de datas e prevenção de overbooking.
    * *Limitação:* Apenas bloqueio de datas (sem valores financeiros detalhados)
    * *Sincronização:* A cada 30 minutos

### 3.4 Módulo Financeiro
* **RF10 - Ponto de Venda (Extras):** Adicionar consumos (café da manhã, passeios, frigobar) à conta da reserva.
* **RF11 - Fluxo de Caixa:** Lançamento de despesas (luz, manutenção, comissões) e receitas.
* **RF12 - Registro de Pagamentos:** Marcação manual de status de pagamento (Pendente, Pago Parcial, Pago Total) e método (PIX, Dinheiro, Cartão).
* **RF13 - Gestão de Cancelamentos:** Alteração de status da reserva com campo para inserção manual de multa por cancelamento.

#### 3.4.1 Dashboard Financeiro
* **RF14 - Visão Consolidada por Período:** O sistema deve exibir métricas financeiras consolidadas com navegação mensal (mês anterior/próximo).
    * *Métricas obrigatórias:*
        * Receita Total (soma de todas as diárias e extras do período)
        * Receita Recebida (valores efetivamente pagos)
        * Receita Pendente (saldo a receber)
        * Total de Despesas (soma das despesas do período)
        * Balanço Real (Receita Recebida - Despesas)
        * Balanço Projetado (Receita Total - Despesas)
        * **Comissões de OTAs** (soma das comissões pagas ao Booking.com e outras plataformas)
* **RF15 - Categorização de Despesas:** O sistema deve permitir categorizar despesas em grupos pré-definidos e exibir totalizadores por categoria.
    * *Categorias padrão:* Água, Energia, Internet, Funcionários, Manutenção, Limpeza, Alimentação, Marketing, Impostos, **Comissões OTA**, Outros
    * *Funcionalidades:* CRUD completo de despesas, edição inline, filtro por categoria
    * *Observação:* Comissões do Booking.com são lançadas automaticamente como despesa ao confirmar pagamento
* **RF16 - Filtro Temporal Automático:** O dashboard deve filtrar automaticamente receitas e despesas baseado no período selecionado.
    * *Critério para receitas:* Reservas cujo check-in ou check-out ocorram dentro do mês selecionado
    * *Critério para despesas:* Despesas cuja data de lançamento esteja dentro do mês selecionado
* **RF17 - Indicadores Visuais:** O sistema deve apresentar indicadores visuais (cards, badges) com cores semânticas para facilitar interpretação rápida.
    * *Verde:* Balanço positivo, pagamentos quitados
    * *Amarelo:* Pagamentos parciais, alertas
    * *Vermelho:* Balanço negativo, pagamentos pendentes

### 3.5 Módulo de Precificação
* **RF17 - Tabela de Preços por Categoria:** O sistema deve permitir configurar preços base diferenciados por categoria de quarto.
    * *Exemplo:* Chalés Master (Q1-Q4): R$ 280,00/diária | Quartos Standard (Q5-Q8): R$ 300,00/diária
    * *Atributos:* Categoria, preço base (até 2 adultos), capacidade máxima
* **RF18 - Precificação de Pessoa Adicional:** O sistema deve calcular valores incrementais para ocupantes além da base (2 adultos).
    * *Exemplo:* Chalés Master: R$ 130,00 por adulto extra | Standard: R$ 120,00 por adulto extra
    * *Regra:* A partir do 3º adulto, cada pessoa adicional incrementa o valor da diária
* **RF19 - Política de Gratuidades e Descontos Infantis:** O sistema deve aplicar automaticamente regras de cobrança diferenciada por faixa etária.
    * *Regras padrão:*
        * 0 a 4 anos: Gratuito
        * 5 a 10 anos: 50% do valor de pessoa adicional
        * 11 anos ou mais: Valor integral de pessoa adicional
    * *Observação:* As idades devem ser informadas individualmente para cálculo preciso
* **RF20 - Cálculo Automático de Diárias:** O sistema deve calcular automaticamente o valor total da reserva considerando todos os fatores.
    * *Fórmula:* `(Preço Base + Adultos Extras × Valor Extra + Σ Crianças × Valor por Idade) × Número de Noites`
    * *Funcionalidade:* Recálculo em tempo real ao alterar datas, número de ocupantes ou categoria do quarto
* **RF21 - Breakdown de Precificação:** O sistema deve exibir detalhamento transparente do cálculo para o usuário.
    * *Informações exibidas:*
        * Preço base da categoria
        * Quantidade e valor de adultos extras
        * Quantidade, idade e valor de cada criança
        * Subtotal diário
        * Número de noites
        * Valor total

### 3.6 Gestão do Ciclo de Vida da Reserva
* **RF22 - Status Automático de Reserva:** O sistema deve calcular e exibir automaticamente o status atual de cada reserva baseado na data.
    * *Estados possíveis:*
        * **Agendada:** Data atual < Data de check-in
        * **Hospedado:** Data atual ≥ Check-in E Data atual < Check-out
        * **Concluída:** Data atual ≥ Data de check-out
        * **Cancelada:** Marcação manual pelo usuário
    * *Funcionalidade:* Atualização automática sem necessidade de intervenção manual
* **RF23 - Status de Pagamento Tricotômico:** O sistema deve controlar e exibir o status de pagamento em três estados distintos.
    * *Estados:*
        * **Pendente:** Valor pago = R$ 0,00 (indicador vermelho)
        * **Parcial:** R$ 0,00 < Valor pago < Valor total (indicador amarelo)
        * **Quitado:** Valor pago ≥ Valor total (indicador verde)
    * *Atributos rastreados:* `totalValue` (valor total da reserva) e `paidValue` (soma dos pagamentos recebidos)
* **RF24 - Painel de Detalhes do Hóspede:** O sistema deve exibir uma visão consolidada com todas as informações da reserva e hóspede.
    * *Informações exibidas:*
        * Dados pessoais (nome, telefone, email, documento, data de nascimento)
        * Detalhes da reserva (quarto, check-in/out, número de noites)
        * Composição de hóspedes (adultos e crianças com idades)
        * Breakdown financeiro detalhado
        * Status de reserva e pagamento
        * Observações e notas especiais
* **RF25 - Lista Ordenada de Hóspedes:** O sistema deve exibir lista de todas as reservas ordenadas cronologicamente.
    * *Ordenação padrão:* Data de check-in (mais próxima primeiro)
    * *Filtros sugeridos:* Todas, Agendadas, Hospedados, Concluídas
    * *Informações na lista:* Nome, quarto, datas, status visual de pagamento

---

## 4. Regras de Negócio

### 4.1 Capacidade e Ocupação
* **RN01 - Limite de Ocupação por Quarto:** Cada quarto possui uma capacidade máxima que não pode ser excedida.
    * *Implementação:* Quartos 1-4 suportam até 5 pessoas | Quartos 5-8 suportam até 4 pessoas
    * *Validação:* Sistema deve bloquear criação/edição de reserva que exceda a capacidade
    * *Cálculo:* Total de pessoas = Adultos + Crianças (todas as idades contam para capacidade)

### 4.2 Prevenção de Conflitos
* **RN02 - Prevenção de Overbooking:** O sistema não permite reservas simultâneas para o mesmo quarto em períodos que se sobreponham.
    * *Condição de conflito:* `(NovaReserva.checkIn < ReservaExistente.checkOut) AND (NovaReserva.checkOut > ReservaExistente.checkIn)`
    * *Exceção:* Ao editar uma reserva existente, ela não deve conflitar consigo mesma
    * *Feedback:* Mensagem clara informando o período de conflito e sugerindo quartos disponíveis

### 4.3 Validações de Datas
* **RN03 - Consistência de Datas:** A data de check-out deve ser sempre posterior à data de check-in.
    * *Validação mínima:* Check-out > Check-in (mínimo 1 diária)
    * *Feedback:* Mensagem de erro ao tentar salvar com datas inválidas

### 4.4 Cálculos Financeiros
* **RN04 - Base de Cálculo de Diárias:** O preço base sempre inclui 2 adultos. Pessoas adicionais incrementam o valor.
    * *Regra:* A partir do 3º adulto, cada pessoa adiciona o valor de "pessoa extra"
    * *Crianças:* Aplicam desconto conforme idade (RF19)
* **RN05 - Arredondamento Monetário:** Todos os valores financeiros devem ser armazenados e exibidos com 2 casas decimais.
    * *Formato de exibição:* R$ 1.234,56 (padrão brasileiro)

### 4.5 Status e Transições
* **RN06 - Transição Automática de Status:** O status da reserva muda automaticamente baseado na comparação entre data atual e datas da reserva.
    * *Lógica:*
        * Se `hoje < checkIn` → Agendada
        * Se `checkIn ≤ hoje < checkOut` → Hospedado
        * Se `hoje ≥ checkOut` → Concluída
    * *Exceção:* Status "Cancelada" é manual e permanente
* **RN07 - Cálculo de Status de Pagamento:** O status de pagamento é calculado comparando valor pago vs valor total.
    * *Lógica:*
        * Se `paidValue = 0` → Pendente
        * Se `0 < paidValue < totalValue` → Parcial
        * Se `paidValue ≥ totalValue` → Quitado

### 4.6 Campos Obrigatórios
* **RN08 - Dados Mínimos para Reserva:** Para criar uma reserva, são obrigatórios:
    * Nome do hóspede
    * Telefone de contato
    * Número do quarto
    * Data de check-in
    * Data de check-out
    * Quantidade de adultos (mínimo 1)
* **RN09 - Dados Opcionais:** Campos que enriquecem o cadastro mas não são bloqueantes:
    * Email, documento (CPF), data de nascimento, observações especiais
    * Quantidade e idades de crianças (se não houver, assume 0)

---

## 5. Requisitos Não Funcionais
* **RNF01 - Responsividade:** A interface deve ser Web Responsiva (funcional em Desktop e Smartphones via navegador).
* **RNF02 - Segurança:** Isolamento lógico de dados (uma pousada nunca acessa os dados da outra).
* **RNF03 - Performance:** O mapa de disponibilidade deve carregar em menos de 2 segundos para um período de 30 dias.
* **RNF04 - Usabilidade:** Interface em abas para organização de módulos, formulários modais não-bloqueantes e feedback visual imediato.
* **RNF05 - Acessibilidade:** Contraste adequado (WCAG AA mínimo), navegação por teclado funcional, textos alternativos em ícones.
* **RNF06 - Compatibilidade:** Suporte mínimo aos navegadores Chrome, Firefox, Safari e Edge (últimas 2 versões).

---

## 6. Histórias de Usuário (User Stories)

| Como... | Eu quero... | Para que... |
| :--- | :--- | :--- |
| Admin Pousada | Visualizar o mapa de disponibilidade | Eu possa saber rapidamente quais quartos estão livres para o próximo final de semana. |
| Admin Pousada | Cadastrar um consumo de passeio na reserva do hóspede | O valor seja somado automaticamente ao total que ele deve pagar no check-out. |
| Admin Pousada | Importar as reservas do Booking | Eu não precise digitar manualmente os dados de quem reservou online. |
| Super Admin | Cadastrar uma nova pousada no sistema | Eu possa expandir meu negócio e cobrar mensalidades de novos clientes. |
| Admin Pousada | Ver o cálculo detalhado da diária ao criar uma reserva | Eu possa explicar ao hóspede como chegamos no valor total. |
| Admin Pousada | Acompanhar o balanço mensal (receitas vs despesas) | Eu saiba se a pousada está lucrando ou tendo prejuízo. |
| Admin Pousada | Registrar pagamentos parciais de uma reserva | Eu controle quando o hóspede paga entrada e saldo no check-out. |
| Admin Pousada | Ver automaticamente se uma reserva está agendada ou hospedado | Eu não precise calcular manualmente baseado nas datas. |
| Admin Pousada | Configurar preços diferentes para chalés e quartos | Eu possa cobrar mais dos chalés que têm maior capacidade. |
| Recepcionista | Ver rapidamente quais reservas ainda têm pagamento pendente | Eu priorize a cobrança no check-out. |

---

## 7. Riscos e Mitigações

### 7.1 Riscos Técnicos
* **Risco:** Latência na sincronização do iCal (Airbnb) causar overbooking.
    * *Mitigação:* Implementar webhook ou redução do intervalo de sincronização para o mínimo possível (ex: 10 min).
    * *Plano B:* Bloqueio manual preventivo de datas quando houver suspeita de conflito

* **Risco:** Performance do calendário com muitas reservas simultâneas (>100 reservas visíveis)
    * *Mitigação:* Implementar paginação ou lazy loading, carregar apenas o mês visível
    * *Otimização:* Índices adequados no banco de dados para queries de disponibilidade

### 7.2 Riscos de Negócio
* **Risco:** Usuários podem esquecer de atualizar valores pagos, gerando relatórios financeiros incorretos
    * *Mitigação:* Dashboard com alertas de reservas hospedadas com pagamento pendente
    * *Funcionalidade futura:* Integração com APIs de pagamento para atualização automática

* **Risco:** Mudança de preços retroativa pode gerar inconsistência em reservas antigas
    * *Mitigação:* Valores calculados são persistidos no momento da criação da reserva
    * *Histórico:* Manter log de alterações de preços por categoria

---

## 7. Critérios de Aceite para o MVP
1.  É possível cadastrar uma pousada, seus quartos e categorias.
2.  O mapa de disponibilidade reflete as reservas criadas manualmente e as importadas via API.
3.  O sistema calcula automaticamente o valor da diária baseado em preços configurados, número de adultos e idades das crianças.
4.  O breakdown de precificação é exibido de forma transparente no formulário de reserva e no painel do hóspede.
5.  O dashboard financeiro exibe receitas (total, recebida, pendente), despesas e balanço do mês selecionado.
6.  As despesas podem ser categorizadas e o sistema totaliza por categoria automaticamente.
7.  O status da reserva (Agendada/Hospedado/Concluída) é atualizado automaticamente baseado na data atual.
8.  O status de pagamento (Pendente/Parcial/Quitado) é calculado automaticamente e exibido com indicadores visuais.
9.  É possível registrar múltiplos pagamentos parciais para uma reserva e o sistema calcula o saldo devedor.
10. O sistema é acessível via Chrome no celular de forma utilizável.

---

## 8. Arquitetura e Modelo de Dados

### 8.1 Entidades Principais

#### Inn (Pousada)
```
- id: UUID (PK)
- name: String
- address: String
- city: String
- state: String
- phone: String
- email: String
- created_at: DateTime
- updated_at: DateTime
```

#### RoomCategory (Categoria de Quarto)
```
- id: UUID (PK)
- inn_id: UUID (FK)
- name: String (ex: "Chalé Master", "Quarto Standard")
- description: Text
- max_capacity: Integer
- base_price: Decimal(10,2) (para 2 adultos)
- extra_person_price: Decimal(10,2)
- created_at: DateTime
- updated_at: DateTime
```

#### Room (Quarto/Unidade)
```
- id: UUID (PK)
- inn_id: UUID (FK)
- category_id: UUID (FK)
- number: Integer (ex: 1, 2, 3...)
- name: String (opcional, ex: "Chalé 01")
- status: Enum ['active', 'maintenance', 'inactive']
- created_at: DateTime
- updated_at: DateTime
```

#### Booking (Reserva)
```
- id: UUID (PK)
- inn_id: UUID (FK)
- room_id: UUID (FK)
- guest_name: String (obrigatório)
- phone: String (obrigatório)
- email: String (opcional)
- document: String (opcional, CPF)
- birth_date: Date (opcional)
- check_in: Date (obrigatório)
- check_out: Date (obrigatório)
- adults: Integer (obrigatório, mínimo 1)
- children: Integer (default 0)
- children_ages: JSON Array [5, 8, 12] (opcional)
- ages_text: String (opcional, "5, 8 e 12 anos")
- notes: Text (opcional)
- total_value: Decimal(10,2) (calculado)
- paid_value: Decimal(10,2) (default 0.00)
- source: Enum ['manual', 'booking_api', 'airbnb_ical', 'direct_website']
- cancellation_status: Boolean (default false)
- created_at: DateTime
- updated_at: DateTime

# Campos calculados (não persistidos):
- booking_status: Computed ['scheduled', 'checked_in', 'completed', 'cancelled']
- payment_status: Computed ['pending', 'partial', 'paid']
- number_of_nights: Computed (check_out - check_in)
- balance_due: Computed (total_value - paid_value)
```

#### Expense (Despesa)
```
- id: UUID (PK)
- inn_id: UUID (FK)
- description: String (obrigatório)
- amount: Decimal(10,2) (obrigatório)
- category: Enum ['water', 'electricity', 'internet', 'staff', 'maintenance', 'cleaning', 'food', 'marketing', 'taxes', 'ota_commissions', 'other']
- date: Date (obrigatório)
- payment_method: Enum ['cash', 'pix', 'debit_card', 'credit_card', 'bank_transfer']
- notes: Text (opcional)
- created_at: DateTime
- updated_at: DateTime
```

#### Extra (Extra/Consumo) - Fase 2
```
- id: UUID (PK)
- booking_id: UUID (FK)
- description: String (ex: "Café da manhã adicional")
- quantity: Integer
- unit_price: Decimal(10,2)
- total_amount: Decimal(10,2)
- date: Date
- created_at: DateTime
```

### 8.2 Relacionamentos
```
Inn 1:N RoomCategory
Inn 1:N Room
Inn 1:N Booking
Inn 1:N Expense

RoomCategory 1:N Room
Room 1:N Booking

Booking 1:N Extra (Fase 2)
```

### 8.3 Índices Recomendados
```sql
-- Busca de disponibilidade por período
CREATE INDEX idx_booking_dates ON booking(room_id, check_in, check_out);

-- Filtro financeiro por período
CREATE INDEX idx_booking_financial ON booking(inn_id, check_in, check_out, total_value, paid_value);
CREATE INDEX idx_expense_date ON expense(inn_id, date);

-- Multi-tenancy obrigatório
CREATE INDEX idx_booking_inn ON booking(inn_id);
CREATE INDEX idx_room_inn ON room(inn_id);
CREATE INDEX idx_expense_inn ON expense(inn_id);
```

### 8.4 Regras de Integridade
* **Multi-tenancy obrigatório:** Toda query deve incluir filtro por `inn_id` (implementar via Row Level Security ou Middleware)
* **Soft Delete:** Reservas e despesas canceladas devem ser marcadas como inativas, não deletadas fisicamente
* **Auditoria:** Campos `created_at` e `updated_at` obrigatórios em todas as tabelas
* **Validação de datas:** Constraint `CHECK (check_out > check_in)` na tabela Booking
* **Validação de valores:** Constraint `CHECK (total_value >= 0 AND paid_value >= 0)` na tabela Booking

### 8.5 Estratégia de Cálculos
* **Valores calculados em tempo real:** Status de reserva, status de pagamento, saldo devedor
* **Valores persistidos:** Valor total da reserva (para histórico), valor pago acumulado
* **Recálculo sob demanda:** Ao alterar datas, ocupantes ou categoria do quarto
* **Cache de dashboard:** Considerar cache de métricas financeiras mensais para performance

---
