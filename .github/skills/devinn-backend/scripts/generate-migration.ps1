#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Creates and applies a new Entity Framework migration for DevInn.

.DESCRIPTION
    Helper script to create migrations for either ApplicationDbContext or IdentityDbContext
    with the correct parameters.

.PARAMETER Name
    The migration name (e.g., "AddRoomsTable")

.PARAMETER Context
    The context to use: "App" (ApplicationDbContext) or "Identity" (IdentityDbContext)

.PARAMETER Apply
    Switch to automatically apply the migration after creation

.EXAMPLE
    .\generate-migration.ps1 -Name AddRoomsTable -Context App

.EXAMPLE
    .\generate-migration.ps1 -Name AddUserRoles -Context Identity -Apply
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    
    [Parameter(Mandatory = $false)]
    [ValidateSet("App", "Identity")]
    [string]$Context = "App",
    
    [Parameter(Mandatory = $false)]
    [switch]$Apply
)

$ErrorActionPreference = "Stop"

# Paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $scriptDir))

# Set working directory to API root
Push-Location $apiRoot

try {
    # Configure based on context
    $contextName = if ($Context -eq "App") { "ApplicationDbContext" } else { "IdentityDbContext" }
    $outputPath = if ($Context -eq "App") { "Persistence/Migrations" } else { "Identity/Migrations" }
    
    Write-Host "🔨 Creating migration: $Name" -ForegroundColor Cyan
    Write-Host "📦 Context: $contextName" -ForegroundColor Cyan
    Write-Host "📁 Output path: $outputPath" -ForegroundColor Cyan
    Write-Host ""
    
    # Generate migration name with version prefix if not present
    $migrationName = if ($Name -match "^V\d+") { $Name } else { "V$Name" }
    
    # Create migration
    $migrationArgs = @(
        "ef", "migrations", "add", $migrationName,
        "-p", "src\DevInn.Infrastructure",
        "-s", "src\DevInn.WebApi",
        "-c", $contextName,
        "-o", $outputPath
    )
    
    Write-Host "▶️ Running: dotnet $($migrationArgs -join ' ')" -ForegroundColor Gray
    & dotnet @migrationArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "Migration creation failed"
    }
    
    Write-Host ""
    Write-Host "✅ Migration created successfully!" -ForegroundColor Green
    
    # Apply migration if requested
    if ($Apply) {
        Write-Host ""
        Write-Host "🚀 Applying migration..." -ForegroundColor Cyan
        
        $updateArgs = @(
            "ef", "database", "update",
            "-p", "src\DevInn.Infrastructure",
            "-s", "src\DevInn.WebApi",
            "-c", $contextName
        )
        
        Write-Host "▶️ Running: dotnet $($updateArgs -join ' ')" -ForegroundColor Gray
        & dotnet @updateArgs
        
        if ($LASTEXITCODE -ne 0) {
            throw "Migration application failed"
        }
        
        Write-Host ""
        Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "📝 To apply this migration, run:" -ForegroundColor Yellow
        Write-Host "   make db-update" -ForegroundColor White
        Write-Host "   or" -ForegroundColor White
        Write-Host "   .\generate-migration.ps1 -Name $Name -Context $Context -Apply" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "📝 Migration files created in:" -ForegroundColor Cyan
    Write-Host "   src\DevInn.Infrastructure\$outputPath\" -ForegroundColor White
    
} finally {
    Pop-Location
}
