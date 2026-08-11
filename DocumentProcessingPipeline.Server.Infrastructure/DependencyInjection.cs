using Google.Api.Gax;
using Google.Cloud.Firestore;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using DocumentProcessingPipeline.Server.Infrastructure.Options.GcpOptions;
using Microsoft.Extensions.Options;

namespace DocumentProcessingPipeline.Server.Infrastructure;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public IServiceCollection
            AddInfrastructure(IConfiguration configuration) =>
            services.AddOptions(configuration).AddStorage().AddFirestore();

        private IServiceCollection AddOptions(IConfiguration configuration) =>
            services.Configure<GcpOptions>(configuration.GetSection("GCP"));

        private IServiceCollection AddStorage() =>
            services.AddSingleton<StorageClient>(_ =>
                StorageClient.Create());

        private IServiceCollection AddFirestore() =>
            services.AddSingleton<FirestoreDb>(sp => new FirestoreDbBuilder
            {
                ProjectId = sp.GetRequiredService<IOptions<GcpOptions>>().Value.ProjectId,
                EmulatorDetection = EmulatorDetection.EmulatorOrProduction
            }.Build());
    }
}