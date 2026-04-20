using System.Net;
using System.Net.Http.Json;
using Moq;
using Moq.Protected;
using NexApply.Api.Common;
using NexApply.Api.Features.Auth;
using NexApply.Api.Features.Auth.LoginWithEmail;
using NexApply.Client.Services.Auth;

namespace NexApply.Tests.Unit;

public class AuthApiServiceTests
{
    [Fact]
    public async Task LoginWithEmail_Success_ReturnsTokens()
    {
        // Arrange
        var expectedResponse = new TokenResponseDto
        {
            AccessToken = "test-access-token",
            RefreshToken = "test-refresh-token"
        };

        var mockHandler = new Mock<HttpMessageHandler>();
        mockHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = JsonContent.Create(expectedResponse)
            });

        var httpClient = new HttpClient(mockHandler.Object)
        {
            BaseAddress = new Uri("http://localhost")
        };

        var service = new AuthApiService(httpClient);
        var command = new LoginWithEmailCommand("test-id-token");

        // Act
        var result = await service.LoginWithEmail(command);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("test-access-token", result.Value.AccessToken);
        Assert.Equal("test-refresh-token", result.Value.RefreshToken);
    }

    [Fact]
    public async Task LoginWithEmail_Failure_ReturnsError()
    {
        // Arrange
        var mockHandler = new Mock<HttpMessageHandler>();
        mockHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.BadRequest,
                Content = JsonContent.Create(new { Error = "Invalid token" })
            });

        var httpClient = new HttpClient(mockHandler.Object)
        {
            BaseAddress = new Uri("http://localhost")
        };

        var service = new AuthApiService(httpClient);
        var command = new LoginWithEmailCommand("invalid-token");

        // Act
        var result = await service.LoginWithEmail(command);

        // Assert
        Assert.False(result.IsSuccess);
    }

    [Fact]
    public async Task LoginWithEmail_CallsCorrectEndpoint()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;

        var mockHandler = new Mock<HttpMessageHandler>();
        mockHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .Callback<HttpRequestMessage, CancellationToken>((req, _) => capturedRequest = req)
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = JsonContent.Create(new TokenResponseDto
                {
                    AccessToken = "token",
                    RefreshToken = "refresh"
                })
            });

        var httpClient = new HttpClient(mockHandler.Object)
        {
            BaseAddress = new Uri("http://localhost")
        };

        var service = new AuthApiService(httpClient);
        var command = new LoginWithEmailCommand("test-token");

        // Act
        await service.LoginWithEmail(command);

        // Assert
        Assert.NotNull(capturedRequest);
        Assert.Equal(HttpMethod.Post, capturedRequest.Method);
        Assert.Contains("api/auth/login-email", capturedRequest.RequestUri?.ToString());
    }
}
