namespace DevInn.Application.Common.Validation;

public sealed record ValidationFailure(string Field, string Message);