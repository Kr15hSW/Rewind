using System.ComponentModel.DataAnnotations.Schema;

namespace RewindAPI.Models;

[Table("user_collection")]
public class CollectionEntry
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("media_item_id")]
    public Guid MediaItemId { get; set; }

    [Column("status")]
    public CollectionStatus Status { get; set; } = CollectionStatus.Pending;

    [Column("score")]
    public int? Score { get; set; }

    [Column("review")]
    public string? Review { get; set; }

    [Column("platform_played")]
    public string? PlatformPlayed { get; set; }

    [Column("added_at")]
    public DateTimeOffset AddedAt { get; set; } = DateTimeOffset.UtcNow;

    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public User        User      { get; set; } = null!;
    public MediaItem   MediaItem { get; set; } = null!;
}