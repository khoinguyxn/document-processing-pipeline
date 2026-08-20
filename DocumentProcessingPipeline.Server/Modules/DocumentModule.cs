using Carter;
using Carter.ModelBinding;
using Carter.OpenApi;
using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using DocumentProcessingPipeline.Server.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using CreatedResult = Microsoft.AspNetCore.Http.HttpResults.Created;

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
            .ProducesProblem(StatusCodes.Status500InternalServerError)
            .WithTags("documents")
            .WithName("UploadDocument")
            .IncludeInOpenApi();
    }

    private static async Task<Results<CreatedResult, ValidationProblem, ProblemHttpResult>> UploadDocument(
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
        var uploadResult = await documentService.UploadAsync(stream, request.File.FileName, request.File.ContentType,
            cancellationToken);

        return uploadResult.Match<Results<CreatedResult, ValidationProblem, ProblemHttpResult>>(
            _ => TypedResults.Created(),
            errors =>
            {
                var firstError = errors[0];
                var statusCode = firstError.Type switch
                {
                    _ => StatusCodes.Status500InternalServerError
                };

                return TypedResults.Problem(
                    title: firstError.Code,
                    detail: firstError.Description,
                    statusCode: statusCode);
            });
    }
}