# 🕐 Timezone & DateTimeOffset - Boas Práticas DevInn

## 📋 Decisões de Arquitetura

### ✅ O que implementamos e por quê

#### 1. **Banco de Dados: Sempre UTC**
```sql
-- PostgreSQL armazena timestamp with time zone em UTC
CREATE TABLE bookings (
    check_in timestamp with time zone,  -- Armazena em UTC
    check_out timestamp with time zone  -- Armazena em UTC
);
```

**Motivos:**
- ✅ Evita problemas com horário de verão
- ✅ Facilita comparações e ordenação
- ✅ Padrão internacional
- ✅ Preparado para multi-timezone

#### 2. **Domínio: DateTimeOffset**
```csharp
public readonly record struct StayPeriod
{
    public DateTimeOffset CheckIn { get; private init; }  // Preserva offset original
    public DateTimeOffset CheckOut { get; private init; }
}
```

**Motivos:**
- ✅ Preserva contexto do timezone original
- ✅ Melhor para multi-tenant com diferentes timezones
- ✅ Permite converter para timezone do hotel ao exibir

#### 3. **Conversão Automática: ValueConverter**
```csharp
// ApplicationDbContext.cs
protected override void ConfigureConventions(ModelConfigurationBuilder config)
{
    // Converte automaticamente DateTimeOffset para UTC ao persistir
    config.Properties<DateTimeOffset>().HaveConversion<DateTimeOffsetToUtcConverter>();
}
```

**Fluxo:**
```
Cliente (Brasília)     API (Domain)           PostgreSQL
-03:00        ────>   DateTimeOffset   ────>   UTC (+00:00)
                      2026-01-16T19:00         2026-01-16T22:00
```

---

## 🎯 Como Usar na Prática

### ✅ **Recebendo Datas do Cliente**

```csharp
// Cliente envia (Brasília -03:00)
POST /api/v1/bookings
{
  "checkIn": "2026-01-20T14:00:00-03:00",  // 14h em Brasília
  "checkOut": "2026-01-22T12:00:00-03:00"  // 12h em Brasília
}

// API recebe como DateTimeOffset
public sealed record CreateBookingCommand(
    DateTimeOffset CheckIn,   // Preserva offset: 2026-01-20T14:00:00-03:00
    DateTimeOffset CheckOut   // Preserva offset: 2026-01-22T12:00:00-03:00
);
```

### ✅ **Validações de Data**

```csharp
// CORRETO: Comparar em UTC
RuleFor(x => x.CheckIn)
    .GreaterThanOrEqualTo(DateTimeOffset.UtcNow.Date)  // Usa UTC para validar
    .WithMessage("Data de check-in não pode ser no passado.");

// CORRETO: Comparações relativas (independem de timezone)
RuleFor(x => x.CheckIn)
    .LessThan(x => x.CheckOut)  // Funciona corretamente mesmo com offsets diferentes
    .WithMessage("Check-in deve ser antes do check-out.");
```

### ✅ **Salvando no Banco**

```csharp
// ValueConverter converte automaticamente para UTC
var stay = new StayPeriod(command.CheckIn, command.CheckOut);
var booking = new Booking(..., stay, ...);

await repository.AddAsync(booking);  
// ✅ Salva no banco em UTC automaticamente
// CheckIn:  2026-01-20T17:00:00+00:00 (era 14h -03:00)
// CheckOut: 2026-01-22T15:00:00+00:00 (era 12h -03:00)
```

### ✅ **Queries e Comparações**

```csharp
// CORRETO: Converter parâmetros para UTC antes de comparar
public async Task<bool> HasOverlappingAsync(
    Guid roomId, 
    DateTimeOffset checkIn, 
    DateTimeOffset checkOut)
{
    var checkInUtc = checkIn.ToUniversalTime();   // Normaliza para UTC
    var checkOutUtc = checkOut.ToUniversalTime();
    
    return await dbContext.Bookings.AnyAsync(b =>
        b.RoomId == roomId &&
        b.StayPeriod.CheckIn < checkOutUtc &&    // Compara UTC com UTC
        b.StayPeriod.CheckOut > checkInUtc);
}
```

### ✅ **Retornando ao Cliente (Futuro)**

```csharp
// Opção 1: Retornar em UTC e deixar o frontend converter
GET /api/v1/bookings/123
{
  "checkIn": "2026-01-20T17:00:00Z",  // UTC
  "checkOut": "2026-01-22T15:00:00Z"  // UTC
}

// Opção 2: Converter para timezone do hotel
var hotelTimeZone = TimeZoneInfo.FindSystemTimeZoneById(inn.TimeZoneId);
var checkInLocal = TimeZoneInfo.ConvertTime(booking.StayPeriod.CheckIn, hotelTimeZone);

{
  "checkIn": "2026-01-20T14:00:00-03:00",  // Timezone do hotel
  "checkOut": "2026-01-22T12:00:00-03:00"
}
```

---

## ⚠️ Armadilhas Comuns

### ❌ **ERRADO: Não converter para UTC em queries**
```csharp
// ❌ ERRO: Compara DateTimeOffset com offset diferente diretamente
var checkIn = DateTimeOffset.Parse("2026-01-20T14:00:00-03:00");
var result = await dbContext.Bookings
    .Where(b => b.StayPeriod.CheckIn == checkIn)  // ERRO: Npgsql rejeita offset != 0
    .ToListAsync();
```

### ✅ **CORRETO: Converter para UTC antes**
```csharp
// ✅ Converte para UTC antes de usar na query
var checkInUtc = checkIn.ToUniversalTime();
var result = await dbContext.Bookings
    .Where(b => b.StayPeriod.CheckIn == checkInUtc)
    .ToListAsync();
```

### ❌ **ERRADO: Usar DateTime.Now**
```csharp
// ❌ DateTime.Now depende do servidor
RuleFor(x => x.CheckIn)
    .GreaterThanOrEqualTo(DateTime.Now);  // Timezone do servidor (não confiável)
```

### ✅ **CORRETO: Usar DateTimeOffset.UtcNow**
```csharp
// ✅ Sempre use UTC como referência
RuleFor(x => x.CheckIn)
    .GreaterThanOrEqualTo(DateTimeOffset.UtcNow);
```

---

## 🏨 Timezone por Hotel (Implementado)

Cada hotel agora tem seu timezone IANA:

```csharp
public sealed class Inn : Entity
{
    public string TimeZoneId { get; private set; } = "America/Sao_Paulo";
    // Outros: "America/New_York", "Europe/London", "Asia/Tokyo"...
}
```

**Uso futuro:**
```csharp
// Converter datas para o timezone do hotel ao exibir
var inn = await innRepository.GetByIdAsync(tenantId);
var tz = TimeZoneInfo.FindSystemTimeZoneById(inn.TimeZoneId);
var localCheckIn = TimeZoneInfo.ConvertTime(booking.StayPeriod.CheckIn, tz);
```

---

## 📊 Resumo das Regras

| Camada | Tipo | Offset | Quando Converter |
|--------|------|--------|------------------|
| **Cliente** | DateTimeOffset | Local (-03:00) | Ao enviar para API |
| **API/Domain** | DateTimeOffset | Preservado | N/A (ValueConverter cuida) |
| **PostgreSQL** | timestamp with time zone | UTC (+00:00) | Automático (ValueConverter) |
| **Queries** | DateTimeOffset | UTC (+00:00) | Antes de usar em WHERE/comparações |
| **Validações** | DateTimeOffset | UTC (+00:00) | Ao comparar com "agora" |
| **Response** | DateTimeOffset | UTC ou Local | Decisão de negócio |

---

## 🔧 Configuração Atual

### 1. **ValueConverter Global**
```csharp
// Aplica automaticamente a TODAS as propriedades DateTimeOffset
protected override void ConfigureConventions(ModelConfigurationBuilder config)
{
    config.Properties<DateTimeOffset>()
        .HaveConversion<DateTimeOffsetToUtcConverter>();
}
```

### 2. **Converter Personalizado**
```csharp
internal sealed class DateTimeOffsetToUtcConverter : ValueConverter<DateTimeOffset, DateTimeOffset>
{
    public DateTimeOffsetToUtcConverter()
        : base(
            v => v.ToUniversalTime(),  // Ao salvar: converte para UTC
            v => v.ToUniversalTime())  // Ao ler: já está em UTC
    {
    }
}
```

---

## 📚 Referências

- [PostgreSQL Timestamp with Time Zone](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [.NET DateTimeOffset Best Practices](https://learn.microsoft.com/en-us/dotnet/standard/datetime/choosing-between-datetime)
- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [Npgsql Date/Time Handling](https://www.npgsql.org/doc/types/datetime.html)

---

**Última atualização:** 2026-01-16
**Versão:** 1.0
