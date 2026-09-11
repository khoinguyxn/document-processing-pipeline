using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using Google.Api.Gax;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using DocumentProcessingPipeline.Server.Infrastructure.Options.GcpOptions;
using DocumentProcessingPipeline.Server.Infrastructure.Persistence.Repositories;
using DocumentProcessingPipeline.Server.Infrastructure.Services;
using DocumentProcessingPipeline.Server.Infrastructure.Services.DocumentAiServices;
using Grpc.Core;
using Microsoft.Extensions.Hosting;
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
            services.AddDocumentProcessorServiceClient(action: (provider, builder) =>
            {
                var environment = provider.GetRequiredService<IHostEnvironment>();

                builder.Endpoint = provider.GetRequiredService<IOptions<DocumentAiOptions>>().Value.Endpoint;

                if (environment.IsDevelopment())
                {
                    builder.ChannelCredentials = ChannelCredentials.Insecure;
                }
            });

            services.AddScoped<IOcrService, GcpDocumentAiService>();
        }
    }
}