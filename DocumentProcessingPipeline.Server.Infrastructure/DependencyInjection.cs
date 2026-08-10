using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.DependencyInjection;

namespace DocumentProcessingPipeline.Server.Infrastructure;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public IServiceCollection
            AddInfrastructure() => services.AddStorage();

        private IServiceCollection AddStorage() =>
            services.AddSingleton<StorageClient>(sp =>
                StorageClient.Create(credential: sp.GetRequiredService<GoogleCredential>()));
    }
}