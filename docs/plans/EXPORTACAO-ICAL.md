# Plano de Implementação: Export iCal de Reservas

## Contexto
Implementar funcionalidade de exportação de reservas no formato iCal (RFC 5545) para permitir que outras plataformas importem disponibilidade de quartos do DevInn. Reservas que foram importadas de outros iCals não devem ser exportadas (evitar loops infinitos e duplicações).

## Requisitos Confirmados
1. **URL pública com token único** por quarto (sem necessidade de autenticação JWT)
2. **Filtrar reservas**: exportar apenas `Manual` e `DirectWebsite`, excluindo `BookingIcal` e `AirbnbIcal`
3. **Privacidade**: summary genérico "Reservado" (sem dados pessoais/PII)
4. **Granularidade**: um iCal feed por quarto (não por pousada)

## Arquitetura e Design

### 1. Domain Layer (Agregado Room)
- Adicionar propriedade `ICalExportToken` ao agregado `Room`
- Criar ValueObject `ICalExportToken` para encapsular lógica de geração e validação
- Token deve ser único, criptograficamente seguro (32+ chars), e imutável após criação

### 2. Application Layer
#### Query: `GetRoomICalFeedQuery`
- **Input**: `roomId` ou `exportToken`
- **Output**: lista de `ICalEventDto` prontos para serialização
- **Lógica**:
  - Validar token e buscar quarto correspondente
  - Buscar reservas do quarto com filtro `Source NOT IN (BookingIcal, AirbnbIcal)`
  - Mapear para DTOs com summary genérico "Reservado"
  - Aplicar janela temporal (ex: -30 dias até +365 dias)

#### Service: `IICalExportService`
- **Método**: `GenerateICalFeedAsync(Guid roomId, CancellationToken)`
- **Responsabilidade**: converter lista de eventos para string iCal (RFC 5545)
- **Implementação**: usar biblioteca `Ical.Net` (já utilizada no import)

### 3. Infrastructure Layer
#### ICalExportService
- Implementar interface usando `Ical.Net`
- Criar `Calendar` com metadata:
  - `PRODID`: `-//DevInn//Booking Calendar//PT`
  - `VERSION`: `2.0`
  - `CALSCALE`: `GREGORIAN`
  - `X-WR-CALNAME`: "DevInn - {Nome do Quarto}"
  - `X-WR-TIMEZONE`: "America/Sao_Paulo"
- Converter cada reserva em `VEVENT`:
  - `UID`: usar `BookingId` (Guid)
  - `SUMMARY`: "Reservado"
  - `DTSTART`: `CheckIn` (DATE-only, não datetime)
  - `DTEND`: `CheckOut` (DATE-only)
  - `STATUS`: `CONFIRMED` (ou `CANCELLED` se aplicável)
  - `TRANSP`: `OPAQUE` (bloqueia disponibilidade)

### 4. Web API Layer
#### Endpoint: `GET /api/ical/{exportToken}`
- **Público** (sem [Authorize])
- **Rate limiting**: 100 req/hora por token
- **Cache**: considerar cache de 5-15 minutos (Header `Cache-Control`)
- **Content-Type**: `text/calendar; charset=utf-8`
- **Response Headers**:
  - `Content-Disposition`: `inline; filename="room-{roomId}.ics"`
  - `Cache-Control`: `public, max-age=300` (5 min)

### 5. Database Migration
- Adicionar coluna `ical_export_token` (VARCHAR(64), UNIQUE, NOT NULL) na tabela `rooms`
- Gerar tokens para quartos existentes via migration
- Criar índice único em `ical_export_token` para performance

### 6. Frontend (apps/web)
#### Tela: Integrations ou Room Details
- Exibir URL do iCal feed: `https://api.devinn.com/api/ical/{token}`
- Botão "Copiar URL" com feedback visual
- Botão "Regenerar Token" (com confirmação) para segurança
- Tooltip explicativo sobre o uso (importar no Airbnb, Booking.com, etc.)

## Workplan

### Backend (.NET/C#)
- [ ] **Domain**: Criar `ICalExportToken` ValueObject com validação e geração
- [ ] **Domain**: Adicionar propriedade `ICalExportToken` ao `Room` aggregate
- [ ] **Domain**: Adicionar método `RegenerateICalExportToken()` no `Room`
- [ ] **Application**: Criar interface `IICalExportService`
- [ ] **Application**: Criar `GetRoomICalFeedQuery` e `GetRoomICalFeedHandler`
- [ ] **Infrastructure**: Implementar `ICalExportService` usando `Ical.Net`
- [ ] **Infrastructure**: Adicionar migration para coluna `ical_export_token`
- [ ] **Infrastructure**: Atualizar `RoomConfiguration` (EF Core) para mapear o token
- [ ] **WebAPI**: Criar `ICalController` com endpoint `GET /api/ical/{exportToken}`
- [ ] **WebAPI**: Configurar rate limiting no endpoint público
- [ ] **Application**: Criar comando `RegenerateRoomICalTokenCommand` (opcional, para UI)

### Frontend (React/TypeScript)
- [ ] **Types**: Adicionar `iCalExportToken` ao tipo `Room`
- [ ] **Service**: Adicionar método `getRoomICalUrl(roomId)` ou `getRoomDetails(roomId)`
- [ ] **Component**: Criar `ICalExportCard` para exibir URL + copiar + regenerar
- [ ] **Integration**: Adicionar `ICalExportCard` na página de Integrations ou Room Details

### Testing & Validation
- [ ] **Unit Tests**: `ICalExportToken` ValueObject (validação, geração, igualdade)
- [ ] **Unit Tests**: `ICalExportService` (geração correta do formato iCal)
- [ ] **Integration Tests**: Endpoint GET `/api/ical/{token}` retorna iCal válido
- [ ] **Integration Tests**: Validar filtro de BookingSource (excluir iCal imports)
- [ ] **Manual Test**: Importar iCal gerado em Google Calendar ou Booking.com
- [ ] **Security Test**: Token inválido retorna 404 (não 401, para não revelar existência)
- [ ] **Performance Test**: Rate limiting funciona corretamente

## Considerações de Segurança

### Token Management
- Token deve ser **opaco** (não revelar roomId ou innId)
- Usar `Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))` ou similar
- Não logar tokens em logs de aplicação
- Considerar rotação de tokens a cada X meses (opcional)

### Privacy (LGPD/GDPR)
- **Nunca** incluir PII no iCal exportado:
  - ❌ Nome do hóspede
  - ❌ Email, telefone
  - ❌ CPF, documento
  - ❌ Valores financeiros
- ✅ Apenas `SUMMARY: "Reservado"` e datas

### Rate Limiting
- Prevenir scraping/DoS
- Sugestão: 100 req/hora por token (ajustar conforme necessidade)
- Considerar Cloudflare ou middleware ASP.NET Core Rate Limiting

## Considerações de Performance

### Caching
- iCal feed raramente muda (apenas quando cria/atualiza/cancela reserva)
- Implementar cache de 5-15 minutos (balancear freshness vs load)
- Usar ETag/If-None-Match para cache client-side (opcional)

### Query Optimization
- Índice em `ical_export_token` (UNIQUE)
- Filtrar por `Source` e limitar janela temporal (-30d até +365d)
- Projeção: buscar apenas campos necessários (StayPeriod, Status, Source)

### Pagination
- Não aplicável (iCal é um arquivo único)
- Se houver muitas reservas (>1000), considerar limitar janela temporal

## Edge Cases & Error Handling

1. **Token inválido**: retornar `404 Not Found` (não revelar se token existe ou não)
2. **Quarto sem reservas**: retornar iCal vazio válido (com metadata da pousada)
3. **Reservas canceladas**: incluir com `STATUS:CANCELLED` ou excluir? (decisão: excluir)
4. **Bloqueios (Guest = null)**: incluir no export (são reservas válidas)
5. **Timezone**: sempre usar `America/Sao_Paulo` (ou pegar da inn)
6. **Date vs DateTime**: usar DATE-only para check-in/check-out (evitar problemas de timezone)

## Documentação
- [ ] Atualizar `docs/INTEGRACAO-BOOKING-ICAL-OUTBOUND.md` (novo arquivo)
- [ ] Adicionar exemplo de uso na documentação da API (Swagger)
- [ ] Screenshot/tutorial no frontend de como copiar URL do iCal

## Notas Técnicas

### iCal Format (RFC 5545)
```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DevInn//Booking Calendar//PT
CALSCALE:GREGORIAN
X-WR-CALNAME:DevInn - Quarto Deluxe
X-WR-TIMEZONE:America/Sao_Paulo

BEGIN:VEVENT
UID:a1b2c3d4-e5f6-7890-1234-567890abcdef
DTSTART;VALUE=DATE:20260205
DTEND;VALUE=DATE:20260208
SUMMARY:Reservado
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT

END:VCALENDAR
```

### Bibliotecas Utilizadas
- **Ical.Net**: já usada no import, reaproveitar
- **System.Security.Cryptography**: para geração de token seguro
- **ASP.NET Core Rate Limiting**: middleware nativo (.NET 7+)

## Critérios de Sucesso
1. ✅ iCal gerado é importável por Google Calendar, Booking.com, Airbnb
2. ✅ Reservas de origem iCal (BookingIcal, AirbnbIcal) NÃO aparecem no export
3. ✅ Nenhum dado pessoal (PII) é exposto
4. ✅ Token é único, seguro e não expõe IDs internos
5. ✅ Endpoint responde em <500ms (90th percentile)
6. ✅ Rate limiting protege contra abuso

## Estimativa de Complexidade
- **Backend**: Médio (reuso de Ical.Net facilita)
- **Frontend**: Baixo (apenas exibir URL e copiar)
- **Testing**: Médio (validar formato iCal requer ferramentas externas)
- **Documentação**: Baixo

## Próximos Passos
Após aprovação do plano, começar implementação pela seguinte ordem:
1. Domain (ValueObject + aggregate update)
2. Application (Query + Service interface)
3. Infrastructure (Service impl + Migration)
4. Web API (Controller + Rate limiting)
5. Frontend (UI component)
6. Testing e validação manual
