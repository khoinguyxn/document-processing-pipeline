FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
ARG BUILD_CONFIGURATION=Release

WORKDIR /src

# Copy only the project files first so `dotnet restore` stays cached until a
# csproj changes, instead of being invalidated by every source edit.
COPY global.json ./
COPY DocumentProcessingPipeline.Server.Domain/DocumentProcessingPipeline.Server.Domain.csproj DocumentProcessingPipeline.Server.Domain/
COPY DocumentProcessingPipeline.Server.Infrastructure/DocumentProcessingPipeline.Server.Infrastructure.csproj DocumentProcessingPipeline.Server.Infrastructure/
COPY DocumentProcessingPipeline.Server/DocumentProcessingPipeline.Server.csproj DocumentProcessingPipeline.Server/
RUN dotnet restore DocumentProcessingPipeline.Server/DocumentProcessingPipeline.Server.csproj

COPY . .
RUN dotnet publish "DocumentProcessingPipeline.Server/DocumentProcessingPipeline.Server.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    --no-restore \
    -p:UseSharedCompilation=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
USER app
ENTRYPOINT ["dotnet", "DocumentProcessingPipeline.Server.dll"]
