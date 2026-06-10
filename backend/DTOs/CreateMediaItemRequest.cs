namespace RewindAPI.DTOs;

public class CreateMediaItemRequest
{
    public string   Type        { get; set; } = null!;
    public string   Title       { get; set; } = null!;
    public string?  Description { get; set; }
    public string?  CoverUrl    { get; set; }
    public int?     ReleaseYear { get; set; }
    public string[] Genres      { get; set; } = Array.Empty<string>();
    public string?  ExternalId  { get; set; }

    // Detalles de película
    public string? Director         { get; set; }
    public int?    DurationMinutes  { get; set; }
    public string? OriginalLanguage { get; set; }

    // Detalles de serie
    public string? Creator       { get; set; }
    public int?    TotalSeasons  { get; set; }
    public int?    TotalEpisodes { get; set; }
    public string? SeriesStatus  { get; set; }

    // Detalles de libro
    public string? Author    { get; set; }
    public string? Publisher { get; set; }
    public int?    Pages     { get; set; }
    public string? Isbn      { get; set; }

    // Detalles de juego
    public string?  Developer     { get; set; }
    public string?  GamePublisher { get; set; }
    public string[] Platforms     { get; set; } = Array.Empty<string>();
}