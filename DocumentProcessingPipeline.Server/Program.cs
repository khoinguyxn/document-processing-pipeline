using Carter;
using DocumentProcessingPipeline.Server;
using DocumentProcessingPipeline.Server.Domain;
using DocumentProcessingPipeline.Server.Infrastructure;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddProblemDetails();

// Add Carter modules
builder.Services.AddCarter();

// Add domain services.
builder.Services.AddDomain();

// Add infrastructure services.
builder.Services.AddInfrastructure(builder.Configuration);

// Add OpenApi docs
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(policy => policy.Expire(TimeSpan.FromMinutes(10)));
});
builder.Services.AddOpenApi();

var app = builder.Build();

var port = Environment.GetEnvironmentVariable("PORT");

if (!string.IsNullOrEmpty(port))
{
    app.Urls.Clear();
    app.Urls.Add($"http://0.0.0.0:{port}");
}

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

app.UseOutputCache();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().CacheOutput();
    app.MapScalarApiReference();
}

app.MapCarter();

app.MapDefaultEndpoints();

app.UseFileServer();

app.Run();