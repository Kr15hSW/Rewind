using Microsoft.EntityFrameworkCore;
using RewindAPI.Models;

namespace RewindAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User>            Users             { get; set; }
    public DbSet<MediaItem>       MediaItems        { get; set; }
    public DbSet<MovieDetails>    MovieDetails      { get; set; }
    public DbSet<SeriesDetails>   SeriesDetails     { get; set; }
    public DbSet<BookDetails>     BookDetails       { get; set; }
    public DbSet<GameDetails>     GameDetails       { get; set; }
    public DbSet<CollectionEntry> CollectionEntries { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Users
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // MediaItems - the enum MediaType is saved as a string ("Movie", "Series"...)
        modelBuilder.Entity<MediaItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ExternalId);
            entity.HasIndex(e => e.Type);
            entity.Property(e => e.Type).HasConversion<string>();
        });

        // MovieDetails - 1 to 1 with MediaItem
        modelBuilder.Entity<MovieDetails>(entity =>
        {
            entity.HasKey(e => e.MediaItemId);
            entity.HasOne(e => e.MediaItem)
                  .WithOne(m => m.MovieDetails)
                  .HasForeignKey<MovieDetails>(e => e.MediaItemId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // SeriesDetails - 1 to 1 with MediaItem
        modelBuilder.Entity<SeriesDetails>(entity =>
        {
            entity.HasKey(e => e.MediaItemId);
            entity.HasOne(e => e.MediaItem)
                  .WithOne(m => m.SeriesDetails)
                  .HasForeignKey<SeriesDetails>(e => e.MediaItemId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // BookDetails - 1 to 1 with MediaItem
        modelBuilder.Entity<BookDetails>(entity =>
        {
            entity.HasKey(e => e.MediaItemId);
            entity.HasOne(e => e.MediaItem)
                  .WithOne(m => m.BookDetails)
                  .HasForeignKey<BookDetails>(e => e.MediaItemId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // GameDetails - 1 to 1 with MediaItem
        modelBuilder.Entity<GameDetails>(entity =>
        {
            entity.HasKey(e => e.MediaItemId);
            entity.HasOne(e => e.MediaItem)
                  .WithOne(m => m.GameDetails)
                  .HasForeignKey<GameDetails>(e => e.MediaItemId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // CollectionEntry - * to 1 with User and MediaItem
        modelBuilder.Entity<CollectionEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.MediaItemId }).IsUnique();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.MediaItem)
                  .WithMany(m => m.CollectionEntries)
                  .HasForeignKey(e => e.MediaItemId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}