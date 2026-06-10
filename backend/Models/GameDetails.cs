using System.ComponentModel.DataAnnotations.Schema;

namespace RewindAPI.Models;

[Table("game_details")]
public class GameDetails
{
    [Column("media_item_id")]
    public Guid MediaItemId { get; set; }

    [Column("developer")]
    public string? Developer { get; set; }

    [Column("publisher")]
    public string? Publisher { get; set; }

    [Column("platforms")]
    public string[] Platforms { get; set; } = Array.Empty<string>();

    public MediaItem MediaItem { get; set; } = null!;
}