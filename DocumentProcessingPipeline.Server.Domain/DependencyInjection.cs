using DocumentProcessingPipeline.Server.Domain.Services;
using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace DocumentProcessingPipeline.Server.Domain;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddDomain() => services.AddServices();

        private IServiceCollection AddServices() => services.AddTransient<IDocumentService, DocumentService>();
    }
}