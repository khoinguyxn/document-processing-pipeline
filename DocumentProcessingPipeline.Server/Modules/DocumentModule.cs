using Carter;
using Carter.OpenApi;
using Microsoft.AspNetCore.Mvc;

namespace DocumentProcessingPipeline.Server.Modules;

public class DocumentModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/documents/upload",
                async ([FromForm] IFormFile file) =>
                {
                    await using var stream = file.OpenReadStream();
                    return Results.Created();
                }).Accepts<IFormFile>("multipart/form-data").DisableAntiforgery()
            .Produces(StatusCodes.Status201Created).WithTags("documents").WithName("UploadDocument").IncludeInOpenApi();
    }
}