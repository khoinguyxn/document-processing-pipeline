using FluentValidation;

namespace DocumentProcessingPipeline.Server.Models;

public record UploadDocumentRequest
{
    public required IFormFile File { get; init; }
}

public class UploadDocumentRequestValidator : AbstractValidator<UploadDocumentRequest>
{
    private static readonly string[] AllowedMimeTypes =
    [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    public UploadDocumentRequestValidator()
    {
        RuleFor(x => x.File)
            .Must(file => AllowedMimeTypes.Contains(file.ContentType))
            .WithMessage($"File type must be one of: {string.Join(", ", AllowedMimeTypes)}");
    }
}