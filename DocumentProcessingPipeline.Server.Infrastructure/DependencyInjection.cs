using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using Google.Api.Gax;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using DocumentProcessingPipeline.Server.Infrastructure.Options.GcpOptions;
using DocumentProcessingPipeline.Server.Infrastructure.Persistence.Repositories;
using DocumentProcessingPipeline.Server.Infrastructure.Services;
using DocumentProcessingPipeline.Server.Infrastructure.Services.DocumentAiServices;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace DocumentProcessingPipeline.Server.Infrastructure;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public void
            AddInfrastructure(IConfiguration configuration)
        {
            services
                .AddOptions(configuration)
                .AddStorage()
                .AddFirestore()
                .AddDocumentAi();
        }

        private IServiceCollection AddOptions(IConfiguration configuration)
        {
            services.Configure<GcpOptions>(configuration.GetSection("Gcp"));
            services.Configure<DocumentAiOptions>(configuration.GetSection("Gcp:DocumentAi"));

            return services;
        }

        private IServiceCollection AddStorage()
        {
            services.AddSingleton<StorageClient>(_ =>
                new StorageClientBuilder
                {
                    EmulatorDetection = EmulatorDetection.EmulatorOrProduction
                }.Build());

            services.AddScoped<IStorageService, GcpStorageService>();

            return services;
        }

        private IServiceCollection AddFirestore()
        {
            services.AddFirestoreDb(action: (sp, builder) =>
            {
                builder.ProjectId = sp.GetRequiredService<IOptions<GcpOptions>>().Value.ProjectId;
                builder.EmulatorDetection = EmulatorDetection.EmulatorOrProduction;
            });

            services.AddScoped<IDocumentRepository, FirestoreDocumentRepository>();

            return services;
        }


        private void AddDocumentAi()
        {
            var sp = services.BuildServiceProvider();
            var options = sp.GetRequiredService<IOptions<DocumentAiOptions>>().Value;

            var ocrProviderType = GetOcrProviderType(options);

            if (ocrProviderType == OcrProvider.Live)
            {
                services.AddDocumentProcessorServiceClient(action: (provider, builder) =>
                    builder.Endpoint = provider.GetRequiredService<IOptions<DocumentAiOptions>>().Value.Endpoint);

                services.AddScoped<IOcrService, GcpDocumentAiService>();
            }
            else
            {
                services.AddScoped<IOcrService, FixtureOcrService>();

                services.AddHealthChecks()
                    .AddCheck("DocumentAi", () => HealthCheckResult.Healthy("Running in Fixture mode"));
            }
        }
    }

    private static OcrProvider GetOcrProviderType(DocumentAiOptions options)
    {
        if (options.OcrProvider == OcrProvider.Fixture)
        {
            return OcrProvider.Fixture;
        }

        var hasCredentials = File.Exists(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            ".config/gcloud/application_default_credentials.json"));

        var hasValidConfig = !string.IsNullOrWhiteSpace(options.ProcessorId);

        return hasValidConfig && hasCredentials ? OcrProvider.Live : OcrProvider.Fixture;
    }
}