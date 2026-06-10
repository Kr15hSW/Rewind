namespace RewindAPI.DTOs;

public class MediaItemResponse
{
    public Guid     Id          { get; set; }
    public string   Type        { get; set; } = null!;
    public string   Title       { get; set; } = null!;
    public string?  Description { get; set; }
    public string?  CoverUrl    { get; set; }
    public int?     ReleaseYear { get; set; }
    public string[] Genres      { get; set; } = Array.Empty<string>();
    public string?  ExternalId  { get; set; }

    public string? Director         { get; set; }
    public int?    DurationMinutes  { get; set; }
    public string? OriginalLanguage { get; set; }
    public string? Creator          { get; set; }
    public int?    TotalSeasons     { get; set; }
    public int?    TotalEpisodes    { get; set; }
    public string? SeriesStatus     { get; set; }
    public string? Author           { get; set; }
    public string? Publisher        { get; set; }
    public int?    Pages            { get; set; }
    public string? Isbn             { get; set; }
    public string? Developer        { get; set; }
    public string[] Platforms       { get; set; } = Array.Empty<string>();
}