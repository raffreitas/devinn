#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Generates a complete feature structure for DevInn backend.

.DESCRIPTION
    Creates all necessary files for a new feature following Clean Architecture:
    - Command/Query in Application layer
    - Handler
    - Validator
    - Endpoint in WebApi layer

.PARAMETER Feature
    The feature name (e.g., "CreateRoom", "GetBookings")

.PARAMETER Aggregate
    The aggregate name (e.g., "Inventory", "Bookings", "Inns")

.PARAMETER Type
    The type of feature: "Command" or "Query"

.EXAMPLE
    .\generate-feature.ps1 -Feature CreateRoom -Aggregate Inventory -Type Command

.EXAMPLE
    .\generate-feature.ps1 -Feature GetRooms -Aggregate Inventory -Type Query
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$Feature,
    
    [Parameter(Mandatory = $true)]
    [string]$Aggregate,
    
    [Parameter(Mandatory = $true)]
    [ValidateSet("Command", "Query")]
    [string]$Type
)

$ErrorActionPreference = "Stop"

# Paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $scriptDir))
$applicationPath = Join-Path $apiRoot "src\DevInn.Application"
$webApiPath = Join-Path $apiRoot "src\DevInn.WebApi"

$featurePath = Join-Path $applicationPath "Features\$Aggregate\$Feature"
$endpointPath = Join-Path $webApiPath "Endpoints\$Aggregate"

# Create directories
New-Item -ItemType Directory -Path $featurePath -Force | Out-Null
New-Item -ItemType Directory -Path $endpointPath -Force | Out-Null

Write-Host "🚀 Generating feature: $Feature ($Type)" -ForegroundColor Cyan
Write-Host "📁 Aggregate: $Aggregate" -ForegroundColor Cyan

# Generate Command/Query
$requestFile = Join-Path $featurePath "$Feature$Type.cs"
$requestType = if ($Type -eq "Command") { "Result<Guid>" } else { "Result<List<${Aggregate}Dto>>" }

$requestContent = @"
#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Generates a complete feature structure for DevInn backend.

.DESCRIPTION
    Creates all necessary files for a new feature following Clean Architecture:
    - Command/Query in Application layer
    - Handler
    - Validator
    - Endpoint in WebApi layer

.PARAMETER Feature
    The feature name (e.g., "CreateRoom", "GetBookings")

.PARAMETER Aggregate
    The aggregate name (e.g., "Inventory", "Bookings", "Inns")

.PARAMETER Type
    The type of feature: "Command" or "Query"

.EXAMPLE
    .\generate-feature.ps1 -Feature CreateRoom -Aggregate Inventory -Type Command

.EXAMPLE
    .\generate-feature.ps1 -Feature GetRooms -Aggregate Inventory -Type Query
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$Feature,
    
    [Parameter(Mandatory = $true)]
    [string]$Aggregate,
    
    [Parameter(Mandatory = $true)]
    [ValidateSet("Command", "Query")]
    [string]$Type
)

$ErrorActionPreference = "Stop"

# Paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $scriptDir))
$applicationPath = Join-Path $apiRoot "src\DevInn.Application"
$webApiPath = Join-Path $apiRoot "src\DevInn.WebApi"

$featurePath = Join-Path $applicationPath "Features\$Aggregate\$Feature"
$endpointPath = Join-Path $webApiPath "Endpoints\$Aggregate"

# Create directories
New-Item -ItemType Directory -Path $featurePath -Force | Out-Null
New-Item -ItemType Directory -Path $endpointPath -Force | Out-Null

Write-Host "🚀 Generating feature: $Feature ($Type)" -ForegroundColor Cyan
Write-Host "📁 Aggregate: $Aggregate" -ForegroundColor Cyan

# Generate Command/Query
$requestFile = Join-Path $featurePath "$Feature$Type.cs"
$requestType = if ($Type -eq "Command") { "Result<Guid>" } else { "Result<List<${Aggregate}Dto>>" }

$requestContent = @"
using DevInn.Application.Common;
using MediatR;

namespace DevInn.Application.Features.$Aggregate.$Feature;

public sealed record $Feature$Type(
    // TODO: Add parameters
) : IRequest<$requestType>;
"@

Set-Content -Path $requestFile -Value $requestContent
Write-Host "✅ Created: $requestFile" -ForegroundColor Green

# Generate Handler
$handlerFile = Join-Path $featurePath "${Feature}Handler.cs"
$handlerContent = @"
using DevInn.Application.Common;
using DevInn.Application.Common.Interfaces.Persistence;
using MediatR;

namespace DevInn.Application.Features.$Aggregate.$Feature;

internal sealed class ${Feature}Handler 
    : IRequestHandler<$Feature$Type, $requestType>
{
    private readonly IApplicationDbContext _context;
    
    public ${Feature}Handler(IApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<$requestType> Handle(
        $Feature$Type request, 
        CancellationToken cancellationToken)
    {
        // TODO: Implement logic
        throw new NotImplementedException();
    }
}
"@

Set-Content -Path $handlerFile -Value $handlerContent
Write-Host "✅ Created: $handlerFile" -ForegroundColor Green

# Generate Validator (only for Commands)
if ($Type -eq "Command") {
    $validatorFile = Join-Path $featurePath "${Feature}Validator.cs"
    $validatorContent = @"
using FluentValidation;

namespace DevInn.Application.Features.$Aggregate.$Feature;

public sealed class ${Feature}Validator : AbstractValidator<$Feature$Type>
{
    public ${Feature}Validator()
    {
        // TODO: Add validation rules
    }
}
"@
    
    Set-Content -Path $validatorFile -Value $validatorContent
    Write-Host "✅ Created: $validatorFile" -ForegroundColor Green
}

# Generate Endpoint
$endpointFile = Join-Path $endpointPath "${Feature}Endpoint.cs"
$httpMethod = if ($Type -eq "Command") { "MapPost" } else { "MapGet" }
$route = "/api/v1/" + $Aggregate.ToLower()

$endpointContent = @"
using DevInn.Application.Features.$Aggregate.$Feature;
using DevInn.WebApi.Common;
using MediatR;

namespace DevInn.WebApi.Endpoints.$Aggregate;

public sealed class ${Feature}Endpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.$httpMethod("$route", Handle)
            .WithTags("$Aggregate")
            .RequireAuthorization();
            // TODO: Add response types with .Produces<>()
    }
    
    private static async Task<IResult> Handle(
        $Feature$Type request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(request, cancellationToken);
        
        return result.IsSuccess
            ? Results.Ok(result.Value)
            : result.ToProblemDetails();
    }
}
"@

Set-Content -Path $endpointFile -Value $endpointContent
Write-Host "✅ Created: $endpointFile" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Feature generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Implement the handler logic in ${Feature}Handler.cs"
if ($Type -eq "Command") {
    Write-Host "  2. Add validation rules in ${Feature}Validator.cs"
    Write-Host "  3. Update the endpoint route and response types in ${Feature}Endpoint.cs"
} else {
    Write-Host "  2. Update the endpoint route and response types in ${Feature}Endpoint.cs"
}
Write-Host "  4. Build and test the feature"
Write-Host ""
"@

Set-Content -Path $requestFile -Value $requestContent
Write-Host "✅ Created: $requestFile" -ForegroundColor Green

# Generate Handler
$handlerFile = Join-Path $featurePath "${Feature}Handler.cs"
$handlerContent = @"
using DevInn.Application.Common;
using DevInn.Application.Common.Interfaces.Persistence;
using MediatR;

namespace DevInn.Application.Features.$Aggregate.$Feature;

internal sealed class ${Feature}Handler 
    : IRequestHandler<$Feature$Type, $requestType>
{
    private readonly IApplicationDbContext _context;
    
    public ${Feature}Handler(IApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<$requestType> Handle(
        $Feature$Type request, 
        CancellationToken cancellationToken)
    {
        // TODO: Implement logic
        throw new NotImplementedException();
    }
}
"@

Set-Content -Path $handlerFile -Value $handlerContent
Write-Host "✅ Created: $handlerFile" -ForegroundColor Green

# Generate Validator (only for Commands)
if ($Type -eq "Command") {
    $validatorFile = Join-Path $featurePath "${Feature}Validator.cs"
    $validatorContent = @"
using FluentValidation;

namespace DevInn.Application.Features.$Aggregate.$Feature;

public sealed class ${Feature}Validator : AbstractValidator<$Feature$Type>
{
    public ${Feature}Validator()
    {
        // TODO: Add validation rules
    }
}
"@
    
    Set-Content -Path $validatorFile -Value $validatorContent
    Write-Host "✅ Created: $validatorFile" -ForegroundColor Green
}

# Generate Endpoint
$endpointFile = Join-Path $endpointPath "${Feature}Endpoint.cs"
$httpMethod = if ($Type -eq "Command") { "MapPost" } else { "MapGet" }
$route = "/api/v1/" + $Aggregate.ToLower()

$endpointContent = @"
using DevInn.Application.Features.$Aggregate.$Feature;
using DevInn.WebApi.Common;
using MediatR;

namespace DevInn.WebApi.Endpoints.$Aggregate;

public sealed class ${Feature}Endpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.$httpMethod("$route", Handle)
            .WithTags("$Aggregate")
            .RequireAuthorization();
            // TODO: Add response types with .Produces<>()
    }
    
    private static async Task<IResult> Handle(
        $Feature$Type request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(request, cancellationToken);
        
        return result.IsSuccess
            ? Results.Ok(result.Value)
            : result.ToProblemDetails();
    }
}
"@

Set-Content -Path $endpointFile -Value $endpointContent
Write-Host "✅ Created: $endpointFile" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Feature generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Implement the handler logic in ${Feature}Handler.cs"
if ($Type -eq "Command") {
    Write-Host "  2. Add validation rules in ${Feature}Validator.cs"
    Write-Host "  3. Update the endpoint route and response types in ${Feature}Endpoint.cs"
} else {
    Write-Host "  2. Update the endpoint route and response types in ${Feature}Endpoint.cs"
}
Write-Host "  4. Build and test the feature"
Write-Host ""
"@

Set-Content -Path "D:\repos\projects\devinn\.github\skills\devinn-backend\scripts\generate-feature.ps1" -Value $requestContent
