using System.ComponentModel.DataAnnotations.Schema;

namespace RewindAPI.Models;

[Table("series_details")]
public class SeriesDetails
{
    [Column("media_item_id")]
    public Guid MediaItemId { get; set; }

    [Column("creator")]
    public string? Creator { get; set; }

    [Column("total_seasons")]
    public int? TotalSeasons { get; set; }

    [Column("total_episodes")]
    public int? TotalEpisodes { get; set; }

    [Column("series_status")]
    public string? SeriesStatus { get; set; }

    public MediaItem MediaItem { get; set; } = null!;
}