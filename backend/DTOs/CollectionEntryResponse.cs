namespace RewindAPI.DTOs;

public class CollectionEntryResponse
{
    public Guid              Id             { get; set; }
    public string            Status         { get; set; } = null!;
    public int?              Score          { get; set; }
    public string?           Review         { get; set; }
    public string?           PlatformPlayed { get; set; }
    public DateTimeOffset    AddedAt        { get; set; }
    public MediaItemResponse MediaItem      { get; set; } = null!;
}