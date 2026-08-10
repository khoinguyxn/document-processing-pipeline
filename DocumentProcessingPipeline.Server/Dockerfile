FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
ARG BUILD_CONFIGURATION=Release
COPY . /src
WORKDIR /src
RUN dotnet build "DocumentProcessingPipeline.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build -p:UseSharedCompilation=false

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "DocumentProcessingPipeline.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish -p:UseSharedCompilation=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DocumentProcessingPipeline.Server.dll"]
