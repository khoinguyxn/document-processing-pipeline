using DocumentProcessingPipeline.Server.Domain.Services;
using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace DocumentProcessingPipeline.Server.Domain;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public void AddDomain()
        {
            services.AddServices();
        }

        private void AddServices() => services.AddScoped<IDocumentService, DocumentService>();
    }
}