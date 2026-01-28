# Integração Booking.com (iCal + Inbound Email via Resend)

**Objetivo:** permitir uma experiência de “reservas automáticas” **sem Channel Manager** e sem Booking Connectivity API, usando:
- **iCal** como fonte de **bloqueios de disponibilidade** (VEVENT “CLOSED - Not available”)
- **Inbound emails** (confirmações do Booking.com) como fonte dos **detalhes** da reserva (hóspede, valores, código, etc.)

> Premissa: o iCal do Booking.com costuma **não trazer PII**/detalhes. O e-mail de confirmação é a melhor fonte de dados “barata” para completar a reserva.

---

## 1. Visão geral (arquitetura)

```mermaid
flowchart LR
  BookingICal[Booking.com iCal] -->|poll/refresh| DevInnSync[iCal Sync]
  DevInnSync -->|cria/atualiza| Block[Bloqueio Externo]

  BookingEmail[Booking.com Emails] --> Gmail[Gmail da pousada]
  Gmail -->|filtro+encaminhamento| ResendInbound[Resend Inbound]
  ResendInbound -->|webhook email.received| DevInnWebhook[DevInn Webhook]
  DevInnWebhook --> Parser[Parser/Extractor]
  Parser -->|cria/atualiza| Draft[Reserva OTA (rascunho)]
  Draft --> Matcher[Matching com Bloqueio]
  Matcher -->|sucesso| Booking[Reserva Confirmada]
  Matcher -->|falha| Review[Fila de Revisão]
```

**Resultado:**
- O calendário/Gantt sempre reflete **indisponibilidade real** via iCal (evita overbooking).
- Quando chega o e-mail, o DevInn promove o bloqueio para uma **reserva completa**, com dados de hóspede e financeiros.

---

## 2. Setup no Resend (Inbound)

### 2.1 Criar “Receiving” no Resend
1. No dashboard do Resend, habilite **Receiving / Inbound Emails**.
2. Escolha um endereço de recebimento:
   - **Mais simples (recomendado):** usar um endereço do tipo `*@<algo>.resend.app` (não exige DNS/MX do cliente).
   - **Opcional (mais “bonito”):** usar domínio/subdomínio próprio para inbound (ex.: `inbound.seudominio.com`) — exige configurar **MX records** conforme o Resend informar.

> Para Gmail + encaminhamento, normalmente o endereço `resend.app` já é suficiente.

### 2.2 Configurar Webhook
1. Em **Webhooks**, crie um webhook apontando para o DevInn (ex.: `https://api.devinn.com/api/webhooks/resend/inbound/booking`).
2. Selecione o evento **`email.received`** (nome pode variar; validar no dashboard).
3. Configure o secret/assinatura (quando disponível) para validação.

### 2.3 Requisitos do endpoint
- Responder **2xx** rapidamente.
- Persistir payload (ou enfileirar) e processar async.
- Logar falhas de parsing/matching com correlação (message-id/email_id).

---

## 3. Setup no Gmail do cliente

### 3.1 Preparar o e-mail
Recomendação: criar um endereço dedicado, ex.: `reservas@seudominio.com` (Gmail/Google Workspace).

### 3.2 Encaminhamento
1. No Gmail: **Configurações → Encaminhamento e POP/IMAP → Adicionar um endereço de encaminhamento**.
2. Adicione o endereço inbound do Resend (ex.: `booking-inbound@<algo>.resend.app`).
3. Confirme o encaminhamento (o Gmail envia um e-mail de confirmação; **essa etapa precisa ser feita**).

### 3.3 Filtro para encaminhar só o Booking
1. No Gmail: **Configurações → Filtros e endereços bloqueados → Criar novo filtro**.
2. Sugestão de critérios (ajustar conforme os e-mails reais):
   - `from:(booking.com)`
   - e/ou termos do assunto tipo `subject:("New reservation" OR "Reservation" OR "Confirmação" OR "Reserva")`
3. Ação do filtro:
   - ✅ **Encaminhar para** o endereço inbound do Resend
   - (Opcional) aplicar label `Booking`
   - (Opcional) pular caixa de entrada/arquivar

---

## 4. Modelo de dados e idempotência (recomendado)

### 4.1 Tabela/coleção `inbound_email`
Guardar o mínimo necessário para auditoria e reprocessamento:
- `provider`: `resend`
- `email_id` (do Resend)
- `message_id` (RFC822, se disponível)
- `from`, `to`, `subject`, `received_at`
- `raw_text` (texto plain)
- `raw_html` (opcional)
- `raw_payload_json`
- `status`: `received | parsed | matched | needs_review | failed`

**Idempotência:**
- Chave única por `email_id` (Resend) e/ou `message_id`.
- Se o mesmo e-mail chegar mais de uma vez, não duplicar reserva.

### 4.2 Entidade `ota_reservation` / extensão de `booking`
Campos úteis:
- `source`: `booking_email`
- `external_reservation_code` (se extraído do e-mail)
- `guest_name`, `guest_email`, `guest_phone` (quando existir)
- `check_in` (date), `check_out` (date)
- `total_amount`, `currency`, `commission` (se houver)
- `raw_reference`: link/ID do inbound_email

---

## 5. Parsing (extração) dos e-mails

### 5.1 Estratégia em camadas
1. **Text/plain primeiro**: mais estável para regex.
2. Fallback: converter HTML → texto (preservar quebras) e aplicar as mesmas regras.
3. Se falhar: criar item em **Fila de Revisão** com campos pré-preenchidos (datas, canal) e pedir 1 clique do usuário.

### 5.2 Campos mínimos para “reserva automática”
- `check_in` e `check_out`
- `nome do hóspede` (quando existir)
- `código/número da reserva` (quando existir)

> Mesmo sem código da reserva, dá para casar por datas + canal; o código melhora muito a confiabilidade.

### 5.3 Regras práticas (heurísticas)
- Normalizar datas para o fuso da pousada (ex.: `America/Sao_Paulo`) e armazenar como **date** (não datetime) para evitar confusão com date-only.
- Aceitar múltiplos idiomas (pt/en/es) nos rótulos; manter um dicionário de padrões, ex.:
  - `Check-in|Entrada|Llegada`
  - `Check-out|Saída|Salida`
  - `Guest|Hóspede|Cliente`
  - `Reservation number|Número da reserva|Número de reserva`

---

## 6. Matching: e-mail ↔ bloqueio iCal

Como o iCal geralmente só traz `UID`, `SUMMARY` e datas, o matching deve ser tolerante:

### 6.1 Matching automático (ordem recomendada)
1. Se o e-mail tiver **código da reserva** e você guardar isso na reserva, usar como chave principal.
2. Caso contrário: buscar bloqueios `source=booking_ical` que tenham:
   - `start == check_in` e `end == check_out` (lembrando que `DTEND` em iCal date-only é **dia de checkout**, não noite extra)
3. Se houver múltiplos candidatos (múltiplos quartos):
   - marcar como `needs_review` e pedir para o usuário escolher o quarto/reserva correta.

### 6.2 Conflitos / overbooking
- Se o iCal indicar bloqueio e já existe reserva interna no mesmo período/quarto, gerar alerta:
  - “Conflito com bloqueio externo (Booking)”
  - sugerir ação: trocar quarto, ajustar datas, ou manter bloqueio.

---

## 7. Segurança e conformidade

- **Validar origem do webhook** (assinatura/secret do Resend quando disponível).
- **PII**: criptografar em repouso (ou pelo menos limitar acesso), evitar logar corpo do e-mail em logs de aplicação.
- Retenção: definir política (ex.: manter `raw_payload` por X dias para debug; depois manter somente campos extraídos).

---

## 8. Operação e observabilidade

### 8.1 Retentativas
- Webhooks podem falhar; o endpoint deve ser rápido e resiliente.
- Se o processamento for assíncrono, **retornar 2xx** após enfileirar.

### 8.2 Métricas recomendadas
- `inbound_emails_received`
- `% parsed_success`
- `% matched_success`
- `needs_review_count`
- tempo médio do parsing

### 8.3 Tela de “Revisão rápida” (UX)
Quando `needs_review`:
- mostrar datas e um “match provável”
- permitir selecionar quarto/reserva com 1 clique
- permitir preencher campos faltantes (nome, valor) em formulário curto

---

## 9. Checklist de implementação

- [ ] Criar endpoint webhook `POST /api/webhooks/resend/inbound/booking`
- [ ] Validar assinatura/secret (quando aplicável)
- [ ] Persistir `inbound_email`
- [ ] Implementar parser (plain → html fallback)
- [ ] Implementar matching com bloqueios iCal
- [ ] Implementar fila/status `needs_review`
- [ ] Criar instruções para o cliente configurar filtro/encaminhamento no Gmail
- [ ] Testar com e-mails reais (pt/en) e monitorar taxa de sucesso

---

## Referências
- Resend: Receiving / Inbound Emails
  - https://resend.com/docs/dashboard/receiving/introduction
- Resend: Inbound Emails (visão geral)
  - https://resend.com/blog/inbound-emails
