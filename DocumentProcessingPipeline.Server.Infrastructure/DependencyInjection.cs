using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using Google.Api.Gax;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using DocumentProcessingPipeline.Server.Infrastructure.Options.GcpOptions;
using DocumentProcessingPipeline.Server.Infrastructure.Services;
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
                .AddDocumentAi()
                .AddServices();
        }

        private IServiceCollection AddOptions(IConfiguration configuration)
        {
            services.Configure<GcpOptions>(configuration.GetSection("Gcp"));
            services.Configure<DocumentAiOptions>(configuration.GetSection("DocumentAi"));

            return services;
        }

        private IServiceCollection AddStorage() =>
            services.AddSingleton<StorageClient>(_ =>
                new StorageClientBuilder
                {
                    EmulatorDetection = EmulatorDetection.EmulatorOrProduction
                }.Build());

        private IServiceCollection AddFirestore() =>
            services.AddFirestoreDb(action: (sp, builder) =>
            {
                builder.ProjectId = sp.GetRequiredService<IOptions<GcpOptions>>().Value.ProjectId;
                builder.EmulatorDetection = EmulatorDetection.EmulatorOrProduction;
            });

        private IServiceCollection AddDocumentAi() =>
            services.AddDocumentProcessorServiceClient(action: (sp, builder) =>
                builder.Endpoint = sp.GetRequiredService<IOptions<DocumentAiOptions>>().Value.Endpoint);

        private void AddServices() => services.AddScoped<IStorageService, GcpStorageService>();
    }
}