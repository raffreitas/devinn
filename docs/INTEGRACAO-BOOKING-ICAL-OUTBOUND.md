# Integração iCal - Exportação (Outbound)

**Status:** ✅ Implementado

## Contexto

Permitir que outras plataformas (Airbnb, Booking.com, Google Calendar, etc.) importem a disponibilidade dos quartos do DevInn através de feeds iCal (RFC 5545). Reservas que foram originalmente importadas de outros iCals **não são reexportadas** para evitar loops infinitos e duplicações.

---

## Arquitetura

### 1. Domain Layer

**ValueObject: `ICalExportToken`**
- Token criptograficamente seguro (43 caracteres, URL-safe)
- Gerado usando `RandomNumberGenerator.GetBytes(32)`
- Validação: mínimo 32 caracteres
- Imutável após criação

**Agregado: `Room`**
- Nova propriedade: `ICalExportToken ICalExportToken`
- Método: `RegenerateICalExportToken()` para renovar o token (segurança)

### 2. Application Layer

**Query: `GetRoomICalFeedQuery`**
- Input: `string ExportToken`
- Output: `string?` (conteúdo iCal ou null se token inválido)

**Service: `IICalExportService`**
- Método: `GenerateICalFeedAsync(string roomName, IEnumerable<ICalEventDto> events)`
- Converte eventos para formato iCal (RFC 5545)

**Handler: `GetRoomICalFeedHandler`**
- Busca quarto por token
- Filtra reservas:
  - `Source NOT IN (BookingIcal, AirbnbIcal)` ✅
  - `Status != Canceled`
  - Janela temporal: -30 dias até +365 dias
- Summary: "Reservado" (sem PII/dados pessoais)

### 3. Infrastructure Layer

**Implementation: `ICalExportService`**
- Usa biblioteca `Ical.Net`
- Metadata do calendário:
  - `PRODID`: `-//DevInn//Booking Calendar//PT`
  - `X-WR-CALNAME`: `DevInn - {Nome do Quarto}`
  - `X-WR-TIMEZONE`: `America/Sao_Paulo`
- Eventos (`VEVENT`):
  - `UID`: `{BookingId}` (Guid)
  - `SUMMARY`: `"Reservado"`
  - `DTSTART/DTEND`: DATE-only (não datetime)
  - `STATUS`: `CONFIRMED`
  - `TRANSP`: `OPAQUE` (bloqueia disponibilidade)

**Repository: `RoomRepository`**
- Novo método: `GetByICalExportTokenAsync(string token)`
- Query otimizada com `AsNoTracking()`

**EF Core Configuration**
- `ComplexProperty` para `ICalExportToken`
- Coluna: `ical_export_token` (VARCHAR(64), NOT NULL, UNIQUE)
- Migration `V0011_AddICalExportToken`:
  - Gera tokens para quartos existentes via SQL (`gen_random_bytes`)
  - Cria índice único: `ix_rooms_ical_export_token`

### 4. Web API Layer

**Endpoint: `GET /api/ical/{exportToken}`**
- **Público** (`.AllowAnonymous()`)
- Content-Type: `text/calendar; charset=utf-8`
- Response:
  - `200 OK`: iCal feed
  - `404 Not Found`: token inválido (não revela se token existe)
- **Rate limiting:** Recomendado (não implementado ainda)

---

## Frontend (React/TypeScript)

### Componente: `ICalExportCard`

**Localização:** `apps/web/src/features/inventory/components/ical-export-card.tsx`

**Features:**
- Exibe URL do feed iCal: `{API_URL}/api/ical/{token}`
- Botão "Copiar URL" com feedback visual (✓)
- Botão "Abrir no navegador" para testar o feed
- Instruções de uso (como integrar com outras plataformas)
- Alertas de segurança (não compartilhar publicamente)

### Integração: `RoomsPage`

**Localização:** `apps/web/src/features/inventory/pages/rooms-page.tsx`

**UX:**
- Botão de expansão (chevron) em cada linha da tabela
- Ao clicar, exibe `ICalExportCard` abaixo da linha
- Estado: `expandedRoomId` (apenas um quarto expandido por vez)

**Tipo atualizado:**
```typescript
export interface Room {
  // ...campos existentes
  iCalExportToken: string; // ✅ Adicionado
}
```

---

## Segurança e Privacidade

### Token Management
- ✅ Token opaco (não revela `roomId` ou `innId`)
- ✅ 43 caracteres URL-safe (Base64 sem `/`, `+`, `=`)
- ✅ Índice único no banco (evita duplicação)
- ⚠️ Rotação de tokens não implementada (futuro)

### Privacy (LGPD/GDPR)
- ✅ **Nenhum dado pessoal** no iCal exportado:
  - ❌ Nome do hóspede
  - ❌ Email, telefone, CPF
  - ❌ Valores financeiros
  - ✅ Apenas `SUMMARY: "Reservado"` + datas

### Rate Limiting
- ⚠️ **Não implementado** (pendente)
- Recomendação: 100 req/hora por token
- Considerar middleware ASP.NET Core Rate Limiting ou Cloudflare

---

## Performance

### Query Optimization
- ✅ Índice único em `ical_export_token`
- ✅ `AsNoTracking()` para queries read-only
- ✅ Filtro por `Source` (excluir iCal imports)
- ✅ Janela temporal (-30d até +365d) reduz volume de dados
- ✅ Projeção: apenas campos necessários (`check_in`, `check_out`, `status`)

### Caching
- ⚠️ **Não implementado** (pendente)
- Recomendação: Cache de 5-15 minutos (balancear freshness vs load)
- Considerar header `Cache-Control: public, max-age=300`

---

## Filtro de Reservas Exportadas

### Critérios (conforme requisito)
```sql
WHERE b.source NOT IN ('BookingIcal', 'AirbnbIcal')  -- ✅ Implementado
  AND b.status != 'Canceled'                          -- ✅ Implementado
  AND b.check_out >= @StartWindow                     -- ✅ Implementado (-30d)
  AND b.check_in <= @EndWindow                        -- ✅ Implementado (+365d)
```

### Lógica de Negócio
- ✅ **Exportar:** `Manual`, `DirectWebsite`, `BookingApi` (reservas internas)
- ❌ **Não exportar:** `BookingIcal`, `AirbnbIcal` (reservas importadas)
- **Motivo:** Evitar loops infinitos e duplicações entre plataformas

---

## Formato iCal (RFC 5545)

### Exemplo de Output
```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DevInn//Booking Calendar//PT
CALSCALE:GREGORIAN
X-WR-CALNAME:DevInn - Quarto 101
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

### Campos Importantes
- `DTSTART;VALUE=DATE`: date-only (não datetime) → evita problemas de timezone
- `DTEND;VALUE=DATE`: date-only, representa o dia de checkout (não noite extra)
- `TRANSP:OPAQUE`: bloqueia disponibilidade (não transparente)
- `STATUS:CONFIRMED`: reserva confirmada (ou `CANCELLED` se aplicável)

---

## Como Usar

### 1. Obter URL do iCal Feed
- Acessar **Quartos** no DevInn
- Clicar no botão de expansão (chevron) ao lado do quarto desejado
- Copiar a URL exibida no card "Exportar iCal"

### 2. Integrar com Outras Plataformas

#### Airbnb
1. Acessar **Calendário** → **Disponibilidade** → **Sincronizar calendários**
2. Colar a URL do iCal feed
3. Selecionar "Importar novo calendário"

#### Booking.com
1. Acessar **Calendário** → **Sincronização de calendários**
2. Colar a URL do iCal feed
3. Salvar configuração

#### Google Calendar
1. Acessar **Configurações** → **Adicionar calendário** → **Por URL**
2. Colar a URL do iCal feed
3. Calendário será atualizado automaticamente

---

## Testes

### Checklist
- ✅ Build backend (API compilou sem erros)
- ✅ Build frontend (web compilou sem erros)
- ⏳ **Pendente:** Run migrations no backend
- ⏳ **Pendente:** Testar endpoint manualmente (`curl` ou browser)
- ⏳ **Pendente:** Importar feed em Google Calendar ou Booking.com

### Comandos de Teste

#### 1. Rodar Migrations
```bash
cd apps/api/src/DevInn.WebApi
dotnet ef database update --project ../DevInn.Infrastructure
```

#### 2. Testar Endpoint
```bash
# Obter token de um quarto (via API ou banco)
curl -X GET "https://localhost:7000/api/ical/{exportToken}"

# Ou abrir no browser:
# https://localhost:7000/api/ical/{exportToken}
```

#### 3. Validar iCal
- Usar validador online: https://icalendar.org/validator.html
- Ou importar em Google Calendar para verificar se datas aparecem corretamente

---

## Melhorias Futuras (Não Implementadas)

### Rate Limiting
- Implementar middleware ASP.NET Core Rate Limiting
- Limite sugerido: 100 req/hora por token
- Prevenir scraping e DoS

### Cache
- Adicionar cache de 5-15 minutos no endpoint
- Header `Cache-Control: public, max-age=300`
- Considerar ETag/If-None-Match para cache client-side

### Regeneração de Token
- Comando: `RegenerateRoomICalTokenCommand`
- UI: Botão "Regenerar Token" com confirmação
- Use case: comprometimento de segurança

### Monitoramento
- Métricas: `ical_feed_requests_total`, `ical_feed_errors_total`
- Logs: requisições por token (sem logar o token completo)
- Alertas: spike de requisições (possível abuso)

### Webhook para Invalidação de Cache
- Quando criar/atualizar/cancelar reserva, invalidar cache do iCal feed
- Usar in-memory cache (`IMemoryCache`) ou Redis

---

## Referências

### Documentação
- **RFC 5545 (iCalendar):** https://datatracker.ietf.org/doc/html/rfc5545
- **Ical.Net Library:** https://github.com/ical-net/Ical.Net
- **ASP.NET Core Rate Limiting:** https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit

### Issues Relacionadas
- Importação iCal (inbound): `docs/INTEGRACAO-BOOKING-ICAL-INBOUND-EMAIL.md`
- Integração Booking.com: `docs/INTEGRACAO-BOOKING.md`

---

## Resumo de Arquivos Criados/Modificados

### Backend (C#)
- ✅ `DevInn.Domain/Aggregates/Inventory/ValueObjects/ICalExportToken.cs` (novo)
- ✅ `DevInn.Domain/Aggregates/Inventory/Room.cs` (modificado)
- ✅ `DevInn.Domain/Aggregates/Inventory/Abstractions/IRoomRepository.cs` (modificado)
- ✅ `DevInn.Application/Common/ICal/Abstractions/IICalExportService.cs` (novo)
- ✅ `DevInn.Application/Features/Inventory/Rooms/GetRoomICalFeed/GetRoomICalFeedQuery.cs` (novo)
- ✅ `DevInn.Application/Features/Inventory/Rooms/GetRoomICalFeed/GetRoomICalFeedHandler.cs` (novo)
- ✅ `DevInn.Application/Features/Inventory/Rooms/GetRooms/RoomResponse.cs` (modificado)
- ✅ `DevInn.Application/Features/Inventory/Rooms/GetRooms/GetRoomsHandler.cs` (modificado)
- ✅ `DevInn.Infrastructure/Integrations/ICalExportService.cs` (novo)
- ✅ `DevInn.Infrastructure/Persistence/Configurations/RoomConfiguration.cs` (modificado)
- ✅ `DevInn.Infrastructure/Persistence/Repositories/RoomRepository.cs` (modificado)
- ✅ `DevInn.Infrastructure/Persistence/DependencyInjection.cs` (modificado)
- ✅ `DevInn.Infrastructure/Persistence/Migrations/20260130164217_V0011_AddICalExportToken.cs` (novo)
- ✅ `DevInn.WebApi/Endpoints/ICal/GetRoomICalFeedEndpoint.cs` (novo)

### Frontend (React/TypeScript)
- ✅ `apps/web/src/features/inventory/types/index.ts` (modificado)
- ✅ `apps/web/src/features/inventory/components/ical-export-card.tsx` (novo)
- ✅ `apps/web/src/features/inventory/pages/rooms-page.tsx` (modificado)

### Documentação
- ✅ `docs/INTEGRACAO-BOOKING-ICAL-OUTBOUND.md` (este arquivo)

---

**Data de Implementação:** 2026-01-30  
**Desenvolvedor:** DevInn Team (via GitHub Copilot CLI)
