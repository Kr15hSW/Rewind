using System.ComponentModel.DataAnnotations.Schema;

namespace RewindAPI.Models;

[Table("book_details")]
public class BookDetails
{
    [Column("media_item_id")]
    public Guid MediaItemId { get; set; }

    [Column("author")]
    public string? Author { get; set; }

    [Column("publisher")]
    public string? Publisher { get; set; }

    [Column("pages")]
    public int? Pages { get; set; }

    [Column("isbn")]
    public string? Isbn { get; set; }

    public MediaItem MediaItem { get; set; } = null!;
}