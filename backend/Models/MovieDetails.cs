using System.ComponentModel.DataAnnotations.Schema;

namespace RewindAPI.Models;

[Table("movie_details")]
public class MovieDetails
{
    [Column("media_item_id")]
    public Guid MediaItemId { get; set; }

    [Column("director")]
    public string? Director { get; set; }

    [Column("duration_minutes")]
    public int? DurationMinutes { get; set; }

    [Column("original_language")]
    public string? OriginalLanguage { get; set; }

    public MediaItem MediaItem { get; set; } = null!;
}