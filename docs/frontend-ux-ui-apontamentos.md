# DevInn Frontend - Pontos de Atencao de UX/UI

Data: 2026-04-29

## Objetivo

Consolidar os principais pontos de atencao de UX/UI identificados no front-end do DevInn a partir da leitura do codigo atual. O foco desta analise esta em navegacao, estados de tela, responsividade, acessibilidade e fluidez dos fluxos operacionais.

## Resumo Executivo

O front-end tem uma base boa: estrutura por features, componentes compartilhados consistentes, tratamento global de erro e padrao visual relativamente uniforme. Os maiores gargalos atuais nao estao na fundacao tecnica, e sim na experiencia de uso em cenarios operacionais.

Os tres pontos mais relevantes hoje sao:

1. O estado sem pousada selecionada gera falsos vazios em varias telas e pode confundir o usuario.
2. As superficies mais importantes de operacao, especialmente calendario e tabelas, ainda exigem muito esforco em mobile.
3. O fluxo de criacao e edicao de reservas concentra informacao demais em uma unica modal longa.

## Prioridade Recomendada

1. Corrigir o estado sem pousada selecionada e os falsos vazios.
2. Revisar estados de vazio, loading e orientacao nas telas principais.
3. Melhorar a experiencia mobile em reservas, quartos e calendario.
4. Reestruturar o fluxo de criacao de reserva em etapas.
5. Refinar navegacao, hierarquia e contexto do cabecalho.

## Apontamentos

### 1. Estado sem pousada selecionada gera falsos vazios

Impacto:

Quando o usuario esta autenticado, mas ainda nao definiu a pousada ativa, o sistema nao deixa claro que falta contexto operacional. Em vez disso, algumas telas sugerem que nao ha dados cadastrados.

Evidencias no codigo:

- O cabecalho ja explicita esse estado em `apps/web/src/shared/components/app-header.tsx`.
- O seletor de pousada existe em `apps/web/src/features/inns/components/inn-selector.tsx`.
- As queries de dados dependem de `innId` em `apps/web/src/features/inventory/hooks/use-rooms.ts`, `apps/web/src/features/bookings/hooks/use-booking.ts` e `apps/web/src/features/financial/hooks/use-expenses.ts`.
- Mesmo assim, as telas caem em estados genericos como "Nenhuma reserva cadastrada", "Nenhum quarto cadastrado" e "Sem dados para este periodo".

Risco de UX:

O usuario pode interpretar que o sistema esta vazio, quando na pratica falta apenas selecionar uma pousada.

Recomendacoes:

- Criar um estado especifico de "Selecione uma pousada para continuar".
- Bloquear acoes transacionais enquanto nao houver pousada ativa.
- Diferenciar claramente "sem contexto" de "sem dados".
- Exibir CTA direto para abrir o seletor de pousada nas telas principais.

### 2. Navegacao funcional, mas com pouca hierarquia informacional

Impacto:

O usuario consegue navegar, mas recebe pouca orientacao sobre o modulo atual, a relacao entre telas e a proxima acao recomendada.

Evidencias no codigo:

- O menu lateral e uma lista plana em `apps/web/src/shared/constants/menu-items.ts`.
- O cabecalho atual mostra essencialmente o nome da pousada, toggle de tema e badge de ambiente em `apps/web/src/shared/components/app-header.tsx`.

Risco de UX:

Em uso recorrente, a interface fica correta tecnicamente, mas pouco orientadora. Isso pesa mais em perfis operacionais que alternam entre reservas, quartos e financeiro.

Recomendacoes:

- Agrupar a navegacao por dominios como Operacao, Cadastros e Financeiro.
- Adicionar breadcrumb ou contexto de pagina.
- Usar o cabecalho para expor filtros e contexto relevante da tela atual.
- Dar mais destaque para a acao principal de cada pagina.

### 3. Experiencia mobile fragilizada nas telas operacionais

Impacto:

As telas mais importantes ainda dependem de tabela com scroll horizontal, colunas escondidas por breakpoint e interacoes densas.

Evidencias no codigo:

- Reservas usa tabela com scroll horizontal em `apps/web/src/features/bookings/pages/bookings-page.tsx`.
- Quartos usa tabela com scroll horizontal em `apps/web/src/features/inventory/pages/rooms-page.tsx`.
- O calendario trabalha com area rolavel extensa em `apps/web/src/features/bookings/components/calendar-grid.tsx`.

Risco de UX:

No celular, a leitura exige mais esforco, a comparacao entre registros piora e a perda de colunas prejudica tomada de decisao rapida.

Recomendacoes:

- Criar versao em cards para reservas e quartos no mobile.
- Limitar tabelas completas aos breakpoints maiores.
- Criar uma visao mais simplificada do calendario para mobile.
- Priorizar densidade de informacao menor em telas pequenas.

### 4. Calendario de reservas depende demais de hover e cor

Impacto:

O calendario e a superficie central do produto, mas hoje parte importante da interacao depende de hover, leitura por cor e clique preciso.

Evidencias no codigo:

- A barra de reserva e interativa, mas foi implementada como elemento nao semantico em `apps/web/src/features/bookings/components/reservation-bar.tsx`.
- O conteudo adicional depende de `title`.
- As acoes rapidas aparecem apenas no hover.
- A celula do calendario e compacta para criacao de reservas em `apps/web/src/features/bookings/components/calendar-grid.tsx`.

Risco de UX:

Touch, teclado e leitores de tela ficam em desvantagem. Alem disso, a distincao de status pode depender demais de cor.

Recomendacoes:

- Transformar a barra da reserva em um botao semantico.
- Exibir status e contexto sem depender apenas de hover.
- Substituir acoes de hover por menu contextual ou painel lateral.
- Aumentar a tolerancia de toque e o feedback visual de foco.

### 5. Fluxo de criacao de reserva esta denso demais

Impacto:

Hoje o fluxo de reserva pede muitas decisoes dentro de uma unica modal longa, o que aumenta carga cognitiva e fadiga de preenchimento.

Evidencias no codigo:

- A modal de reserva ocupa uma area grande com rolagem vertical em `apps/web/src/features/bookings/pages/bookings-page.tsx` e `apps/web/src/features/bookings/components/booking-calendar.tsx`.
- O formulario concentra informacoes de reserva, hospede e pagamento em `apps/web/src/features/bookings/components/booking-form.tsx`.
- O produto ja possui um padrao mais amigavel no cadastro de quartos com stepper em `apps/web/src/features/inventory/components/room-form-sheet.tsx` e `apps/web/src/features/inventory/components/room-stepper.tsx`.

Risco de UX:

O fluxo exige muito contexto simultaneo e aumenta a chance de erro, abandono ou preenchimento incompleto.

Recomendacoes:

- Quebrar a reserva em etapas curtas.
- Manter um resumo fixo de periodo, quarto e valor.
- Levar o fluxo para sheet ou tela dedicada em mobile.
- Reaproveitar o padrao de stepper ja existente no modulo de quartos.

### 6. Estados vazios existem, mas ainda nao ensinam o proximo passo

Impacto:

As telas informam ausencia de dados, mas geralmente nao orientam a proxima acao mais util.

Evidencias no codigo:

- Existem mensagens simples de vazio em reservas, quartos, categorias e integracoes.
- As mensagens tendem a ser descritivas, mas nao acopladas a um CTA forte.

Risco de UX:

O usuario para no estado vazio sem clareza de como seguir, especialmente quando ainda esta configurando o sistema.

Recomendacoes:

- Diferenciar "sem dados", "sem resultado para o filtro" e "sem contexto selecionado".
- Incluir CTA contextual em todos os empty states principais.
- Usar texto que explique causa provavel e proxima acao esperada.

### 7. Loading esta melhor nas listagens do que na tela principal de operacao

Impacto:

A home operacional do produto nao comunica carregamento tao bem quanto outras telas de listagem.

Evidencias no codigo:

- O calendario consome dados em `apps/web/src/features/bookings/components/booking-calendar.tsx`.
- As paginas de listagem usam `LoadingOverlay` e skeleton com mais consistencia.

Risco de UX:

O usuario pode interpretar demora como falha, especialmente na tela inicial de reservas.

Recomendacoes:

- Adicionar skeleton estrutural para o calendario.
- Distinguir loading inicial de refetch em background.
- Evitar mudancas bruscas de layout durante carregamento.

### 8. Seletor de periodo pode ser mais orientado a uso recorrente

Impacto:

O date range picker atende ao fluxo tecnico, mas ainda exige interacao excessiva para cenarios repetitivos.

Evidencias no codigo:

- O componente esta em `apps/web/src/shared/components/date-range-picker.tsx`.
- O label vazio e generico e o componente alterna a quantidade de meses conforme largura da tela.

Risco de UX:

Usuarios que consultam continuamente periodos padrao fazem mais cliques do que o necessario.

Recomendacoes:

- Adicionar atalhos como Hoje, Esta semana, Este mes e Proximos 30 dias.
- Exibir periodo ativo com mais clareza no topo da tela.
- Considerar presets operacionais nos modulos de reservas e financeiro.

## Criterios de Sucesso

- O usuario entende imediatamente quando falta selecionar uma pousada.
- As telas principais explicam com clareza o proximo passo.
- O uso em mobile deixa de depender de scroll horizontal como padrao principal.
- O calendario passa a funcionar melhor em touch, teclado e leitura assistiva.
- O fluxo de reserva reduz carga cognitiva e tempo de conclusao.

## Proximos Passos Sugeridos

1. Transformar este documento em backlog priorizado por impacto x esforco.
2. Definir wireframes para o estado sem pousada selecionada e para os empty states principais.
3. Redescrever o fluxo de reserva em etapas com base no padrao ja usado em quartos.
4. Prototipar uma experiencia mobile especifica para calendario e listagens.
