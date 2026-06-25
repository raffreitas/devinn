import {
  defineRailway,
  github,
  preserve,
  project,
  service,
  volume,
} from "railway/iac";

export default defineRailway(() => {
  const devinn = github("raffreitas/devinn", {
    branch: "main",
    checkSuites: true,
  });

  const Postgres = {
    image: "ghcr.io/railwayapp-templates/postgres-ssl:17",
    address: "database.Postgres",
    type: "database",
    kind: "database",
    engine: "postgres",
    name: "Postgres",
    output: "DATABASE_URL",
    defaultMountPath: "/var/lib/postgresql/data",
  } as const;
  const postgresVolume = volume("postgres-volume", {
    alerts: { usage: { "100": {}, "80": {}, "95": {} } },
    allowOnlineResize: true,
    region: "us-east4-eqdc4a",
    sizeMB: 5000,
  });
  const WebApp = service("WebApp", {
    source: devinn,
    root: "/apps/web",
    build: {
      buildEnvironment: "V3",
      builder: "RAILPACK",
      watchPatterns: ["/apps/web/**"],
    },
    replicas: 1,
    networking: { privateNetworkEndpoint: "webapp" },
    env: {
      MODE: preserve(),
      VITE_API_URL: preserve(),
    },
  });
  const WebApi = service("WebApi", {
    source: devinn,
    root: "/apps/api",
    build: {
      buildEnvironment: "V3",
      builder: "DOCKERFILE",
      dockerfilePath: "/apps/api/src/DevInn.WebApi/Dockerfile",
      watchPatterns: ["/apps/api/**"],
    },
    start: "",
    replicas: 1,
    deploy: { preDeployCommand: ["dotnet DevInn.DatabaseMigrator.dll"] },
    networking: { privateNetworkEndpoint: "webapi" },
    env: {
      ALLOWED_ORIGINS: preserve(),
      BackgroundJobs__CronExpression: preserve(),
      BackgroundJobs__Enabled: preserve(),
      ConnectionStrings__DatabaseConnection: preserve(),
      EmailOptions__ApiKey: preserve(),
      EmailOptions__FromAddress: preserve(),
      EmailOptions__FromName: preserve(),
      Jwt__Audience: preserve(),
      Jwt__ExpirationInMinutes: preserve(),
      Jwt__Issuer: preserve(),
      Jwt__SecretKey: preserve(),
      OTEL_EXPORTER_OTLP_ENDPOINT: preserve(),
      OTEL_EXPORTER_OTLP_HEADERS: preserve(),
      OTEL_EXPORTER_OTLP_PROTOCOL: preserve(),
      OTEL_RESOURCE_ATTRIBUTES: preserve(),
      Observability__Enabled: preserve(),
      PasswordReset__FrontendBaseUrl: preserve(),
      PasswordReset__TokenLifetimeInMinutes: preserve(),
    },
  });

  return project("devinn", {
    resources: [Postgres, WebApp, WebApi, postgresVolume],
  });
});
