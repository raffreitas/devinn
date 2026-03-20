# AGENTS.md

This file provides a comprehensive overview of the DevInn project, its structure, and how to work with it.

## Project Overview

DevInn is a booking management system for inns and hotels. It's a monorepo managed with pnpm, consisting of two main applications:

*   **`apps/web`**: A modern frontend application built with React, TypeScript, and Vite. It features a rich user interface with a Gantt chart for bookings, financial dashboard, and inventory management. The UI is built with Tailwind CSS and shadcn/ui, and it uses TanStack Query for data fetching and state management.

*   **`apps/api`**: The backend API for the DevInn application, built with .NET/C#. It provides endpoints for authentication, inventory management, bookings, and financial data.

The project uses a feature-folder structure for organizing code, and it has a strong emphasis on modern development practices, including type safety, responsive design, and a comprehensive set of development tools.

## Technology Stack

### Frontend

*   **Framework**: React 19
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS v4 with oklch colors
*   **UI Components**: shadcn/ui (built on Radix UI)
*   **State Management**: TanStack Query v5
*   **Routing**: React Router v7
*   **Forms**: React Hook Form + Zod
*   **Date Management**: date-fns
*   **Linting/Formatting**: Biome

### Backend

*   **Framework**: .NET
*   **Language**: C#
*   **Architecture**: Clean Architecture
*   **Database**: PostgreSQL (with Entity Framework Core)

### Monorepo

*   **Package Manager**: pnpm
*   **CI/CD**: GitHub Actions
*   **Deployment**: Railway

## Building and Running

### Prerequisites

*   Node.js >= 18.0.0
*   pnpm >= 8.0.0
*   .NET SDK (for the API)

### Installation

To install all dependencies for the monorepo, run the following command from the root directory:

```bash
pnpm install
```

### Development

You can run the frontend and backend applications in development mode using the following commands from the root directory:

**Frontend (React App)**

```bash
pnpm dev:web
```

This will start the Vite development server for the web app, typically available at `http://localhost:5173`.

**Backend (.NET API)**

```bash
pnpm dev:api
```

This will start the .NET API in watch mode.

### Building for Production

To build the applications for production, use the following commands from the root directory:

**Frontend (React App)**

```bash
pnpm build:web
```

**Backend (.NET API)**

```bash
pnpm build:api
```

## API Architecture

The .NET API follows the principles of **Clean Architecture**, which promotes a separation of concerns and a dependency rule that points inwards, toward the domain. This results in a more maintainable, testable, and scalable application.

The API is structured into the following projects:

*   **`DevInn.Domain`**: This is the core of the application. It contains the domain entities, aggregates, value objects, and domain events. It has no dependencies on any other project in the solution.

*   **`DevInn.Application`**: This project contains the application logic, including use cases, commands, queries, and interfaces for infrastructure services. It depends on the `DevInn.Domain` project but not on the `DevInn.Infrastructure` or `DevInn.WebApi` projects.

*   **`DevInn.Infrastructure`**: This project implements the interfaces defined in the `DevInn.Application` project. It contains the implementation details for things like databases, external services, and authentication. It depends on the `DevInn.Application` project.

*   **`DevInn.WebApi`**: This is the entry point to the API. It exposes the application's functionality through a RESTful API. It depends on the `DevInn.Application` and `DevInn.Infrastructure` projects.

This architectural style ensures that the core business logic in `DevInn.Domain` is independent of any specific technology or framework, making it highly adaptable and long-lasting.

## CI/CD

The project has a CI/CD workflow configured in `.github/workflows/webapi-cicd.yaml` and `.github/workflows/webapp-cicd.yaml`.

*   **CI (Continuous Integration)**: Automatically builds and tests the monorepo (both React and .NET applications) on pushes to the `main` branch and on pull requests.
*   **Release**: Automatically creates a GitHub Release when a semantic version tag (e.g., `v1.2.3`) is pushed to the repository.
*   **Deploy (Production)**: Manual deployment to production is done via a `workflow_dispatch` event in GitHub Actions (`deploy-production.yaml`). This promotes `main` → `production` branch, which Railway watches for auto-deploy.

The CI pipeline is optimized with caching for both pnpm and NuGet packages to speed up builds. The deployment process includes running database migrations before deploying the application to Railway.

### Branch Protection

Since the project uses GitHub Free, branch protection rules and environments are not available. Instead, the following mechanisms are in place:

*   **Git Hook (pre-push)**: Husky is configured with a `pre-push` hook that blocks direct pushes to `main`. All changes must go through Pull Requests. The hook is automatically installed via `pnpm install`.

### Deployment Flow

The deployment to production follows this flow:

1.  Developer creates a branch and opens a PR targeting `main`
2.  CI workflows run automatically (build, test, lint)
3.  PR is merged into `main` (auto-creates semver tag and GitHub Release)
4.  Railway detects the change on `main` branch and deploys automatically

**Railway Configuration**: Railway must be configured to watch the `main` branch. This is done in the Railway dashboard under the service's Settings → Source → Branch.

## Development Conventions

### Frontend

The frontend application follows a set of modern development conventions:

*   **React 19**: Leveraging the latest features of React.
*   **TypeScript**: For type safety and improved code quality.
*   **Vite**: As the build tool for a fast development experience.
*   **Tailwind CSS**: For styling, with a mobile-first approach.
*   **shadcn/ui**: For a modern and accessible component library.
*   **TanStack Query**: For managing asynchronous state and data fetching.
*   **React Hook Form + Zod**: For type-safe form validation.
*   **Feature-Folder Structure**: Code is organized by feature, promoting modularity and co-location of related files.
*   **Path Aliases**: Uses `@/` for absolute imports, improving readability and maintainability.
*   **Linting and Formatting**: Uses Biome for consistent code style.

### Backend

The backend is a .NET/C# project. Based on the file structure, it appears to follow a standard .NET project structure, with separate projects for the application, domain, infrastructure, and web API layers.

## Key Files

*   `pnpm-workspace.yaml`: Defines the packages in the pnpm monorepo.
*   `package.json` (root): Contains the main scripts for running and building the applications.
*   `apps/web/package.json`: Dependencies and scripts for the frontend application.
*   `apps/web/README.md`: Detailed documentation for the frontend application.
*   `apps/api/package.json`: Dependencies and scripts for the backend application.
*   `apps/api/src/DevInn.WebApi/DevInn.WebApi.csproj`: The main project file for the .NET API.
