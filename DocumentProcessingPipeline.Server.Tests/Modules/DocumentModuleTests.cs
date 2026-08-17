using System.Net;
using System.Net.Http.Headers;
using DocumentProcessingPipeline.Server.Tests.Fixtures;

namespace DocumentProcessingPipeline.Server.Tests.Modules;

public class DocumentModuleTests(GcpFixture fixture) : IClassFixture<GcpFixture>
{
    private readonly HttpClient _httpClient = fixture.CreateClient();
    private readonly CancellationToken _cancellationToken = new CancellationTokenSource(TimeSpan.FromSeconds(30)).Token;

    [Fact]
    public async Task UploadDocument_ShouldReturnsCreated_WhenDocumentIsUploaded()
    {
        // Arrange
        using var content = new MultipartFormDataContent();

        var fileContent = new ByteArrayContent([.. "Hello World!"u8]);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");

        content.Add(fileContent, "file", "hello.txt");

        // Act
        var response = await _httpClient.PostAsync("/documents/upload", content, _cancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}