# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-09-18T09:58:51.938Z
> Files: 119 tracked | Anatomy hits: 0 | Misses: 0

> Project structure index. Auto-maintained by OpenWolf hooks and daemon.
> Run `openwolf scan` to generate, or wait for the first Claude Code session.
> Status: Pending initial scan

## ./

- `.dockerignore` — Docker ignore rules (~1258 tok)
- `.gitignore` — Git ignore rules (~314 tok)
- `AGENTS.md` — Skill Loading (~6358 tok)
- `aspire.config.json` (~33 tok)
- `CLAUDE.md` — OpenWolf (~99 tok)
- `DocumentProcessingPipeline.slnx` (~219 tok)
- `global.json` — .NET SDK configuration (~31 tok)
- `mise.toml` — /coverage.cobertura.xml" "-targetdir:coverage" "-reporttypes:Html;lcov;Cobertura;TextSummary" (~272 tok)
- `package.json` — Node.js package manifest (~40 tok)
- `qodana.yaml` — -------------------------------------------------------------------------------# (~553 tok)
- `README.md` — Project documentation (~2336 tok)
- `skills-lock.json` (~2105 tok)

## .config/

- `dotnet-tools.json` (~61 tok)

## .github/workflows/

- `main.yaml` — CI: main (~1520 tok)

## DocumentProcessingPipeline.AppHost/

- `.gitignore` — Git ignore rules (~260 tok)
- `AppHost.cs` — Class: AppHost (~683 tok)
- `appsettings.Development.json` (~34 tok)
- `appsettings.json` — .NET application settings (~46 tok)
- `DocumentProcessingPipeline.AppHost.csproj` (~403 tok)

## DocumentProcessingPipeline.AppHost/Fixtures/

- `DocumentAiFixtureExtensions.cs` — DocumentAiFixtureExtensions: WithDocumentAiFixture (~986 tok)

## DocumentProcessingPipeline.AppHost/Properties/

- `launchSettings.json` (~287 tok)

## DocumentProcessingPipeline.Server.Domain.Tests/

- `DocumentProcessingPipeline.Server.Domain.Tests.csproj` (~348 tok)

## DocumentProcessingPipeline.Server.Domain.Tests/Services/

- `DocumentServiceTests.cs` — DocumentServiceTests: UploadAsync_ShouldReturnCreated_WhenSuccessful, UploadAsync_ShouldReturnErrors_WhenStorageUploadFails, UploadAsync_ShouldRetu... (~3675 tok)

## DocumentProcessingPipeline.Server.Domain/

- `DependencyInjection.cs` — DependencyInjection: AddDomain (~136 tok)
- `DocumentProcessingPipeline.Server.Domain.csproj` (~112 tok)

## DocumentProcessingPipeline.Server.Domain/Models/

- `Document.cs` — Class: Document (~306 tok)

## DocumentProcessingPipeline.Server.Domain/Services/

- `DocumentService.cs` — Class: DocumentService (~673 tok)

## DocumentProcessingPipeline.Server.Domain/Services/Interfaces/

- `IDocumentRepository.cs` — Interface: IDocumentRepository (0 members) (~113 tok)
- `IDocumentService.cs` — Interface: IDocumentService (0 members) (~70 tok)
- `IOcrService.cs` — Interface: IOcrService (0 members) (~108 tok)
- `IStorageService.cs` — Interface: IStorageService (0 members) (~78 tok)

## DocumentProcessingPipeline.Server.Infrastructure.Tests/

- `DocumentProcessingPipeline.Server.Infrastructure.Tests.csproj` (~352 tok)

## DocumentProcessingPipeline.Server.Infrastructure.Tests/Persistence/Entities/

- `FirestoreDocumentEntityTests.cs` — FirestoreDocumentEntityTests: ToEntity_ShouldMapAllPropertiesCorrectly_WhenDocumentIsValid, ToEntity_ShouldHandleNullOptionalFields, ToEntity_Shoul... (~1426 tok)

## DocumentProcessingPipeline.Server.Infrastructure.Tests/Persistence/Repositories/

- `FirestoreDocumentRepositoryTests.cs` — FirestoreDocumentRepositoryTests: CreateDocumentAsync_ShouldReturnCreated_WhenSuccessful, CreateDocumentAsync_ShouldReturnFailure_WhenExceptionIsTh... (~1819 tok)

## DocumentProcessingPipeline.Server.Infrastructure.Tests/Services/

- `GcpStorageServiceTests.cs` — GcpStorageServiceTests: UploadFileAsync_ShouldSucceed_WhenBucketAlreadyExists, UploadFileAsync_ShouldCreateBucketAndSucceed_WhenBucketDoesNotExist,... (~1985 tok)

## DocumentProcessingPipeline.Server.Infrastructure/

- `DependencyInjection.cs` — DependencyInjection: AddInfrastructure (~751 tok)
- `DocumentProcessingPipeline.Server.Infrastructure.csproj` (~296 tok)

## DocumentProcessingPipeline.Server.Infrastructure/Options/GcpOptions/

- `DocumentAiOptions.cs` — Class: DocumentAiOptions (~59 tok)
- `GcpOptions.cs` — Class: GcpOptions (~72 tok)

## DocumentProcessingPipeline.Server.Infrastructure/Persistence/Entities/

- `FirestoreDocumentEntity.cs` — DocumentMappingExtensions: ToEntity (~866 tok)

## DocumentProcessingPipeline.Server.Infrastructure/Persistence/Repositories/

- `FirestoreDocumentRepository.cs` — Class: FirestoreDocumentRepository (~572 tok)

## DocumentProcessingPipeline.Server.Infrastructure/Services/

- `GcpStorageService.cs` — Class: GcpStorageService (~722 tok)

## DocumentProcessingPipeline.Server.Infrastructure/Services/DocumentAiServices/

- `GcpDocumentAiService.cs` — Class: GcpDocumentAiService (~862 tok)

## DocumentProcessingPipeline.Server.Tests/

- `DocumentProcessingPipeline.Server.Tests.csproj` (~484 tok)

## DocumentProcessingPipeline.Server.Tests/Fixtures/

- `DocumentProcessingPipelineServerFactoryFixture.cs` — DocumentProcessingPipelineServerFactoryFixture: InitializeAsync (~1749 tok)

## DocumentProcessingPipeline.Server.Tests/Modules/

- `DocumentModuleTests.cs` — DocumentModuleTests: UploadDocument_ShouldReturnCreated_WhenMimeTypeIsSupported, UploadDocument_ShouldReturnBadRequest_WhenMimeTypeIsNotSupported (~674 tok)

## DocumentProcessingPipeline.Server/

- `appsettings.Development.json` (~34 tok)
- `appsettings.json` — .NET application settings (~41 tok)
- `Dockerfile` — Docker container definition (~326 tok)
- `DocumentProcessingPipeline.Server.csproj` (~475 tok)
- `DocumentProcessingPipeline.Server.http` (~33 tok)
- `Extensions.cs` — Extensions: MapDefaultEndpoints (~1248 tok)
- `Program.cs` — Application entry point (~378 tok)

## DocumentProcessingPipeline.Server/Models/

- `UploadDocumentRequest.cs` — Class: UploadDocumentRequestValidator (~179 tok)

## DocumentProcessingPipeline.Server/Modules/

- `DocumentModule.cs` — DocumentModule: AddRoutes (~619 tok)

## DocumentProcessingPipeline.Server/Properties/

- `launchSettings.json` (~177 tok)

## web/

- `.cta.json` (~94 tok)
- `.dockerignore` — Docker ignore rules (~148 tok)
- `.gitignore` — Git ignore rules (~463 tok)
- `.prettierignore` (~12 tok)
- `.prettierrc` — Prettier configuration (~68 tok)
- `components.json` (~151 tok)
- `Dockerfile` — Docker container definition (~353 tok)
- `eslint.config.js` — ESLint flat configuration (~123 tok)
- `package.json` — Node.js package manifest (~584 tok)
- `README.md` — Project documentation (~113 tok)
- `tsconfig.json` — TypeScript configuration (~202 tok)
- `vite.config.ts` — Declares config (~163 tok)
- `vitest.config.ts` — Vitest test configuration (~759 tok)

## web/public/

- `manifest.json` (~143 tok)
- `robots.txt` — https://www.robotstxt.org/robotstxt.html (~17 tok)

## web/scripts/

- `generate-receipt-types.ts` — Declares HEADER (~322 tok)

## web/src/

- `router.tsx` — getRouter (~118 tok)
- `routeTree.gen.ts` — @ts-nocheck (~1453 tok)
- `styles.css` — Styles: 9 rules, 103 vars, 1 layers (~1445 tok)

## web/src/components/

- `app-sidebar.tsx` — Exports AppSidebar (~580 tok)
- `inbox-button-group.tsx` — Exports InboxButtonGroup (~514 tok)
- `upload-status-alert.tsx` — Exports UploadStatusAlert (~963 tok)

## web/src/components/ui/

- `alert.tsx` — Declares ALERT_VARIANTS (~521 tok)
- `button.tsx` — BUTTON_VARIANTS (~843 tok)
- `calendar.tsx` — Declares Calendar (~2444 tok)
- `card.tsx` — Declares Card (~707 tok)
- `date-range-picker.tsx` — Declares getMonthRange (~1188 tok)
- `input.tsx` — Input (~257 tok)
- `popover.tsx` — Popover (~674 tok)
- `separator.tsx` — Separator (~178 tok)
- `sheet.tsx` — Sheet (~1302 tok)
- `sidebar.tsx` — SIDEBAR_COOKIE_NAME — uses useContext, useState, useCallback, useEffect (~6100 tok)
- `skeleton.tsx` — Skeleton (~76 tok)
- `tooltip.tsx` — TooltipProvider (~623 tok)
- `typography.tsx` — HEADING_BASE (~299 tok)

## web/src/hooks/

- `use-mobile.ts` — Exports useIsMobile (~162 tok)

## web/src/lib/

- `datetime.ts` — Declares DISPLAY_LOCALE (~269 tok)
- `pages.tsx` — Exports PAGES (~106 tok)
- `utils.ts` — Exports cn (~48 tok)

## web/src/models/

- `pages.tsx` — Exports PAGES (~139 tok)
- `receipt.ts` — Declares RECEIPT_STATUSES (~540 tok)
- `reciept.ts` — Declares RECEIPT_BASE (~197 tok)

## web/src/routes/

- `__root.tsx` — Route (~380 tok)
- `health.ts` — Exports Route (~116 tok)
- `ready.ts` — Exports Route (~192 tok)

## web/src/routes/app/

- `exports.tsx` — Route (~62 tok)
- `index.tsx` — Exports Route (~525 tok)
- `route.tsx` — Exports Route (~494 tok)
- `suppliers.tsx` — Route (~63 tok)

## web/src/types/

- `pages.d.ts` — Exports Page (~41 tok)

## web/tests/

- `setup.ts` (~7 tok)

## web/tests/components/

- `app-sidebar.test.tsx` — Declares TEST_PAGES (~971 tok)
- `inbox-button-group.test.tsx` — Declares BUTTON_SELECTOR (~694 tok)
- `upload-status-alert.test.tsx` — Declares ALERT_SELECTOR (~2187 tok)

## web/tests/components/ui/

- `date-range-picker.component.test.tsx` — EMPTY_LABEL (~2782 tok)
- `date-range-picker.test.ts` — Declares toParts (~2286 tok)
- `typography.test.tsx` — `font-semibold` is intentionally absent: `cn` runs tailwind-merge, so the (~1108 tok)

## web/tests/lib/

- `datetime.test.ts` — Declares toParts (~568 tok)

## web/tests/models/

- `receipt.test.ts` — Declares createReceipt (~1221 tok)
- `reciept.test.ts` — Declares createReceipt (~699 tok)

## web/tests/routes/app/

- `index.test.tsx` — Declares CARD_SELECTOR (~1634 tok)
- `route.test.tsx` — Declares renderAppLayout (~935 tok)

## web/tests/utils/

- `router.tsx` — Renders `ui` inside a real router so `Link`/navigation hooks work, but skips (~720 tok)
