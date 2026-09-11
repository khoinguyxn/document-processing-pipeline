using System.Net;
using Bogus;
using Google.Cloud.DocumentAI.V1;
using Google.Protobuf;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging.Abstractions;
using Testcontainers.FakeGcsServer;
using Testcontainers.Firestore;
using WireMock.Client.Extensions;
using WireMock.Net.Testcontainers;

namespace DocumentProcessingPipeline.Server.Tests.Fixtures;

extern alias ServerApp;

public sealed class DocumentProcessingPipelineServerFactoryFixture : WebApplicationFactory<ServerApp::Program>,
    IAsyncLifetime
{
    private const int DocumentAiGrpcPort = 9090;

    private FirestoreContainer FirestoreContainer { get; } =
        new FirestoreBuilder("google/cloud-sdk:emulators")
            .Build();

    private FakeGcsServerContainer StorageContainer { get; } =
        new FakeGcsServerBuilder("fsouza/fake-gcs-server:latest")
            .Build();

    private WireMockContainer DocumentAiContainer { get; } =
        new WireMockContainerBuilder()
            .WithNullLogger()
            .WithHttp2()
            .AddUrl($"grpc://*:{DocumentAiGrpcPort}")
            .Build();

    public async ValueTask InitializeAsync()
    {
        await Task.WhenAll(
            FirestoreContainer.StartAsync(),
            StorageContainer.StartAsync(),
            DocumentAiContainer.StartAsync()
        );

        Environment.SetEnvironmentVariable("FIRESTORE_EMULATOR_HOST", FirestoreContainer.GetEmulatorEndpoint());
        Environment.SetEnvironmentVariable("STORAGE_EMULATOR_HOST", StorageContainer.GetConnectionString());

        await ConfigureDocumentAiFixtureAsync(CancellationToken.None);
    }

    public override async ValueTask DisposeAsync()
    {
        try
        {
            await base.DisposeAsync();

            await Task.WhenAll(
                FirestoreContainer.DisposeAsync().AsTask(),
                StorageContainer.DisposeAsync().AsTask(),
                DocumentAiContainer.DisposeAsync().AsTask()
            );
        }
        finally
        {
            Environment.SetEnvironmentVariable("FIRESTORE_EMULATOR_HOST", null);
            Environment.SetEnvironmentVariable("STORAGE_EMULATOR_HOST", null);
        }
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var faker = new Faker();

        builder.ConfigureAppConfiguration((_, config) =>
        {
            var settings = new Dictionary<string, string?>
            {
                ["Gcp:ProjectId"] = faker.Random.AlphaNumeric(20),
                ["Gcp:ProjectNumber"] = faker.Random.Number(100000000, 999999999).ToString(),
                ["Gcp:LocationId"] = faker.PickRandom("us", "eu", "asia"),
                ["Gcp:DocumentAi:Endpoint"] = DocumentAiContainer.GetMappedPublicUrl(DocumentAiGrpcPort),
                ["Gcp:DocumentAi:ProcessorId"] = Guid.NewGuid().ToString(),
                ["STORAGE_EMULATOR_HOST"] = StorageContainer.GetConnectionString(),
                ["FIRESTORE_EMULATOR_HOST"] = FirestoreContainer.GetEmulatorEndpoint()
            };

            config.AddInMemoryCollection(settings);
        });

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<ILogger>();
            services.AddSingleton<ILogger, NullLogger>();
        });

        builder.UseEnvironment("Test");
    }

    private async Task ConfigureDocumentAiFixtureAsync(CancellationToken cancellationToken)
    {
        var response = CreateDefaultProcessResponse();
        var framedBytes = FrameGrpcMessage(response.ToByteArray());

        var builder = DocumentAiContainer.CreateWireMockAdminClient().GetMappingBuilder();

        builder.Given(action => action
            .WithRequest(request => request
                .UsingPost()
                .WithHttpVersion("2")
                .WithPath("/google.cloud.documentai.v1.DocumentProcessorService/ProcessDocument"))
            .WithResponse(res => res
                .WithStatusCode(HttpStatusCode.OK)
                .WithHeaders(headers => headers
                    .Add("Content-Type", "application/grpc"))
                .WithTrailingHeaders(headers => headers
                    .Add("grpc-status", "0"))
                .WithBodyAsBytes(framedBytes)));

        await builder.BuildAndPostAsync(cancellationToken);
    }

    private static ProcessResponse CreateDefaultProcessResponse()
    {
        var faker = new Faker();
        var page = new Document.Types.Page { PageNumber = 1 };

        (string Name, string Value)[] fields =
        [
            ("Invoice Number", faker.Finance.Account()),
            ("Vendor Name", faker.Company.CompanyName()),
            ("Total Amount", $"${faker.Finance.Amount(50, 5000):F2}"),
            ("Due Date", faker.Date.Future().ToString("yyyy-MM-dd"))
        ];

        foreach (var (name, value) in fields)
            page.FormFields.Add(new Document.Types.Page.Types.FormField
            {
                FieldName = CreateLayout(name, faker.Random.Float(0.9f)),
                FieldValue = CreateLayout(value, faker.Random.Float(0.85f, 0.99f))
            });

        return new ProcessResponse
        {
            Document = new Document
            {
                Text = faker.Lorem.Paragraph(),
                Pages = { page }
            }
        };
    }

    private static Document.Types.Page.Types.Layout CreateLayout(string text, float confidence)
    {
        var layout = new Document.Types.Page.Types.Layout
        {
            TextAnchor = new Document.Types.TextAnchor { Content = text },
            Confidence = confidence,
            BoundingPoly = new BoundingPoly()
        };

        layout.BoundingPoly.NormalizedVertices.AddRange(
        [
            new NormalizedVertex { X = 0, Y = 0 },
            new NormalizedVertex { X = 1, Y = 0 },
            new NormalizedVertex { X = 1, Y = 1 },
            new NormalizedVertex { X = 0, Y = 1 }
        ]);

        return layout;
    }

    private static byte[] FrameGrpcMessage(byte[] messageBytes)
    {
        var length = messageBytes.Length;
        var framed = new byte[5 + length];

        framed[0] = 0; // Uncompressed flag
        framed[1] = (byte)((length >> 24) & 0xFF);
        framed[2] = (byte)((length >> 16) & 0xFF);
        framed[3] = (byte)((length >> 8) & 0xFF);
        framed[4] = (byte)(length & 0xFF);
        Buffer.BlockCopy(messageBytes, 0, framed, 5, length);

        return framed;
    }
}