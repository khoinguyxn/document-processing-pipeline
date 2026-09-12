# Document Processing Pipeline

## Table of Contents

- [Description](#description)
- [Architecture Overview](#architecture-overview)
- [Dependencies](#dependencies)
  - [Prerequisites & Runtimes](#prerequisites--runtimes)
  - [Backend Dependencies (.NET 10)](#backend-dependencies-net-10)
  - [Frontend Dependencies (React / Vite / Bun)](#frontend-dependencies-react--vite--bun)
  - [Emulators & Container Dependencies](#emulators--container-dependencies)
- [Installations](#installations)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Tooling Setup with Mise (Recommended)](#2-tooling-setup-with-mise-recommended)
  - [3. Manual Setup (Alternative)](#3-manual-setup-alternative)
  - [4. Frontend Dependencies Installation](#4-frontend-dependencies-installation)
  - [5. Backend Build & Restore](#5-backend-build--restore)
  - [6. Configuration & Environment Variables](#6-configuration--environment-variables)
- [Usage](#usage)
  - [Running with .NET Aspire (Recommended)](#running-with-net-aspire-recommended)
  - [Running the Backend Server Standalone](#running-the-backend-server-standalone)
  - [Running the Frontend Application Standalone](#running-the-frontend-application-standalone)
  - [API Documentation (Scalar / OpenAPI)](#api-documentation-scalar--openapi)
  - [API Endpoints](#api-endpoints)
  - [Running Tests](#running-tests)

---

## Description

The **Document Processing Pipeline** is an end-to-end cloud-native solution designed to automate document ingestion, OCR parsing, and structured data extraction. Built on **.NET 10**, **.NET Aspire**, **Google Cloud Document AI**, **Cloud Storage**, **Firestore**, and a modern **React / TanStack Start** frontend, the system orchestrates seamless file uploading, metadata persistence, form field extraction, and interactive exploration of document contents.

---

## Architecture Overview

```text
┌─────────────────────────┐
│     React Frontend      │  (TanStack Start / Vite / Bun / Tailwind CSS)
└────────────┬────────────┘
             │ HTTP / REST
             ▼
┌─────────────────────────┐
│   ASP.NET Core Server   │  (.NET 10 Minimal APIs + Carter + FluentValidation)
└────────────┬────────────┘
             │
     ┌───────┴────────────────────────┐
     ▼                                ▼
┌────────────────────────┐   ┌────────────────────────┐
│ Google Cloud Storage   │   │ Google Cloud Firestore │
│ (or fake-gcs-server)   │   │ (or Firestore emulator)│
└────────────┬───────────┘   └────────────────────────┘
             │
             ▼
┌────────────────────────┐
│ Google Document AI     │
│ (Form Extraction / OCR)│
└────────────────────────┘
```

- **AppHost (`DocumentProcessingPipeline.AppHost`)**: .NET Aspire orchestrator managing local containerized dependencies (GCS fake server, Firestore emulator), server startup, and Vite/Bun frontend execution.
- **Server (`DocumentProcessingPipeline.Server`)**: ASP.NET Core application providing Carter Minimal API endpoints, OpenAPI/Scalar API documentation, and OpenTelemetry telemetry.
- **Domain (`DocumentProcessingPipeline.Server.Domain`)**: Clean architecture domain layer defining core business logic, document entities, OCR models, and interfaces using `ErrorOr`.
- **Infrastructure (`DocumentProcessingPipeline.Server.Infrastructure`)**: Implementation of integrations with Google Cloud Storage, Google Cloud Firestore, and Google Cloud Document AI.
- **Frontend (`web`)**: Modern full-stack web UI built with TanStack Start, React 19, Vite, Tailwind CSS, and Radix UI / shadcn components.

---

## Dependencies

### Prerequisites & Runtimes

- **.NET SDK**: `10.0` or later
- **Bun**: `latest` (or **Node.js**: `20+`)
- **Docker / Podman / Container Runtime**: Required by .NET Aspire for running local emulators (`fake-gcs-server`, `firestore-emulator`)
- **Mise (Optional)**: Tool version manager (defined in `mise.toml`)

### Backend Dependencies (.NET 10)

Key NuGet packages used across the backend projects:

| Project | Key Packages / Libraries | Purpose |
|---|---|---|
| **AppHost** | `Aspire.AppHost.Sdk`, `Aspire.Hosting.JavaScript` | Application orchestration and service discovery |
| **Server** | `Carter`, `FluentValidation`, `Scalar.AspNetCore`, `Microsoft.AspNetCore.OpenApi`, `OpenTelemetry.*` | API routing, request validation, API documentation, metrics/tracing |
| **Infrastructure** | `Google.Cloud.DocumentAI.V1`, `Google.Cloud.Firestore`, `Google.Cloud.Storage.V1`, `Microsoft.Extensions.Options` | GCP service clients for OCR, NoSQL storage, and blob storage |
| **Domain** | `ErrorOr`, `Microsoft.Extensions.DependencyInjection` | Functional error handling and domain abstractions |
| **Tests** | `xunit.v3`, `Moq`, `Bogus`, `Testcontainers`, `WireMock.Net`, `Microsoft.AspNetCore.Mvc.Testing` | Unit and integration testing suites |

### Frontend Dependencies (React / Vite / Bun)

Key NPM packages used in the frontend application:

- **Framework**: `react` (v19), `react-dom` (v19), `@tanstack/react-start`, `@tanstack/react-router`
- **Build Tool**: `vite` (v8), `@vitejs/plugin-react`, `nitro`
- **Styling**: `tailwindcss` (v4), `@tailwindcss/vite`, `clsx`, `tailwind-merge`
- **UI Components & Icons**: `radix-ui`, `shadcn`, `lucide-react`
- **Testing & Quality**: `vitest`, `@testing-library/react`, `eslint`, `prettier`, `typescript`

### Emulators & Container Dependencies

Managed automatically by .NET Aspire in local development:
- `fsouza/fake-gcs-server`: Local emulator for Google Cloud Storage.
- `google/cloud-sdk:emulators`: Local emulator for Google Cloud Firestore.

---

## Installations

### 1. Clone Repository

```bash
git clone https://github.com/khoinguyxn/document-processing-pipeline.git
cd DocumentProcessingPipeline
```

### 2. Tooling Setup with Mise (Recommended)

If you have [mise](https://mise.jdx.dev/) installed, you can automatically install the required runtimes:

```bash
mise install
```

This ensures matching versions for `dotnet`, `bun`, `node`, and `java`.

### 3. Manual Setup (Alternative)

If you are not using Mise, verify and install the following tools manually:
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Bun](https://bun.sh/)
- [Docker Desktop](https://www.docker.com/) / Docker Engine (ensure docker daemon is running)

### 4. Frontend Dependencies Installation

Navigate to the `web` folder and install dependencies via Bun:

```bash
cd web
bun install
cd ..
```

### 5. Backend Build & Restore

Restore NuGet packages and build the .NET solution:

```bash
dotnet build
```

### 6. Configuration & Environment Variables

#### Google Cloud Configuration (for Production or Live GCP Services)
If connecting to actual Google Cloud Platform services instead of local emulators, configure your GCP credentials and settings in user-secrets or environment variables:

```json
{
  "Gcp": {
    "ProjectId": "your-gcp-project-id",
    "ProjectNumber": "your-gcp-project-number",
    "LocationId": "your-gcp-location-id",
    "DocumentAi": {
      "ProcessorId": "your-document-ai-processor-id",
      "Endpoint": "your-document-ai-endpoint"
    }
  }
}
```

Set Google Application Credentials:
```bash
gcloud auth application-default login
```

---

## Usage

### Running with .NET Aspire (Recommended)

The easiest way to run the entire pipeline (GCS Emulator, Firestore Emulator, Backend API Server, and Web Frontend) is via .NET Aspire AppHost:

```bash
dotnet run --project DocumentProcessingPipeline.AppHost
```

Once running:
- **Aspire Dashboard**: Accessible via the link shown in the terminal output (e.g. `http://localhost:15279`).
- **Web Frontend**: Started and proxied automatically.
- **Backend API Server**: Health checks and endpoint endpoints mapped with automatic emulator bindings.

### Running the Backend Server Standalone

To run only the backend API server:

```bash
dotnet run --project DocumentProcessingPipeline.Server
```

By default, the server will listen on `http://localhost:5328` (or `https://localhost:7454` with the `https` profile). The `PORT` environment variable overrides these when set.

### Running the Frontend Application Standalone

To run the React / Vite frontend development server:

```bash
cd web
bun run dev
```

The frontend will be available at `http://localhost:3000`.

### API Documentation (Scalar / OpenAPI)

When running in `Development` environment, interactive API documentation is available at:
- **Scalar UI**: `http://localhost:<server-port>/scalar/v1`
- **OpenAPI Specification**: `http://localhost:<server-port>/openapi/v1.json`

### API Endpoints

#### Upload and Process Document
- **Route**: `POST /documents/upload`
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `file` field containing document (e.g., PDF or image).
- **Responses**:
  - `201 Created`: Document uploaded, saved to Storage, parsed via Document AI OCR, and saved to Firestore.
  - `400 Bad Request`: Validation failure (empty file or invalid format).
  - `500 Internal Server Error`: Processing or extraction failure.

### Running Tests

#### Run all solution tests via .NET CLI:
```bash
dotnet test
```

#### Run backend tests with mise task:
```bash
mise run server-test
```

#### Run frontend unit tests with Vitest:
```bash
cd web
bun run test
```

#### Run frontend linting & type checks:
```bash
cd web
bun run lint
bun run typecheck
```
