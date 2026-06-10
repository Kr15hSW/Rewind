namespace RewindAPI.DTOs;

public class AddToCollectionRequest
{
    public Guid    MediaItemId    { get; set; }
    public string  Status         { get; set; } = "pending";
    public int?    Score          { get; set; }
    public string? Review         { get; set; }
    public string? PlatformPlayed { get; set; }
}