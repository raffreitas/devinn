using System.Security.Claims;

using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Tenancy;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Infrastructure.Common.Constants;
using DevInn.WebApi.Middlewares;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using NSubstitute;

using Shouldly;

namespace DevInn.UnitTests.WebApi.Middlewares;

[Trait("Category", "Unit")]
[Trait("Category", "WebApi")]
public sealed class TenantMiddlewareTests
{
    private readonly ITenantContext _tenantContext = Substitute.For<ITenantContext>();
    private readonly ILogger<TenantMiddleware> _logger = Substitute.For<ILogger<TenantMiddleware>>();

    [Fact]
    public async Task InvokeAsync_ShouldUseClaimTenantAndCallNext_WhenInnAdminDoesNotSendHeader()
    {
        var tenantId = Guid.NewGuid();
        var context = CreateContext(UserRole.InnAdmin, tenantId);
        var nextCalled = false;

        var sut = CreateSut();

        await sut.InvokeAsync(context, _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        nextCalled.ShouldBeTrue();
        _tenantContext.Received(1).SetTenant(Arg.Is<Tenant>(tenant => tenant.Id == tenantId));
    }

    [Fact]
    public async Task InvokeAsync_ShouldUseClaimTenantAndCallNext_WhenInnAdminHeaderMatchesClaim()
    {
        var tenantId = Guid.NewGuid();
        var context = CreateContext(UserRole.InnAdmin, tenantId, tenantId.ToString());
        var nextCalled = false;

        var sut = CreateSut();

        await sut.InvokeAsync(context, _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        nextCalled.ShouldBeTrue();
        _tenantContext.Received(1).SetTenant(Arg.Is<Tenant>(tenant => tenant.Id == tenantId));
    }

    [Fact]
    public async Task InvokeAsync_ShouldReturnForbiddenAndNotCallNext_WhenInnAdminHeaderDoesNotMatchClaim()
    {
        var claimTenantId = Guid.NewGuid();
        var headerTenantId = Guid.NewGuid();
        var context = CreateContext(UserRole.InnAdmin, claimTenantId, headerTenantId.ToString());
        var nextCalled = false;

        var sut = CreateSut();

        await sut.InvokeAsync(context, _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        context.Response.StatusCode.ShouldBe(StatusCodes.Status403Forbidden);
        nextCalled.ShouldBeFalse();
        _tenantContext.DidNotReceive().SetTenant(Arg.Any<Tenant>());
    }

    [Fact]
    public async Task InvokeAsync_ShouldReturnBadRequest_WhenInnAdminDoesNotHaveValidTenantClaim()
    {
        var context = CreateContext(UserRole.InnAdmin, tenantClaim: null);
        var nextCalled = false;

        var sut = CreateSut();

        await sut.InvokeAsync(context, _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        context.Response.StatusCode.ShouldBe(StatusCodes.Status400BadRequest);
        nextCalled.ShouldBeFalse();
        _tenantContext.DidNotReceive().SetTenant(Arg.Any<Tenant>());
    }

    [Fact]
    public async Task InvokeAsync_ShouldUseHeaderTenantAndCallNext_WhenSuperAdminSendsHeader()
    {
        var headerTenantId = Guid.NewGuid();
        var context = CreateContext(UserRole.SuperAdmin, tenantClaim: null, headerTenantId.ToString());
        var nextCalled = false;

        var sut = CreateSut();

        await sut.InvokeAsync(context, _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        nextCalled.ShouldBeTrue();
        _tenantContext.Received(1).SetTenant(Arg.Is<Tenant>(tenant => tenant.Id == headerTenantId));
    }

    [Fact]
    public async Task InvokeAsync_ShouldUseEmptyTenantAndCallNext_WhenSuperAdminDoesNotSendHeader()
    {
        var context = CreateContext(UserRole.SuperAdmin, tenantClaim: null);
        var nextCalled = false;

        var sut = CreateSut();

        await sut.InvokeAsync(context, _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        nextCalled.ShouldBeTrue();
        _tenantContext.Received(1).SetTenant(Arg.Is<Tenant>(tenant => tenant.Id == Guid.Empty));
    }

    [Fact]
    public async Task InvokeAsync_ShouldReturnBadRequest_WhenTenantHeaderIsMalformed()
    {
        var context = CreateContext(UserRole.SuperAdmin, tenantClaim: null, "not-a-guid");
        var nextCalled = false;

        var sut = CreateSut();

        await sut.InvokeAsync(context, _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        context.Response.StatusCode.ShouldBe(StatusCodes.Status400BadRequest);
        nextCalled.ShouldBeFalse();
        _tenantContext.DidNotReceive().SetTenant(Arg.Any<Tenant>());
    }

    private TenantMiddleware CreateSut() => new(_tenantContext, _logger);

    private static DefaultHttpContext CreateContext(
        UserRole role,
        Guid? tenantClaim,
        string? tenantHeader = null)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Role, role.ToString())
        };

        if (tenantClaim is not null)
            claims.Add(new Claim(TenantKeys.InnClaim, tenantClaim.Value.ToString()));

        var context = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"))
        };
        context.Response.Body = new MemoryStream();

        if (tenantHeader is not null)
            context.Request.Headers[TenantKeys.InnHeader] = tenantHeader;

        return context;
    }
}
