using System.Text.Json;
using Amazon.S3;
using Amazon.S3.Model;
using DevInn.Backup.Configuration;
using Microsoft.Extensions.Options;

namespace DevInn.Backup.Storage;

internal interface IBackupStorage
{
    Task UploadAsync(string key, string filePath, CancellationToken cancellationToken);
    Task UploadJsonAsync<T>(string key, T content, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<S3Object>> ListAsync(string prefix, CancellationToken cancellationToken);
    Task DeleteAsync(string key, CancellationToken cancellationToken);
}

internal sealed class S3BackupStorage(IAmazonS3 amazonS3, IOptions<BackupOptions> options) : IBackupStorage
{
    private readonly BackupOptions _options = options.Value;

    private static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        WriteIndented = true
    };

    public Task UploadAsync(string key, string filePath, CancellationToken cancellationToken)
        => amazonS3.PutObjectAsync(
            new PutObjectRequest
            {
                BucketName = _options.S3Bucket,
                Key = key,
                FilePath = filePath,
                ContentType = "application/octet-stream",
                UseChunkEncoding = false,
                DisablePayloadSigning = true
            },
            cancellationToken);

    public Task UploadJsonAsync<T>(string key, T content, CancellationToken cancellationToken)
        => amazonS3.PutObjectAsync(
            new PutObjectRequest
            {
                BucketName = _options.S3Bucket,
                Key = key,
                ContentBody = JsonSerializer.Serialize(content, JsonSerializerOptions),
                ContentType = "application/json; charset=utf-8",
                UseChunkEncoding = false,
                DisablePayloadSigning = true
            },
            cancellationToken);

    public async Task<IReadOnlyCollection<S3Object>> ListAsync(string prefix, CancellationToken cancellationToken)
    {
        var objects = new List<S3Object>();
        string? continuationToken = null;

        do
        {
            var response = await amazonS3.ListObjectsV2Async(
                new ListObjectsV2Request
                {
                    BucketName = _options.S3Bucket,
                    Prefix = prefix,
                    ContinuationToken = continuationToken
                },
                cancellationToken);

            objects.AddRange(response.S3Objects.Select(obj =>
                new S3Object(
                    obj.Key,
                    new DateTimeOffset((obj.LastModified ?? DateTime.UnixEpoch).ToUniversalTime()),
                    obj.Size ?? 0)));

            continuationToken = response.IsTruncated == true ? response.NextContinuationToken : null;
        } while (!string.IsNullOrWhiteSpace(continuationToken));

        return objects;
    }

    public Task DeleteAsync(string key, CancellationToken cancellationToken)
        => amazonS3.DeleteObjectAsync(
            new DeleteObjectRequest
            {
                BucketName = _options.S3Bucket,
                Key = key
            },
            cancellationToken);
}
