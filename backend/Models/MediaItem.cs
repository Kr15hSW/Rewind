using System.ComponentModel.DataAnnotations.Schema;

namespace RewindAPI.Models;

[Table("media_items")]
public class MediaItem
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("external_id")]
    public string? ExternalId { get; set; }

    [Column("type")]
    public MediaType Type { get; set; }

    [Column("title")]
    public string Title { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("cover_url")]
    public string? CoverUrl { get; set; }

    [Column("release_year")]
    public int? ReleaseYear { get; set; }

    [Column("genres")]
    public string[] Genres { get; set; } = Array.Empty<string>();

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties - EF Core can load these objects automatically
    public MovieDetails?  MovieDetails  { get; set; }
    public SeriesDetails? SeriesDetails { get; set; }
    public BookDetails?   BookDetails   { get; set; }
    public GameDetails?   GameDetails   { get; set; }
    public ICollection<CollectionEntry> CollectionEntries { get; set; } = new List<CollectionEntry>();
}