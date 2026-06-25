# Backup PostgreSQL Do DevInn

`apps/backup` e um app operacional para backups logicos do PostgreSQL. Ele deve rodar como um Railway Cron Job, separado do servico da WebApi.

## Comportamento Em Execucao

O job:

1. Le a configuracao por variaveis de ambiente.
2. Executa `pg_dump --format=custom --no-owner --no-acl`.
3. Valida o dump com `pg_restore --list`.
4. Envia o dump validado para um bucket S3-compatible, inicialmente Cloudflare R2.
5. Aplica retencao apenas nos objetos criados por este job.
6. Emite logs estruturados e metricas OpenTelemetry.
7. Finaliza com status diferente de zero em qualquer falha.

Os nomes dos backups usam UTC:

```text
devinn/postgres/devinn-postgres-YYYYMMDD-HHmmssZ.dump
devinn/postgres/manifests/devinn-postgres-YYYYMMDD-HHmmssZ.json
```

## Variaveis De Ambiente Obrigatorias

```text
BACKUP_DATABASE_URL
BACKUP_S3_ENDPOINT
BACKUP_S3_BUCKET
BACKUP_S3_ACCESS_KEY_ID
BACKUP_S3_SECRET_ACCESS_KEY
```

## Variaveis De Ambiente Opcionais

```text
BACKUP_S3_REGION=auto
BACKUP_S3_PREFIX=devinn/postgres
BACKUP_RETENTION_DAILY=7
BACKUP_RETENTION_WEEKLY=4
BACKUP_RETENTION_MONTHLY=6
BACKUP_OTEL_ENABLED=true
BACKUP_WORKING_DIRECTORY=/tmp
BACKUP_S3_FORCE_PATH_STYLE=true
BACKUP_PG_DUMP_PATH=pg_dump
BACKUP_PG_RESTORE_PATH=pg_restore
BACKUP_DUMP_COMPRESSION_LEVEL=9
BACKUP_DUMP_TIMEOUT_MINUTES=30
```

Para Grafana/OpenTelemetry, configure as variaveis OTLP padrao usadas pela sua stack Grafana, como:

```text
OTEL_EXPORTER_OTLP_ENDPOINT
OTEL_EXPORTER_OTLP_HEADERS
OTEL_EXPORTER_OTLP_PROTOCOL
```

## Configuracao No Railway

Crie um novo servico Railway para `apps/backup` e configure-o como Cron Job. Use uma agenda diaria para a primeira versao.

Use a rede privada do Railway para o PostgreSQL. O host do banco deve usar o formato de DNS privado do Railway:

```text
<nome-do-servico-postgres>.railway.internal
```

Mantenha as credenciais de backup apenas nas variaveis do servico de backup. Nao adicione credenciais do R2 ao servico da WebApi.

## Configuracao Do Cloudflare R2

Crie um bucket dedicado e depois crie uma chave de acesso R2 com permissoes minimas para esse bucket:

- ler/listar objetos;
- escrever objetos;
- excluir objetos dentro do prefixo configurado.

Use o endpoint S3-compatible do R2 como `BACKUP_S3_ENDPOINT`.

## Menor Privilegio No PostgreSQL

Crie uma role dedicada para backups no PostgreSQL. Ela deve conseguir conectar e ler todos os schemas, tabelas e sequences necessarios pelos contextos da aplicacao e de identidade, mas nao deve possuir objetos nem ter permissoes de escrita.

Exemplo:

```sql
CREATE ROLE devinn_backup LOGIN PASSWORD '<generated-password>';
GRANT CONNECT ON DATABASE devinn TO devinn_backup;
GRANT USAGE ON SCHEMA public TO devinn_backup;
GRANT USAGE ON SCHEMA identity TO devinn_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO devinn_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA identity TO devinn_backup;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO devinn_backup;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA identity TO devinn_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO devinn_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT SELECT ON TABLES TO devinn_backup;
```

## Execucao Manual Antes De Mudancas De Risco

Execute o job de backup manualmente no Railway antes de migrations ou mudancas operacionais de maior risco. Considere a execucao valida apenas quando:

- a execucao no Railway finalizar com sucesso;
- os logs mostrarem que a validacao do dump foi concluida;
- o objeto existir no R2;
- o Grafana receber a metrica de sucesso.

## Procedimento De Restauracao

Baixe um backup do R2 e restaure em um banco PostgreSQL vazio:

```bash
createdb devinn_restore
pg_restore --dbname devinn_restore --clean --if-exists --no-owner --no-acl devinn-postgres-YYYYMMDD-HHmmssZ.dump
```

Para um drill mais seguro, restaure em um banco temporario ou em um servico PostgreSQL temporario no Railway. Nunca restaure diretamente em producao durante o teste.

## Restore Drill

Execute um restore drill pelo menos uma vez por mes:

1. Selecione o backup mais recente marcado como bem-sucedido.
2. Restaure em um banco temporario vazio.
3. Confirme schemas, tabelas de identidade, tabelas da aplicacao e contagens representativas de linhas.
4. Registre data do drill, chave do backup, duracao da restauracao e qualquer problema encontrado.
5. Exclua o banco ou servico temporario.

## Rotacao De Credenciais

Rotacione credenciais do R2 e do usuario de backup do PostgreSQL de forma independente:

1. Crie a nova credencial.
2. Atualize as variaveis do servico de backup no Railway.
3. Execute o job manualmente.
4. Confirme upload, retencao e metricas no Grafana.
5. Revogue a credencial antiga.

## Metricas

O app emite estas metricas via OpenTelemetry:

```text
devinn_backup_completed_total
devinn_backup_failed_total
devinn_backup_duration_ms
devinn_backup_size_bytes
devinn_backup_deleted_expired_total
devinn_backup_last_success_age_seconds
```

Cada execucao bem-sucedida tambem envia um manifesto JSON com a chave do dump, checksum SHA-256, timestamps, tamanho, duracao e resultado da retencao.

Alertas recomendados no Grafana:

- falhas de backup maiores que zero nas ultimas 24 horas;
- idade do ultimo backup bem-sucedido maior que 30 horas;
- tamanho do backup caindo inesperadamente para perto de zero.
