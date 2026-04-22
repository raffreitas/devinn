# Tasks de implementacao do roadmap do DevInn

## Objetivo do documento

Este documento quebra o `docs/product-roadmap.md` em tasks executaveis,
sequenciais, e com direcionamento tecnico claro. O objetivo e permitir que o
time implemente o roadmap sem transformar cada etapa em uma discussao aberta.

Cada task abaixo informa:

- objetivo de negocio;
- alteracoes esperadas;
- direcionamento tecnico;
- dependencias;
- criterio de pronto.

## Estrutura recomendada para implementar as tasks

As tasks abaixo assumem a arquitetura atual do backend:

- `apps/api/src/DevInn.Domain`
- `apps/api/src/DevInn.Application`
- `apps/api/src/DevInn.Infrastructure`
- `apps/api/src/DevInn.WebApi`

E a estrutura atual do frontend:

- `apps/web/src/features`
- `apps/web/src/shared`
- `apps/web/src/routes.tsx`

As novas frentes devem seguir o modelo de **modular monolith**, ou seja:

- novos modulos por pasta e dominio;
- sem criar um `classlib` por modulo agora;
- sem separar varios servicos HTTP neste momento;
- com possibilidade futura de adicionar `DevInn.Worker`.

## Ordem recomendada de execucao

| ID | Task | Depende de |
|---|---|---|
| T00 | Definir fronteiras modulares | - |
| T01 | Corrigir integridade de reservas e quartos | T00 |
| T02 | Normalizar status e auditoria minima | T01 |
| T03 | Preparar worker e jobs assincronos | T00 |
| T04 | Implementar fluxo de check-in e check-out | T02 |
| T05 | Implementar status operacionais de quarto | T04 |
| T06 | Implementar governanca e manutencao | T05 |
| T07 | Criar cadastro unico de hospede | T02 |
| T08 | Integrar hospede no fluxo de reservas | T07 |
| T09 | Criar precificacao v2 | T08 |
| T10 | Expor disponibilidade publica | T09 |
| T11 | Construir jornada publica de reserva direta | T10 |
| T12 | Garantia e cobranca da reserva direta | T11 |
| T13 | Endurecer iCal atual | T03 |
| T14 | Criar camada interna de integracao | T13 |
| T15 | Integrar com channel manager | T14 |
| T16 | Profissionalizar contas a receber | T12, T15 |
| T17 | Integrar gateway de pagamento | T16 |
| T18 | Criar KPIs e relatorios | T16 |
| T19 | Implementar perfis e permissoes | T06, T18 |
| T20 | Criar comunicacao automatizada | T08, T17, T19 |

## Task detalhadas

### T00 - Definir fronteiras modulares

**Objetivo**  
Padronizar como cada dominio entra em `Domain`, `Application`,
`Infrastructure`, `WebApi`, e `web`.

**Alteracoes esperadas**

- Organizar modulos alvo: `Guests`, `Operations`, `DirectBooking`,
  `Integrations`.
- Definir convencao de pastas por modulo em backend e frontend.
- Definir naming para endpoints, handlers, services, DTOs, e rotas.

**Direcionamento tecnico**

- Em `DevInn.Domain`, usar `Aggregates/<Modulo>`.
- Em `DevInn.Application`, usar `Features/<Modulo>`.
- Em `DevInn.WebApi`, usar `Endpoints/<Modulo>`.
- Em `apps/web/src/features`, criar pastas por modulo.
- Nao criar `classlib` por modulo agora.

**Dependencias**  
- nenhuma.

**Pronto quando**

- existir um mapa de modulos alvo;
- novas features seguirem o mesmo padrao;
- o time nao depender de decisoes estruturais ad hoc.

---

### T01 - Corrigir integridade de reservas e quartos

**Objetivo**  
Eliminar riscos operacionais no fluxo atual.

**Alteracoes esperadas**

- impedir exclusao de quarto com reservas vinculadas;
- revisar sobreposicao de reservas;
- revisar cancelamento e delecao de reservas;
- garantir consistencia minima no banco.

**Direcionamento tecnico**

- Backend:
  - `DevInn.Application/Features/Inventory/Rooms`
  - `DevInn.Application/Features/Bookings`
  - `DevInn.WebApi/Endpoints/Inventory`
  - `DevInn.WebApi/Endpoints/Bookings`
- Data:
  - adicionar constraints e indices em
    `DevInn.Infrastructure/Persistence`
  - avaliar soft delete para reservas.
- Frontend:
  - expor erros de conflito com mensagem clara em
    `apps/web/src/features/bookings`.

**Dependencias**  
- T00.

**Pronto quando**

- nao for possivel remover quarto com reserva ativa;
- conflitos de reserva forem bloqueados de ponta a ponta;
- regras criticas estiverem protegidas no backend.

---

### T02 - Normalizar status e auditoria minima

**Objetivo**  
Ter status confiaveis e trilha minima de alteracoes.

**Alteracoes esperadas**

- revisar `booking_status` e `payment_status`;
- registrar alteracoes sensiveis em reservas, quartos, e integracoes;
- padronizar eventos de erro e mensagens operacionais.

**Direcionamento tecnico**

- Backend:
  - revisar agregados e services em `DevInn.Domain/Aggregates/Bookings`
  - revisar handlers em `DevInn.Application/Features/Bookings`
  - criar estrutura de auditoria em
    `DevInn.Infrastructure/Persistence` ou `Common`
- Web:
  - melhorar apresentacao de status em
    `apps/web/src/features/bookings`
  - revisar badges, filtros, e telas de detalhe.

**Dependencias**  
- T01.

**Pronto quando**

- status de reserva e pagamento forem consistentes;
- alteracoes sensiveis ficarem rastreaveis;
- usuario conseguir entender falhas e estados do fluxo.

---

### T03 - Preparar worker e jobs assincronos

**Objetivo**  
Separar o que nao precisa rodar no host HTTP principal.

**Alteracoes esperadas**

- criar `DevInn.Worker`;
- mover jobs de sincronizacao e tarefas agendadas para esse processo;
- preparar retries e processamento assincrono.

**Direcionamento tecnico**

- Criar novo projeto `apps/api/src/DevInn.Worker`.
- Reaproveitar `DevInn.Application` e `DevInn.Infrastructure`.
- Mover sincronizacao de canais, notificacoes, e tarefas demoradas para o
  worker.
- Manter `DevInn.WebApi` apenas como host HTTP.

**Dependencias**  
- T00.

**Pronto quando**

- jobs nao bloquearem request HTTP;
- sincronizacao e tarefas de fundo estiverem separadas do host principal.

---

### T04 - Implementar fluxo de check-in e check-out

**Objetivo**  
Cobrir o ciclo operacional principal da hospedagem.

**Alteracoes esperadas**

- criar comandos de check-in e check-out;
- registrar horario, observacoes, e responsavel;
- impedir transicoes invalidas de status.

**Direcionamento tecnico**

- Backend:
  - `DevInn.Domain/Aggregates/Bookings`
  - `DevInn.Application/Features/Bookings`
  - `DevInn.WebApi/Endpoints/Bookings`
- Frontend:
  - `apps/web/src/features/bookings`
  - adicionar acoes de check-in e check-out nas telas de reserva.

**Dependencias**  
- T02.

**Pronto quando**

- a reserva puder ser operada sem ajuste manual de status;
- transicoes invalidas forem bloqueadas no backend.

---

### T05 - Implementar status operacionais de quarto

**Objetivo**  
Separar disponibilidade comercial de estado operacional.

**Alteracoes esperadas**

- adicionar estados como `cleaning`, `ready`, `maintenance`, e `blocked`;
- refletir esses estados no calendario e em listas.

**Direcionamento tecnico**

- Backend:
  - `DevInn.Domain/Aggregates/Inventory`
  - `DevInn.Application/Features/Inventory`
- Frontend:
  - `apps/web/src/features/inventory`
  - `apps/web/src/features/bookings/components/booking-calendar.tsx`
- Data:
  - migracao para novos estados operacionais.

**Dependencias**  
- T04.

**Pronto quando**

- o time conseguir distinguir quarto disponivel de quarto pronto;
- a operacao nao depender de anotacao externa para isso.

---

### T06 - Implementar governanca e manutencao

**Objetivo**  
Dar visibilidade para limpeza, manutencao, e tarefas operacionais.

**Alteracoes esperadas**

- criar modulo `Operations`;
- criar tarefas de limpeza e manutencao;
- permitir atribuicao e atualizacao de status;
- registrar notas e bloqueios.

**Direcionamento tecnico**

- Backend:
  - criar `Aggregates/Operations`
  - criar `Features/Operations`
  - criar `Endpoints/Operations`
- Frontend:
  - criar `apps/web/src/features/operations`
  - adicionar rota no `routes.tsx`
  - incluir navegacao em `shared` ou `menu-items`.
- Data:
  - entidades para task operacional, responsavel, checklist, e historico.

**Dependencias**  
- T05.

**Pronto quando**

- a pousada conseguir controlar limpeza e manutencao dentro do sistema;
- quarto bloqueado ou sujo impactar a operacao corretamente.

---

### T07 - Criar cadastro unico de hospede

**Objetivo**  
Parar de armazenar informacoes do hospede apenas dentro da reserva.

**Alteracoes esperadas**

- criar modulo `Guests`;
- criar entidade ou agregado de hospede;
- criar deduplicacao por email, telefone, e documento;
- criar CRUD basico de hospedes.

**Direcionamento tecnico**

- Backend:
  - `DevInn.Domain/Aggregates/Guests`
  - `DevInn.Application/Features/Guests`
  - `DevInn.WebApi/Endpoints/Guests`
- Frontend:
  - `apps/web/src/features/guests`
- Data:
  - nova tabela de hospedes e relacionamento com reservas.

**Dependencias**  
- T02.

**Pronto quando**

- o mesmo hospede puder ter varias reservas;
- dados basicos nao precisarem ser redigitados sempre.

---

### T08 - Integrar hospede no fluxo de reservas

**Objetivo**  
Fazer a reserva usar o cadastro unico de hospede.

**Alteracoes esperadas**

- permitir busca de hospede existente;
- permitir criar hospede dentro do fluxo de reserva;
- exibir historico resumido no formulario e no detalhe.

**Direcionamento tecnico**

- Backend:
  - adaptar comandos e queries de reserva para receber `guestId`
  - manter fallback controlado para migracao do fluxo atual.
- Frontend:
  - `apps/web/src/features/bookings/components/booking-form.tsx`
  - autocomplete e selecao de hospede
  - cards de historico e observacoes.

**Dependencias**  
- T07.

**Pronto quando**

- a reserva puder ser associada a um hospede existente;
- o formulario nao exigir redigitacao completa em recorrencia.

---

### T09 - Criar precificacao v2

**Objetivo**  
Suportar regras reais de venda e receita.

**Alteracoes esperadas**

- tarifas sazonais;
- regra de fim de semana e feriado;
- estadia minima;
- antecedencia;
- override manual com rastreio.

**Direcionamento tecnico**

- Backend:
  - evoluir `DevInn.Domain/Aggregates/Bookings/Services`
  - ou criar um modulo de pricing em `Domain` e `Application`
- Frontend:
  - telas em `inventory`, `financial`, ou novo submodulo de pricing
  - atualizar breakdown em `bookings`.
- Data:
  - tabelas de regras comerciais e vigencias.

**Dependencias**  
- T08.

**Pronto quando**

- a pousada conseguir vender com tarifa diferente por periodo e contexto;
- o calculo for transparente no frontend e confiavel no backend.

---

### T10 - Expor disponibilidade publica

**Objetivo**  
Preparar a fundacao do canal direto de reservas.

**Alteracoes esperadas**

- criar superficie publica para busca de disponibilidade;
- retornar categorias, regras comerciais, e preco calculado;
- proteger tenant e exposicao indevida de dados.

**Direcionamento tecnico**

- Backend:
  - manter inicialmente em `DevInn.WebApi`
  - criar rotas publicas em algo como
    `Endpoints/DirectBooking` ou `Endpoints/Public`
- Application:
  - queries dedicadas para disponibilidade publica
- Frontend:
  - ainda sem jornada final, mas com contrato de API pronto.

**Dependencias**  
- T09.

**Pronto quando**

- existir API publica segura para consultar disponibilidade e valor final;
- o contrato suportar futuro frontend publico.

---

### T11 - Construir jornada publica de reserva direta

**Objetivo**  
Entregar a pagina de reserva self-service da pousada.

**Alteracoes esperadas**

- busca publica por periodo e ocupacao;
- escolha de categoria ou quarto;
- preenchimento de dados do hospede;
- confirmacao inicial de reserva.

**Direcionamento tecnico**

- Frontend:
  - criar `apps/web/src/features/direct-booking`
  - avaliar app publico dentro do web atual ou rota publica isolada
- Backend:
  - endpoints publicos em `DirectBooking`
  - validacoes de disponibilidade e preco no servidor.

**Dependencias**  
- T10.

**Pronto quando**

- uma pousada conseguir receber reserva direta sem operacao manual;
- a jornada funcionar bem em mobile.

---

### T12 - Garantia e cobranca da reserva direta

**Objetivo**  
Fechar o fluxo financeiro minimo da reserva direta.

**Alteracoes esperadas**

- garantia via PIX, link de pagamento, ou cartao;
- expiracao de reserva pendente;
- confirmacao automatica apos pagamento ou garantia.

**Direcionamento tecnico**

- Backend:
  - `DirectBooking` + `Financial`
  - expiracao via worker
- Frontend:
  - checkout da reserva publica
  - mensagens claras de status.

**Dependencias**  
- T11.

**Pronto quando**

- a reserva direta nao depender de validacao manual para confirmar os casos
  simples;
- reservas pendentes expirarem corretamente.

---

### T13 - Endurecer iCal atual

**Objetivo**  
Aumentar confiabilidade do que ja existe antes de ampliar escopo OTA.

**Alteracoes esperadas**

- historico de sincronizacao;
- ultimo sync com status;
- reprocessamento manual;
- erro detalhado por integracao e quarto;
- identificacao de conflito e suspeita de overbooking.

**Direcionamento tecnico**

- Backend:
  - `DevInn.Infrastructure/Integrations`
  - `DevInn.Infrastructure/BackgroundJobs`
  - `DevInn.WebApi/Endpoints/Integrations`
- Frontend:
  - `apps/web/src/features/integrations`
  - telas de status, log e retry.

**Dependencias**  
- T03.

**Pronto quando**

- o time conseguir operar o iCal com visibilidade;
- falhas deixarem de ser silenciosas.

---

### T14 - Criar camada interna de integracao

**Objetivo**  
Desacoplar o dominio de reservas da tecnologia de cada canal.

**Alteracoes esperadas**

- criar abstracao de canal;
- padronizar sync, erro, reconciliacao, e mapeamento;
- separar reserva externa de reserva manual e reserva direta.

**Direcionamento tecnico**

- Backend:
  - `DevInn.Domain/Aggregates/Integrations`
  - `DevInn.Application/Features/Integrations`
  - `DevInn.Infrastructure/Integrations`
- Criar interfaces do tipo:
  - `IChannelConnector`
  - `IChannelSyncService`
  - `IExternalReservationMapper`
- Registrar eventos internos de sincronizacao e reconciliacao.

**Dependencias**  
- T13.

**Pronto quando**

- um novo canal puder ser integrado sem reescrever o core de reservas;
- o dominio estiver protegido da complexidade externa.

---

### T15 - Integrar com channel manager

**Objetivo**  
Escalar distribuicao sem construir conectores diretos cedo demais.

**Alteracoes esperadas**

- integrar com parceiro como Channex;
- mapear quartos, tarifas, e reservas;
- tratar webhooks, retries, e reconciliacao.

**Direcionamento tecnico**

- Backend:
  - implementar adaptador no modulo `Integrations`
  - usar `DevInn.Worker` para sync e reconciliacao
- Frontend:
  - configuracao e monitoramento em `features/integrations`
- Infra:
  - segredos, rate limit, observabilidade, e logs por tenant.

**Dependencias**  
- T14.

**Pronto quando**

- uma pousada puder operar distribuicao multicanal com parceiro externo;
- o monitoramento de sync estiver visivel.

---

### T16 - Profissionalizar contas a receber

**Objetivo**  
Dar leitura real de entrada, saldo, e inadimplencia.

**Alteracoes esperadas**

- separar melhor valor total, entrada, saldo, vencimento, e status;
- criar contas a receber por reserva;
- criar conciliacao basica.

**Direcionamento tecnico**

- Backend:
  - evoluir `Financial` e `Bookings`
  - criar queries financeiras mais consistentes
- Frontend:
  - melhorar dashboard financeiro
  - adicionar listas de contas a receber e atrasos.

**Dependencias**  
- T12 e T15.

**Pronto quando**

- o financeiro conseguir mostrar o que entrou, o que falta receber, e de qual
  reserva vem cada saldo.

---

### T17 - Integrar gateway de pagamento

**Objetivo**  
Reduzir controle manual de cobranca.

**Alteracoes esperadas**

- PIX;
- link de pagamento;
- webhook de confirmacao;
- status financeiro automatizado em casos suportados.

**Direcionamento tecnico**

- Backend:
  - criar adaptador de pagamento em `Infrastructure`
  - manter orquestracao em `Application`
- Worker:
  - processar reconciliacao e webhook quando fizer sentido
- Frontend:
  - fluxo de checkout da reserva direta
  - tela de cobranca no PMS interno.

**Dependencias**  
- T16.

**Pronto quando**

- o sistema conseguir confirmar pagamentos de forma automatizada em pelo menos
  um fluxo principal.

---

### T18 - Criar KPIs e relatorios

**Objetivo**  
Transformar dado operacional em visao gerencial.

**Alteracoes esperadas**

- ocupacao;
- receita por canal;
- forecast;
- exportacao;
- filtros por periodo, categoria, e origem.

**Direcionamento tecnico**

- Backend:
  - criar modulo de relatorios em `Application`
  - queries dedicadas para agregacoes
- Frontend:
  - evoluir `apps/web/src/features/financial`
  - criar dashboard gerencial
  - exportacao de relatorios.

**Dependencias**  
- T16.

**Pronto quando**

- gerente conseguir ler saude do negocio dentro do produto;
- exportacao atender o uso operacional basico.

---

### T19 - Implementar perfis e permissoes

**Objetivo**  
Suportar pousadas com equipe e papeis diferentes.

**Alteracoes esperadas**

- perfis como recepcao, financeiro, governanca, gerente;
- controle por permissao;
- dashboard e menu por perfil.

**Direcionamento tecnico**

- Backend:
  - evoluir `Identity`
  - politicas em `DevInn.WebApi`
- Frontend:
  - controle de menu, rotas, e acoes por permissao
  - revisar auth context e guards.

**Dependencias**  
- T06 e T18.

**Pronto quando**

- a mesma pousada puder operar com acessos diferentes por funcao;
- rotas e acoes forem efetivamente protegidas.

---

### T20 - Criar comunicacao automatizada

**Objetivo**  
Automatizar momentos criticos da jornada do hospede.

**Alteracoes esperadas**

- confirmacao de reserva;
- lembrete de check-in;
- mensagem de pre-estadia;
- mensagem de pos-estadia;
- integracao inicial com email e WhatsApp.

**Direcionamento tecnico**

- Backend:
  - `DevInn.Infrastructure/Email`
  - novo modulo de notificacoes ou `Communications`
- Worker:
  - agendamento e retries
- Frontend:
  - configuracao de templates e gatilhos
  - historico de envios por reserva ou hospede.

**Dependencias**  
- T08, T17, e T19.

**Pronto quando**

- o produto conseguir enviar mensagens automaticas com base em eventos e datas;
- a pousada conseguir configurar o minimo sem depender do time tecnico.

## Recomendacoes de execucao

1. Trate `T00` a `T06` como bloco de estabilizacao operacional.
2. Trate `T07` a `T12` como bloco de crescimento de receita direta.
3. Trate `T13` a `T17` como bloco de distribuicao e financeiro.
4. Trate `T18` a `T20` como bloco de maturidade do produto.

## O que pode rodar em paralelo

Depois de concluir a estabilizacao inicial, estes grupos podem andar em paralelo:

- `T07` e `T13`
- `T09` e preparacao visual do frontend para `T11`
- `T18` e `T19`, desde que os contratos de permissao estejam definidos

## O que nao deve acontecer durante a execucao

- criar um `classlib` por modulo sem necessidade real;
- separar varios hosts HTTP cedo demais;
- misturar regras do canal direto com regras internas sem fronteira clara;
- integrar varias OTAs direto antes de validar o caminho com channel manager;
- ampliar escopo do site publico para CMS completo cedo demais.
