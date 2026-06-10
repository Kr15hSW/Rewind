namespace RewindAPI.DTOs;

public class UpdateCollectionEntryRequest
{
    public string? Status         { get; set; }
    public int?    Score          { get; set; }
    public string? Review         { get; set; }
    public string? PlatformPlayed { get; set; }
}