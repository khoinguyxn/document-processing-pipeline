using Carter;
using Carter.OpenApi;
using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocumentProcessingPipeline.Server.Modules;

public class DocumentModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/documents/upload",
                async ([FromForm] IFormFile file, [FromServices] IDocumentService documentService,
                    CancellationToken cancellationToken) =>
                {
                    await using var stream = file.OpenReadStream();
                    await documentService.UploadAsync(stream, file.FileName, file.ContentType, cancellationToken);

                    return TypedResults.Created();
                }).Accepts<IFormFile>("multipart/form-data").DisableAntiforgery()
            .Produces(StatusCodes.Status201Created).WithTags("documents").WithName("UploadDocument").IncludeInOpenApi();
    }
}