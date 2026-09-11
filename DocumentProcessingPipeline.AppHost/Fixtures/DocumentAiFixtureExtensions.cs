using System.Net;
using Bogus;
using Google.Cloud.DocumentAI.V1;
using Google.Protobuf;
using WireMock.Client.Builders;

namespace DocumentProcessingPipeline.AppHost.Fixtures;

public static class DocumentAiFixtureExtensions
{
    public static IResourceBuilder<WireMockServerResource> WithDocumentAiFixture(
        this IResourceBuilder<WireMockServerResource> builder)
    {
        return builder.WithApiMappingBuilder((apiBuilder, cancellationToken) =>
            apiBuilder.ConfigureDocumentAiFixtureAsync(cancellationToken));
    }

    private static async Task ConfigureDocumentAiFixtureAsync(
        this AdminApiMappingBuilder builder,
        CancellationToken cancellationToken
    )
    {
        var response = CreateDefaultProcessResponse();
        var rawBytes = response.ToByteArray();
        var framedBytes = FrameGrpcMessage(rawBytes);

        builder.Given(action => action
            .WithRequest(request => request
                .UsingPost()
                .WithHttpVersion("2")
                .WithPath("/google.cloud.documentai.v1.DocumentProcessorService/ProcessDocument"))
            .WithResponse(res => res
                .WithStatusCode(HttpStatusCode.OK)
                .WithHeaders(headers => headers
                    .Add("Content-Type", "application/grpc")
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
            ("Invoice Number", faker.Finance.Account(8)),
            ("Vendor Name", faker.Company.CompanyName()),
            ("Total Amount", $"${faker.Finance.Amount(50, 5000):F2}"),
            ("Due Date", faker.Date.Future().ToString("yyyy-MM-dd"))
        ];

        foreach (var (name, value) in fields)
        {
            page.FormFields.Add(new Document.Types.Page.Types.FormField
            {
                FieldName = CreateLayout(name, faker.Random.Float(0.9f)),
                FieldValue = CreateLayout(value, faker.Random.Float(0.85f, 0.99f))
            });
        }

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