# Roadmap de produto para o DevInn

## Objetivo do documento

Este documento transforma a discussao de produto em um roteiro de execucao
passo a passo para evoluir o DevInn de um MVP funcional para um PMS pronto
para pequenas e medias pousadas.

Documento complementar de execucao: `docs/product-roadmap-tasks.md`.

O foco nao e competir com plataformas como a Cloudbeds em amplitude. O foco e
entregar um produto mais simples, mais rapido de implantar, e mais aderente a
operacao real de pousadas brasileiras.

## Posicionamento recomendado

**Tese de produto:** o DevInn deve ser o PMS mais simples e operacional para
pousadas brasileiras de 5 a 50 quartos.

### O que isso significa na pratica

- Priorizar operacao diaria antes de features enterprise.
- Reduzir trabalho manual de recepcao, governanca, e cobranca.
- Entregar valor rapido para dono, gerente, e equipe enxuta.
- Tratar OTA, financeiro, e comunicacao como pilares do produto.

## Estado atual resumido

Hoje o DevInn ja cobre uma parte relevante do nucleo do PMS:

- autenticacao e multi-tenancy;
- gestao de quartos e categorias;
- reservas manuais;
- calendario de reservas;
- dashboard financeiro basico;
- despesas;
- integracoes via iCal;
- calculo de precificacao basica.

Os gaps mais importantes ainda sao:

- ausencia de CRM de hospedes;
- ausencia de fluxo operacional de check-in, check-out, e governanca;
- ausencia de integracao real com OTAs;
- financeiro ainda muito manual;
- relatorios e KPIs ainda insuficientes;
- permissoes e operacao por equipe ainda fracas.

## Principios para priorizacao

Antes de detalhar o roadmap, use estes principios para tomar decisoes:

1. Entregue primeiro o que reduz trabalho manual todos os dias.
2. Feche o ciclo operacional completo antes de abrir novos modulos.
3. Nao construa complexidade enterprise antes de validar uso em pousadas.
4. Trate OTA e distribuicao como estrategia de escala, nao como ponto de
   partida para inflar escopo.
5. Sempre que possivel, prefira integracoes e parceiros em vez de construir
   conectores proprietarios cedo demais.

## Roadmap passo a passo

### Etapa 1 - Fechar a base operacional do produto

**Objetivo:** deixar o sistema confiavel para uso diario sem gerar retrabalho
ou risco operacional.

#### Entregas

1. Corrigir regras criticas de integridade em reservas e quartos.
2. Impedir exclusao de quarto com reserva vinculada.
3. Revisar regras de status de reserva e pagamento.
4. Adicionar trilha minima de auditoria para alteracoes sensiveis.
5. Expor melhor erros de sincronizacao e conflitos.

#### Resultado esperado

O sistema deixa de ser apenas funcional e passa a ser seguro para operacao.

#### Dependencias

- nenhuma dependencia previa;
- esta etapa deve acontecer antes das demais.

---

### Etapa 2 - Fechar o fluxo operacional da pousada

**Objetivo:** suportar a rotina real da equipe.

#### Entregas

1. Criar fluxo de check-in.
2. Criar fluxo de check-out.
3. Criar status operacionais do quarto, como `cleaning`, `ready`, e
   `maintenance`.
4. Criar modulo de governanca com tarefas de limpeza e manutencao.
5. Permitir atribuicao de tarefas por colaborador.
6. Registrar observacoes operacionais por reserva e por quarto.

#### Resultado esperado

Recepcao e governanca conseguem operar pelo sistema, sem depender de WhatsApp,
papel, ou planilhas paralelas.

#### Dependencias

- Etapa 1 concluida;
- base de permissoes minimamente organizada.

---

### Etapa 3 - Criar a camada de hospede e relacionamento

**Objetivo:** parar de tratar o hospede como dado descartavel dentro da
reserva.

#### Entregas

1. Criar cadastro unico de hospede.
2. Vincular reservas ao historico do hospede.
3. Armazenar preferencias, observacoes, e dados recorrentes.
4. Exibir historico de estadias e gastos.
5. Permitir busca e reaproveitamento do hospede no fluxo de nova reserva.

#### Resultado esperado

A pousada reduz cadastro repetido, melhora atendimento, e comeca a construir
relacionamento com clientes recorrentes.

#### Dependencias

- Etapas 1 e 2 concluidas;
- ajustes no fluxo de reserva para usar o novo cadastro.

---

### Etapa 4 - Evoluir receita e precificacao

**Objetivo:** sair de uma precificacao estatica para uma precificacao mais
aderente ao negocio.

#### Entregas

1. Criar tarifas sazonais por periodo.
2. Criar regras de fim de semana e feriado.
3. Criar regras de antecedencia, estadia minima, e estadia longa.
4. Permitir override manual de tarifa com rastreio.
5. Exibir breakdown de calculo mais claro no frontend.

#### Resultado esperado

O DevInn deixa de ser apenas um registrador de reservas e passa a apoiar
decisoes de receita.

#### Dependencias

- Etapa 3 ajuda, mas nao bloqueia;
- calendario e reserva precisam consumir a nova engine de precificacao.

---

### Etapa 4A - Criar o canal direto de reservas

**Objetivo:** transformar o DevInn em um PMS que tambem gera reserva direta
para a pousada.

#### Contexto

Esse modulo nao deve nascer como um construtor completo de sites. A primeira
versao deve ser um motor de reservas diretas, com fluxo self-service para o
hospede reservar sem depender de Booking.com ou outro canal intermediario.

#### Entregas

1. Criar uma pagina publica de reservas hospedada pelo DevInn.
2. Exibir disponibilidade em tempo real por categoria ou quarto.
3. Exibir regras comerciais e valor final com clareza.
4. Permitir coleta de dados do hospede diretamente nessa jornada.
5. Integrar pagamento ou garantia de reserva por PIX, cartao, ou link de
   pagamento.
6. Criar confirmacao automatica e entrada imediata da reserva no PMS.
7. Permitir identidade visual da pousada, com subdominio ou dominio proprio.

#### Resultado esperado

O DevInn deixa de ser apenas um sistema de controle interno e passa a ser
tambem um canal de receita direta para a pousada.

#### Dependencias

- reservas e precificacao confiaveis;
- disponibilidade em tempo real;
- preferencialmente contas a receber minimamente estruturadas.

---

### Etapa 5 - Profissionalizar distribuicao e OTAs

**Objetivo:** sair da dependencia do iCal como principal mecanismo de
sincronizacao.

#### Contexto atual

Hoje o maior gap do produto e a ausencia de integracao real com OTAs. A
sincronizacao existente depende fortemente de iCal, o que resolve apenas uma
parte do problema:

- costuma sincronizar disponibilidade e bloqueios;
- nao cobre bem dados financeiros;
- nao cobre bem status de pagamento;
- nao oferece a mesma confiabilidade de APIs e webhooks;
- aumenta o risco de atraso de sincronizacao e overbooking.

#### Estrategia recomendada

**Fase 5A - Fortalecer o iCal atual**

1. Melhorar logs e historico de sincronizacao.
2. Exibir ultima sincronizacao com status visual.
3. Adicionar reprocessamento manual por integracao.
4. Exibir conflitos e reservas suspeitas para revisao manual.
5. Melhorar o mapeamento de quartos e mensagens de erro.

**Fase 5B - Criar uma camada interna de integracao**

1. Criar uma abstracao de canal, separando:
   - origem da reserva;
   - disponibilidade;
   - mapeamento de quarto;
   - sincronizacao;
   - erros e reconciliacao.
2. Padronizar eventos internos para reserva externa, cancelamento, bloqueio,
   e atualizacao.
3. Garantir que o frontend trate integracao como modulo proprio, nao como
   detalhe tecnico.

**Fase 5C - Integrar com um channel manager**

Quando a base de clientes justificar, o melhor caminho e integrar com um
channel manager, como o Channex, em vez de construir conectores diretos para
cada OTA logo no inicio.

Esse caminho tende a ser melhor porque:

- reduz o custo de manutencao de integracoes;
- acelera a entrada em novos canais;
- transfere parte da complexidade de distribuicao para um parceiro;
- deixa o time focado no core do PMS.

**Fase 5D - Avaliar conectores diretos apenas quando houver ROI claro**

Conectores diretos com Booking.com, Airbnb, e outros canais devem entrar
somente quando houver escala suficiente, demanda clara, e vantagem economica
sobre um parceiro como o Channex.

#### Resultado esperado

O DevInn evolui de um PMS com sincronizacao limitada para um PMS com estrategia
real de distribuicao.

#### Dependencias

- Etapa 1 concluida;
- modelo de reservas e auditoria mais robustos;
- UI de integracoes mais madura.

---

### Etapa 6 - Profissionalizar o financeiro

**Objetivo:** reduzir controle manual e aumentar previsibilidade de caixa.

#### Entregas

1. Criar contas a receber por reserva.
2. Separar melhor entrada, saldo, e inadimplencia.
3. Integrar pagamento online, comecando por PIX e link de pagamento.
4. Criar conciliacao basica por reserva.
5. Criar relatorios de receita bruta, liquida, comissoes OTA, e saldo a
   receber.

#### Resultado esperado

O dono da pousada consegue confiar no financeiro do sistema sem depender de
planilha externa.

#### Dependencias

- Etapa 5 ajuda muito quando OTAs trouxerem informacao financeira;
- etapa pode comecar antes da integracao com gateway estar completa.

---

### Etapa 7 - Criar a camada gerencial

**Objetivo:** transformar dados operacionais em decisao de negocio.

#### Entregas

1. Criar KPIs de ocupacao.
2. Criar KPIs de receita por canal.
3. Criar forecast de ocupacao e receita.
4. Criar visoes por periodo, categoria, e canal.
5. Criar exportacao de relatorios para PDF e planilha.

#### Resultado esperado

O DevInn passa a apoiar dono e gerente na leitura do negocio, nao apenas na
execucao da operacao.

#### Dependencias

- dados de reserva, pagamento, e canal mais confiaveis;
- etapa financeira mais madura.

---

### Etapa 8 - Estruturar operacao por equipe

**Objetivo:** suportar pousadas que ja nao operam com uma unica pessoa.

#### Entregas

1. Criar perfis de acesso por funcao.
2. Separar permissoes de recepcao, financeiro, governanca, e administracao.
3. Registrar acao por usuario.
4. Criar dashboards simplificados por perfil.

#### Resultado esperado

O produto deixa de depender de um unico usuario administrador e suporta uma
operacao mais profissional.

#### Dependencias

- Etapas 1 e 2 concluidas;
- auditoria minima implementada.

---

### Etapa 9 - Adicionar comunicacao com o hospede

**Objetivo:** reduzir atrito em momentos criticos da jornada.

#### Entregas

1. Confirmacao automatica de reserva.
2. Lembrete de check-in.
3. Mensagem de pre-estadia com instrucoes.
4. Mensagem de pos-estadia.
5. Canal inicial via WhatsApp e email.

#### Resultado esperado

A pousada reduz tarefas repetitivas e melhora a experiencia do hospede.

#### Dependencias

- CRM de hospedes;
- status operacionais confiaveis;
- opcionalmente gateway de pagamento para cobranca automatizada.

## Ordem recomendada de execucao

Se o time precisar de uma sequencia objetiva, siga esta ordem:

1. Estabilidade operacional e integridade de dados.
2. Check-in, check-out, e governanca.
3. Cadastro e historico de hospedes.
4. Precificacao sazonal e regras comerciais.
5. Canal direto de reservas.
6. Fortalecimento do iCal atual.
7. Camada de integracao de canais.
8. Integracao com channel manager, como Channex.
9. Financeiro mais robusto e cobranca.
10. Relatorios e camada gerencial.
11. Permissoes por equipe.
12. Comunicacao automatizada.

## Direcao arquitetural recomendada

### Recomendacao principal

A recomendacao para o proximo ciclo e manter o backend como um
**modular monolith**, e nao separar agora em varios microservicos.

Isso significa:

- um dominio unico;
- um deploy principal;
- modulos internos bem definidos;
- baixo acoplamento entre modulos;
- jobs e workers separados quando houver necessidade operacional.

### Por que essa e a melhor opcao agora

O produto ainda esta fechando o core de reservas, hospedes, operacao,
distribuicao, e financeiro. Separar cedo demais aumenta custo arquitetural
antes de o produto fechar suas regras principais.

O monolito modular permite:

- evoluir mais rapido;
- manter consistencia transacional;
- simplificar deploy e observabilidade;
- preservar fronteiras claras entre modulos;
- extrair partes depois, se isso realmente passar a fazer sentido.

### Estrutura sugerida

O formato atual, com projetos separados por responsabilidade, faz sentido e
deve ser mantido.

#### Estrutura recomendada

- `DevInn.Domain`
- `DevInn.Application`
- `DevInn.Infrastructure`
- `DevInn.WebApi`

No proximo passo, vale considerar apenas mais um projeto quando a carga
assincrona crescer:

- `DevInn.Worker`

Esse worker pode concentrar:

- sincronizacao OTA e iCal;
- notificacoes;
- emails;
- jobs agendados;
- reconciliacao;
- tarefas demoradas ou com retry.

### O que nao recomendo agora

#### Nao recomendo varios servicos atras de YARP neste momento

Usar varios servicos de API por tras de YARP agora tende a adicionar mais
complexidade do que valor:

- roteamento entre servicos;
- autenticacao entre componentes;
- contratos de API internos;
- observabilidade distribuida;
- deploy e troubleshooting mais complexos.

YARP pode fazer sentido mais tarde, mas nao como primeiro passo.

#### Nao recomendo colapsar tudo em um unico `csproj`

Tambem nao recomendo juntar tudo em um unico projeto .NET, porque voces ja tem
uma separacao boa entre dominio, aplicacao, infraestrutura, e API. O custo de
misturar tudo agora seria perder clareza arquitetural.

### Implementacao recomendada

#### Fase 1 - Um host principal e modulos internos

Manter um unico host HTTP em `DevInn.WebApi`, com modulos internos por dominio:

- Auth e Tenancy;
- Inns e Settings;
- Inventory;
- Bookings;
- Guests;
- Financial;
- Integrations;
- Operations;
- DirectBooking.

Cada modulo deve ter:

- endpoints;
- commands e queries;
- regras de aplicacao;
- persistencia e integracoes isoladas por responsabilidade.

#### Fase 2 - Separar carga assincrona

Criar `DevInn.Worker` para tirar do host principal tudo que for:

- sincronizacao com canais;
- processamento por fila;
- retry;
- envio de notificacoes;
- rotinas agendadas.

#### Fase 3 - Separar superficie publica, se necessario

Se o motor de reservas diretas crescer bastante, existem dois caminhos bons:

1. manter a API publica no mesmo `DevInn.WebApi`, usando rotas e politicas
   separadas, como `/api/public/booking-engine/...`;
2. criar depois um host especifico, como `DevInn.BookingPublicApi`, somente se
   houver necessidade clara de escala, seguranca, ou deploy separado.

### Minha sugestao objetiva

Se fosse para decidir hoje, eu faria assim:

1. manter os projetos `Domain`, `Application`, `Infrastructure`, e `WebApi`;
2. adicionar um modulo `DirectBooking` dentro da mesma arquitetura;
3. manter um unico host HTTP;
4. criar um `Worker` quando sincronizacao e notificacoes crescerem;
5. deixar YARP para um momento futuro, apenas se houver extracao real de hosts
   diferentes.

Essa abordagem e a mais enxuta, preserva clareza arquitetural, e combina melhor
com o estagio atual do DevInn.

## O que nao deve entrar agora

Para evitar dispersao, estes itens nao devem ser prioridade imediata:

- marketplace de integracoes;
- API publica ampla;
- multi-idioma;
- app nativo;
- modulos enterprise voltados para grandes redes;
- conectores diretos com varias OTAs ao mesmo tempo.
- varios servicos HTTP atras de YARP sem necessidade clara.

## Definicao de sucesso para o proximo ciclo

O proximo ciclo de produto deve ser considerado bem-sucedido quando o DevInn
atender estes pontos:

1. A pousada consegue operar reservas, check-in, check-out, e limpeza sem
   processo paralelo relevante.
2. O cadastro de hospedes deixa de ser repetitivo.
3. A pousada consegue capturar reserva direta em uma jornada self-service.
4. O iCal atual fica mais confiavel e auditavel.
5. A arquitetura fica pronta para integrar um channel manager.
6. O financeiro oferece leitura basica de caixa e saldo por reserva.

## Recomendacao final

O DevInn deve usar a Cloudbeds como referencia de maturidade, mas nao como
escopo imediato. O melhor caminho e construir profundidade no contexto de
pousadas pequenas e medias, principalmente no Brasil.

No tema de OTA, a recomendacao e clara:

1. corrigir e endurecer o fluxo atual com iCal;
2. preparar uma camada de integracao desacoplada;
3. integrar com um channel manager quando a base justificar;
4. avaliar integracoes diretas somente depois disso.

Esse caminho reduz risco tecnico, preserva foco de produto, e aumenta a chance
de chegar a um PMS vendavel antes de assumir uma complexidade de distribuicao
maior do que o time precisa hoje.
