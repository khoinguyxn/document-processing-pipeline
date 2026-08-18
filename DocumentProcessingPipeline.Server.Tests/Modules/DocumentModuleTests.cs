using System.Net;
using System.Net.Http.Headers;
using DocumentProcessingPipeline.Server.Tests.Fixtures;

namespace DocumentProcessingPipeline.Server.Tests.Modules;

public class DocumentModuleTests(GcpFixture fixture) : IClassFixture<GcpFixture>
{
    private readonly HttpClient _httpClient = fixture.CreateClient();
    private readonly CancellationToken _cancellationToken = CancellationToken.None;

    [Theory]
    [InlineData("application/pdf", "document.pdf")]
    [InlineData("image/jpeg", "image.jpeg")]
    [InlineData("image/png", "image.png")]
    [InlineData("image/webp", "image.webp")]
    public async Task UploadDocument_ShouldReturnCreated_WhenMimeTypeIsSupported(string contentType, string fileName)
    {
        // Arrange
        using var content = new MultipartFormDataContent();

        var fileContent = new ByteArrayContent([.. "Fake file content"u8]);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        content.Add(fileContent, "file", fileName);

        // Act
        var response = await _httpClient.PostAsync("/documents/upload", content, _cancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task UploadDocument_ShouldReturnBadRequest_WhenMimeTypeIsNotSupported()
    {
        // Arrange
        using var content = new MultipartFormDataContent();

        var fileContent = new ByteArrayContent([.. "Hello World!"u8]);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");

        content.Add(fileContent, "file", "hello.txt");

        // Act
        var response = await _httpClient.PostAsync("/documents/upload", content, _cancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problemDetails = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(_cancellationToken);
        Assert.NotNull(problemDetails);

        var allowedMimeTypes = new[] { "application/pdf", "image/jpeg", "image/png", "image/webp" };
        var expectedErrorMessage = $"File type must be one of: {string.Join(", ", allowedMimeTypes)}";

        Assert.True(problemDetails.Errors.TryGetValue("File", out var errors) || problemDetails.Errors.TryGetValue("file", out errors));
        Assert.NotNull(errors);
        Assert.Contains(expectedErrorMessage, errors);
    }
}