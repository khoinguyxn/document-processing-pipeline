using System.Net;
using System.Net.Http.Headers;
using Aspire.Hosting;

namespace DocumentProcessingPipeline.Server.Tests.Modules;

public class DocumentModuleTests(DistributedAppFixture distributedAppFixture)
    : IClassFixture<DistributedAppFixture>
{
    private readonly DistributedApplication _app = distributedAppFixture.App;
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
        using var httpClient = _app.CreateHttpClient("server");
        
        await _app.ResourceNotifications.WaitForResourceHealthyAsync("server", _cancellationToken);
        
        var response = await httpClient.PostAsync("/documents/upload", content, _cancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}