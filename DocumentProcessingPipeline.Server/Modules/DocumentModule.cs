using Carter;
using Carter.ModelBinding;
using Carter.OpenApi;
using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using DocumentProcessingPipeline.Server.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;

namespace DocumentProcessingPipeline.Server.Modules;

public class DocumentModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/documents/upload", UploadDocument)
            .Accepts<IFormFile>("multipart/form-data")
            .DisableAntiforgery()
            .Produces(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .WithTags("documents")
            .WithName("UploadDocument")
            .IncludeInOpenApi();
    }

    private static async Task<Results<Created, ValidationProblem>> UploadDocument(
        IFormFile file,
        IDocumentService documentService,
        IValidator<UploadDocumentRequest> validator,
        CancellationToken cancellationToken)
    {
        var request = new UploadDocumentRequest
        {
            File = file
        };

        var validationResult = await validator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(validationResult.GetValidationProblems());
        }

        await using var stream = request.File.OpenReadStream();
        await documentService.UploadAsync(stream, request.File.FileName, request.File.ContentType, cancellationToken);

        return TypedResults.Created();
    }
}