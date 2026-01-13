namespace DevInn.Application.Common.Abstractions;

public interface IUseCase<in TInput, TOutput>
{
    ValueTask<TOutput> ExecuteAsync(TInput input, CancellationToken cancellationToken = default);
}