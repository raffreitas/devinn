# DevInn — Visão de Negócio e Contexto do Produto

**Versão:** 1.0  
**Audiência:** Especialistas de negócio, consultores de produto, stakeholders estratégicos  
**Objetivo:** Fornecer contexto completo sobre o produto para apoiar a evolução do software e a construção de um roadmap de MVP eficiente.

---

## 1. O que é o DevInn?

O **DevInn** é um sistema de gestão de hospedagem (PMS — *Property Management System*) no modelo SaaS, desenvolvido especificamente para **pousadas brasileiras de pequeno e médio porte** (5 a 50 quartos).

O produto centraliza operações que hoje são feitas de forma fragmentada: reservas manuais recebidas por WhatsApp, planilhas de controle financeiro, anotações em papel para governança e dependência de OTAs (Booking.com, Airbnb) sem visibilidade real sobre lucratividade.

### 1.1 Problema central

Pousadas de pequeno porte operam com processo altamente manual e disperso:

- Reservas chegam por múltiplos canais (WhatsApp, telefone, Booking.com, Airbnb) sem centralização.
- O risco de **overbooking** é alto porque não há calendário único de disponibilidade.
- O financeiro é controlado em planilhas separadas, sem visão consolidada de receita líquida após comissões de OTAs.
- A operação de check-in, check-out e limpeza depende de comunicação por WhatsApp entre a equipe.
- O histórico de hóspedes se perde entre reservas — não existe CRM.

### 1.2 Proposta de valor

> O DevInn deve ser o PMS mais simples e operacional para pousadas brasileiras de 5 a 50 quartos.

- **Para o dono:** visibilidade financeira real, sem planilhas externas.
- **Para o gestor:** calendário unificado de ocupação e controle de equipe.
- **Para a recepção:** fluxo de reservas rápido, sem retrabalho de cadastro.
- **Para a pousada como negócio:** mais reservas diretas, menos dependência de OTAs.

---

## 2. Personas

### 2.1 Super Admin (Plataforma DevInn)

Responsável pela gestão do próprio SaaS. Tem acesso a dados de todas as pousadas cadastradas na plataforma, visualiza métricas de crescimento e gerencia onboarding de novas pousadas. **Não acessa dados operacionais de nenhuma pousada específica.**

### 2.2 Admin da Pousada (Dono / Gerente)

Usuário principal do sistema. Tem acesso total a todos os módulos da sua pousada: reservas, financeiro, inventário, configurações e integrações. É quem toma decisões estratégicas baseadas nos dados do sistema.

> **Gap identificado:** Ainda não existe perfil de usuário para recepcionista, governanta ou colaborador com permissões restritas. Toda a operação hoje passa pelo Admin.

---

## 3. Módulos do Produto — Estado Atual

### 3.1 Autenticação e Multi-Tenancy

**Status: Implementado**

O sistema usa autenticação por e-mail e senha com tokens JWT. Cada pousada é um **tenant isolado**: todos os dados (quartos, reservas, hóspedes, despesas) são segregados por `inn_id`. Nenhuma pousada acessa dados de outra.

Funcionalidades:
- Login com e-mail e senha.
- Recuperação de senha por e-mail.
- Edição de perfil do usuário autenticado.
- Dois papéis: `SuperAdmin` (plataforma) e `InnAdmin` (por pousada).

---

### 3.2 Inventário (Categorias e Quartos)

**Status: Implementado**

O inventário é organizado em dois níveis hierárquicos:

```
Pousada
└── Categoria (ex: Chalé Master, Suíte Família)
    └── Quarto físico (ex: Quarto 01, 02, 03...)
```

#### Categorias de Quarto

Cada categoria define o **perfil comercial** de um conjunto de quartos:

| Atributo | Descrição |
|---|---|
| Nome | Identificação da categoria (ex: Chalé Duplo) |
| Descrição | Texto descritivo opcional |
| Capacidade | Número máximo de pessoas |
| Preço Base | Valor da diária para até 2 adultos |
| Preço Extra por Pessoa | Valor incremental a partir do 3º ocupante |

#### Quartos Físicos

Cada quarto está vinculado a uma categoria e herda suas regras de precificação:

| Atributo | Descrição |
|---|---|
| Número | Identificador do quarto (1–999) |
| Categoria | Qual categoria esse quarto pertence |
| Status | `Ativo`, `Em Manutenção` ou `Inativo` |
| Token iCal de Exportação | Token único para exportar a disponibilidade do quarto via protocolo iCal |

> **Regra de negócio:** O status `Em Manutenção` e `Inativo` não impede hoje a criação de reservas para o quarto — isso é um gap a ser corrigido.

---

### 3.3 Calendário de Reservas (Mapa de Gantt)

**Status: Implementado**

A tela principal do sistema é um **calendário estilo Gantt interativo**:

- Eixo Y: lista de quartos ordenados por número.
- Eixo X: dias do mês, navegáveis para meses anteriores e futuros.
- Cada reserva aparece como uma **barra colorida** sobre o período de hospedagem.

#### Cores das barras por status de pagamento

| Cor | Significado |
|---|---|
| Verde | Pagamento quitado |
| Amarelo | Pagamento parcial |
| Vermelho | Pagamento pendente |

#### Interações

- Clique em **célula vazia**: abre formulário de nova reserva com quarto e data pré-preenchidos.
- Clique em **barra de reserva**: abre detalhes da reserva para edição.
- Hover em barra: tooltip com nome do hóspede e valor.
- Reservas de OTAs (Booking.com, Airbnb via iCal) aparecem com badge de origem.

---

### 3.4 Gestão de Reservas

**Status: Implementado**

#### Ciclo de vida de uma reserva

```
CRIAÇÃO (Scheduled)
    │
    ├─── Hospede chega no dia ──► CheckedIn
    │                               │
    │                               └─── Hospede sai ──► Completed
    │
    └─── Cancelamento manual ──► Canceled
```

> **Status automáticos**: O sistema calcula automaticamente se a reserva está `Agendada`, `Hospedado` ou `Concluída` comparando a data atual com as datas de check-in e check-out. Apenas `Cancelada` é manual.

#### Fontes de reserva

| Origem | Descrição |
|---|---|
| `Manual` | Criada diretamente no sistema (WhatsApp, telefone, balcão) |
| `BookingIcal` | Importada via iCal do Booking.com (bloqueio de datas) |
| `AirbnbIcal` | Importada via iCal do Airbnb (bloqueio de datas) |
| `DirectWebsite` | Reserva pelo site direto da pousada (futuro) |
| `BookingApi` | Integração direta via API do Booking.com (planejado no PRD) |

#### Dados capturados na reserva

**Dados do hóspede:**
- Nome (obrigatório)
- E-mail, telefone, CPF, data de nascimento (opcionais)

**Dados da estadia:**
- Quarto, check-in, check-out
- Número de adultos (mínimo 1)
- Número e idades de crianças (para cálculo de precificação diferenciada)
- Observações internas

**Dados financeiros na criação:**
- Valor pago na entrada (opcional)
- Método de pagamento (Dinheiro, PIX, Cartão de Débito, Cartão de Crédito, Transferência)
- Observações sobre o pagamento

#### Status de pagamento

| Status | Condição |
|---|---|
| Pendente | Nenhum pagamento registrado |
| Parcial | Valor pago > 0 e menor que o total |
| Pago | Valor pago ≥ valor total da reserva |

#### Regras de precificação automática

O sistema calcula o valor da reserva automaticamente:

```
Valor Total =
  (Preço Base da Categoria
   + Adultos Extras × Preço Extra por Pessoa
   + Crianças entre 5–10 anos × 50% do Preço Extra
   + Crianças 11+ anos × 100% do Preço Extra)
  × Número de Noites
```

- Crianças de 0 a 4 anos: gratuito.
- Crianças de 5 a 10 anos: 50% do preço extra.
- Crianças de 11 anos ou mais: preço extra integral.

#### Listagem e filtros

A tela de Reservas exibe uma lista paginada com filtros por:
- Período (data de check-in/check-out).
- Status da reserva (`Agendada`, `Hospedado`, `Concluída`, `Cancelada`).
- Status de pagamento (`Pago`, `Parcial`, `Pendente`).

#### Recibo de reserva

O sistema possui funcionalidade de geração de recibo em PDF diretamente do detalhe da reserva.

#### Exclusão com soft delete

Reservas excluídas não são apagadas do banco — são marcadas com `DeletedAt`. Isso preserva o histórico operacional para auditoria. Reservas com hospedagem em andamento (`CheckedIn`) ou concluídas (`Completed`) **não podem ser excluídas**.

---

### 3.5 Integrações iCal

**Status: Implementado (limitado)**

O sistema suporta importação de reservas via protocolo **iCal** dos canais Booking.com e Airbnb.

#### Como funciona

1. A pousada cadastra no sistema a **URL iCal** fornecida pelo Booking.com ou Airbnb para um quarto específico.
2. O sistema sincroniza periodicamente, importando os bloqueios de datas.
3. Os períodos ocupados aparecem no calendário com badge de origem.

#### Limitações atuais do iCal

| O que iCal faz | O que iCal NÃO faz |
|---|---|
| Bloqueia datas para evitar overbooking | Importa dados completos do hóspede |
| Exibe origem da reserva | Importa valores financeiros e comissões |
| Sincroniza cancelamentos | Garante sincronização em tempo real |

#### Exportação iCal

Cada quarto possui um **token único de exportação iCal**. Isso permite que outros sistemas (incluindo o próprio Booking.com e Airbnb) leiam a disponibilidade do quarto no DevInn, evitando overbooking bidirecional.

#### Estados de sincronização

| Status | Descrição |
|---|---|
| `NeverSynced` | Integração criada, nunca sincronizou |
| `Syncing` | Sincronização em andamento |
| `Success` | Última sincronização bem-sucedida |
| `Failed` | Última sincronização falhou com erro |

---

### 3.6 Módulo Financeiro

**Status: Implementado (nível básico)**

O financeiro é dividido em dois sub-módulos:

#### Dashboard Financeiro

Visão consolidada por período (selecionável via date range):

| Métrica | Cálculo |
|---|---|
| Receita Total | Soma do valor total de todas as reservas no período |
| Receita Recebida | Soma dos valores efetivamente pagos |
| Receita Pendente | Diferença entre total e recebido |
| Total de Despesas | Soma de todas as despesas com vencimento no período |
| Balanço Real | Receita Recebida − Despesas |
| Balanço Projetado | Receita Total − Despesas |

Gráficos incluídos:
- **Gráfico de Receitas vs Despesas** por período (barras).
- **Gráfico de Despesas por Categoria** (pizza/donut).

#### Gestão de Despesas

CRUD completo de despesas operacionais:

| Atributo | Descrição |
|---|---|
| Categoria | Agrupamento da despesa (água, energia, funcionários etc.) |
| Descrição | Texto livre descrevendo a despesa |
| Valor | Montante em reais |
| Forma de Pagamento | Mesmo conjunto do módulo de reservas |
| Data de Vencimento | Quando a despesa vence |
| Data de Pagamento | Quando foi efetivamente paga (opcional) |

**Status de despesa calculado automaticamente:**
- `Pendente`: não paga, vencimento futuro.
- `Vence Hoje`: não paga, vence no dia atual.
- `Atrasada`: não paga, vencimento passado.
- `Paga`: data de pagamento registrada.
- `Cancelada`: cancelada manualmente.

Filtros disponíveis: busca por texto, por categoria, por forma de pagamento e navegação mensal.

---

### 3.7 Configurações da Pousada

**Status: Implementado**

Dados cadastrais da pousada (visíveis para o hóspede e usados nos recibos):

- Nome da Pousada
- E-mail de Contato
- Telefone / WhatsApp
- Endereço Completo (logradouro, CEP, cidade, estado, país)

---

## 4. Fluxo de Negócio — Operação Diária

A seguir, o fluxo completo de como a pousada opera usando o DevInn hoje:

### 4.1 Configuração Inicial (Uma vez)

```
Dono cria conta
    │
    ├─ Cadastra dados da pousada (configurações)
    │
    ├─ Cria categorias de quartos (com preços)
    │
    ├─ Cadastra os quartos físicos vinculados às categorias
    │
    └─ (Opcional) Configura integrações iCal do Booking.com e Airbnb
```

### 4.2 Recebimento de Reserva Manual

```
Hóspede liga / manda WhatsApp
    │
    ├─ Recepcionista abre o Calendário de Reservas
    │
    ├─ Clica no quarto e data desejados
    │
    ├─ Preenche: nome, contato, datas, adultos, crianças
    │
    ├─ Sistema calcula o valor automaticamente
    │
    ├─ (Opcional) Registra pagamento de entrada
    │
    └─ Reserva salva com status "Agendada"
```

### 4.3 Check-in

```
Hóspede chega na pousada
    │
    ├─ Recepcionista localiza reserva no calendário ou na lista
    │
    ├─ Confere dados do hóspede (pode complementar CPF, e-mail etc.)
    │
    ├─ Registra pagamentos pendentes se necessário
    │
    └─ Status muda automaticamente para "Hospedado" (baseado na data)
```

> **Gap:** Hoje não existe um botão explícito de "Fazer Check-in". O status muda automaticamente pela data, o que pode gerar confusão operacional.

### 4.4 Durante a Estadia

```
Hóspede está hospedado
    │
    ├─ Recepcionista pode adicionar pagamentos parciais
    │
    ├─ Pode editar observações da reserva
    │
    └─ (Futuro) Registrar consumos extras (frigobar, passeios etc.)
```

### 4.5 Check-out

```
Hóspede vai embora
    │
    ├─ Recepcionista verifica saldo devedor na reserva
    │
    ├─ Registra pagamento final se houver saldo
    │
    └─ Status muda automaticamente para "Concluída" após a data de check-out
```

> **Gap:** Não existe fluxo de check-out com confirmação explícita. Não há integração com governança para avisar que o quarto precisa de limpeza.

### 4.6 Reservas de OTAs (Booking.com / Airbnb)

```
Hóspede reserva no Booking.com ou Airbnb
    │
    ├─ Sistema busca o iCal do canal periodicamente (sincronização automática)
    │
    ├─ Período aparece bloqueado no calendário com badge da origem
    │
    └─ Recepcionista pode enriquecer o bloqueio com dados do hóspede manualmente
```

> **Limitação:** Dados financeiros (valor da reserva, comissão do canal) não são importados via iCal. A pousada precisa lançar manualmente no financeiro.

### 4.7 Controle Financeiro

```
Final do mês (ou quando necessário)
    │
    ├─ Dono acessa Dashboard Financeiro
    │
    ├─ Visualiza receita de reservas no período
    │
    ├─ Lança despesas do mês (água, energia, funcionários etc.)
    │
    └─ Analisa balanço real vs. projetado
```

---

## 5. Estrutura Técnica (Visão de Negócio)

Este tópico apresenta a estrutura técnica em linguagem acessível para especialistas de negócio, para que possam entender **o que já existe** e **o que precisa ser construído**.

### 5.1 Como o sistema é dividido

```
DevInn
├── Aplicação Web (Frontend)     — O que o usuário vê e usa
│   ├── Calendário de Reservas
│   ├── Gestão de Reservas
│   ├── Inventário (Categorias e Quartos)
│   ├── Integrações iCal
│   ├── Dashboard Financeiro
│   ├── Gestão de Despesas
│   └── Configurações da Pousada
│
└── API (Backend)                — A lógica de negócio e banco de dados
    ├── Autenticação e Controle de Acesso
    ├── Gestão de Pousadas (multi-tenant)
    ├── Inventário (Categorias e Quartos)
    ├── Reservas e Ciclo de Vida
    ├── Integrações (iCal import/export)
    └── Financeiro (Despesas)
```

### 5.2 Multi-Tenancy (Isolamento de dados)

Cada pousada é um tenant completamente isolado. Um usuário de uma pousada **nunca** acessa dados de outra pousada. Isso é garantido por código em todas as operações do backend.

### 5.3 Integridade dos dados

- Reservas excluídas são mantidas no banco para auditoria (soft delete).
- Reservas com hospedagem ativa ou concluída não podem ser excluídas.
- Bloqueios de iCal não podem ser editados como reservas manuais.
- Cada reserva tem uma trilha mínima de auditoria com ações e timestamps.

---

## 6. Gaps Identificados — O que falta para o MVP de Produção

### 6.1 Operacionais (Alta Prioridade)

| Gap | Impacto no negócio |
|---|---|
| Não há fluxo explícito de check-in / check-out | Recepcionista não sabe ao certo quando confirmar a entrada ou saída |
| Status de quarto não existe (limpeza, manutenção) | A equipe de governança não consegue usar o sistema para saber o que limpar |
| Não há notificação de quarto disponível para limpeza | Pousada continua usando WhatsApp para coordenação da equipe |
| Quartos em manutenção podem receber reservas | Risco operacional real de alocar hóspede em quarto indisponível |

### 6.2 CRM de Hóspedes (Alta Prioridade)

| Gap | Impacto no negócio |
|---|---|
| Hóspede existe apenas dentro da reserva | Se o mesmo hóspede volta, seus dados precisam ser recadastrados |
| Não há histórico de estadias por hóspede | Impossível oferecer atendimento personalizado ou programa de fidelidade |
| Sem busca/reaproveitamento de hóspede | Gera retrabalho na recepção e erros de cadastro |

### 6.3 Financeiro (Média Prioridade)

| Gap | Impacto no negócio |
|---|---|
| Financeiro das OTAs é manual | Dono não sabe qual a receita líquida real descontando comissões |
| Não há contas a receber estruturadas | Saldo devedor por reserva não gera alertas ou cobranças |
| Sem integração com gateway de pagamento | Toda cobrança ainda é offline (PIX manual, dinheiro, maquininha separada) |
| Relatórios são limitados | Dono não consegue exportar dados para contabilidade ou tomar decisões mais elaboradas |

### 6.4 Integrações com OTAs (Média Prioridade)

| Gap | Impacto no negócio |
|---|---|
| iCal não importa dados financeiros | Comissões e receita bruta do Booking.com/Airbnb precisam ser lançadas manualmente |
| iCal não tem visibilidade de erros | A equipe não sabe quando uma sincronização falhou |
| Sem sincronização bidirecional eficiente | Risco de atraso na atualização de disponibilidade e overbooking |

### 6.5 Distribuição Direta (Estratégico)

| Gap | Impacto no negócio |
|---|---|
| Não há motor de reservas diretas | 100% das reservas online dependem de OTAs (Booking.com paga ~15–20% de comissão) |
| Sem página pública de disponibilidade | Hóspede que conhece a pousada não consegue reservar sem intermediário |

### 6.6 Gestão de Equipe (Baixa Prioridade para MVP)

| Gap | Impacto no negócio |
|---|---|
| Apenas um perfil de usuário (Admin) | Colaboradores não podem usar o sistema com permissões restritas |
| Sem rastreio de ação por usuário | Impossível saber quem fez o quê no sistema |

---

## 7. Proposta de Roadmap para o MVP de Produção

Com base nos gaps identificados, recomenda-se a seguinte sequência para transformar o DevInn em um PMS confiável para a operação diária de uma pousada:

### Fase 1 — Estabilidade Operacional (Fundação)

**Objetivo:** Tornar o sistema seguro para uso diário sem risco operacional.

1. Bloquear criação de reserva em quarto em manutenção ou inativo.
2. Bloquear exclusão de quarto com reservas futuras vinculadas.
3. Melhorar visibilidade dos erros de sincronização iCal.
4. Validar e fortalecer regras de integridade nas transições de status da reserva.

**Critério de sucesso:** Nenhuma reserva pode ser criada em quarto indisponível. Erros operacionais críticos são exibidos claramente para o usuário.

---

### Fase 2 — Fluxo Operacional Completo

**Objetivo:** Permitir que recepção e governança operem pelo sistema sem processos paralelos.

1. Criar ação explícita de check-in com confirmação.
2. Criar ação explícita de check-out com verificação de saldo.
3. Criar status operacional de quarto: `Limpo`, `Em Limpeza`, `Pronto para Check-in`, `Em Manutenção`.
4. Notificar mudança de status do quarto para a equipe de governança.
5. Permitir observações operacionais por quarto e por reserva.

**Critério de sucesso:** A recepcionista consegue fazer check-in e check-out pelo sistema. A governanta recebe alerta quando um quarto precisa de limpeza após check-out.

---

### Fase 3 — CRM de Hóspedes

**Objetivo:** Parar de perder dados valiosos dos hóspedes entre reservas.

1. Criar cadastro centralizado de hóspedes.
2. Vincular reservas ao hóspede pelo CPF ou e-mail.
3. Exibir histórico de estadias por hóspede.
4. Permitir reutilizar dados do hóspede ao criar nova reserva.

**Critério de sucesso:** O recepcionista digita o nome do hóspede e o sistema recupera automaticamente seus dados das reservas anteriores.

---

### Fase 4 — Financeiro Confiável

**Objetivo:** O dono da pousada consegue ler o financeiro do sistema sem planilha externa.

1. Criar contas a receber por reserva com alertas de inadimplência.
2. Melhorar relatório de receita bruta, receita líquida e despesas.
3. Exportar relatório financeiro para planilha (CSV).
4. Lançar automaticamente comissão de OTA como despesa ao importar reserva.

**Critério de sucesso:** O dono abre o dashboard financeiro e entende sua lucratividade real, incluindo comissões de OTAs.

---

### Fase 5 — Canal Direto de Reservas

**Objetivo:** Transformar o DevInn em fonte de reservas diretas para a pousada, reduzindo dependência de OTAs.

1. Criar página pública de disponibilidade e reservas (motor de booking direto).
2. Exibir disponibilidade em tempo real por categoria.
3. Permitir coleta de dados do hóspede no fluxo de reserva direta.
4. Integrar pagamento por PIX ou link de pagamento.
5. Confirmar reserva automaticamente e inserir no calendário.

**Critério de sucesso:** Um hóspede consegue reservar diretamente na pousada sem depender do Booking.com ou Airbnb.

---

### Fase 6 — Distribuição e OTAs Avançado

**Objetivo:** Sincronização confiável e bidirecional com canais de venda.

1. Melhorar logs de sincronização iCal com histórico visual.
2. Exibir conflitos de datas suspeitos para revisão manual.
3. Adicionar reprocessamento manual por integração.
4. Avaliar integração com channel manager (ex: Channex) para conectar múltiplos OTAs.

---

## 8. Métricas de Sucesso do Produto

Para medir se o DevInn está entregando valor real, recomenda-se acompanhar:

| Métrica | O que indica |
|---|---|
| % de reservas criadas pelo sistema vs. total | Adoção do fluxo de reservas |
| Taxa de overbooking zero | Eficácia do calendário unificado |
| Tempo médio de criação de reserva | Eficiência da recepção |
| % de pousadas usando o financeiro | Adoção do módulo financeiro |
| % de reservas diretas vs. OTAs | Impacto do canal direto (quando disponível) |
| Taxa de retenção de pousadas (churn) | Satisfação geral com o produto |
| NPS de donos de pousada | Percepção de valor |

---

## 9. Referências e Documentos Relacionados

| Documento | Descrição |
|---|---|
| `docs/PRD.md` | Documento de Requisitos do Produto — especificação técnica detalhada de cada funcionalidade |
| `docs/product-roadmap.md` | Roadmap estratégico com análise de prioridades e decisões arquiteturais |
| `docs/product-roadmap-tasks.md` | Tarefas detalhadas de execução do roadmap |
| `docs/modular-boundaries.md` | Limites modulares e arquitetura do backend |
| `AGENTS.md` | Contexto técnico completo do repositório para desenvolvedores |

---

*Documento gerado em 29/04/2026. Para atualizar, revisar os módulos implementados no código-fonte e os gaps listados na Seção 6.*
