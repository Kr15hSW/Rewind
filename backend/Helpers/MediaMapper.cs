using RewindAPI.DTOs;
using RewindAPI.Models;

namespace RewindAPI.Helpers;

public static class MediaMapper
{
    public static MediaItemResponse ToResponse(MediaItem item) => new()
    {
        Id          = item.Id,
        Type        = item.Type.ToString().ToLower(),
        Title       = item.Title,
        Description = item.Description,
        CoverUrl    = item.CoverUrl,
        ReleaseYear = item.ReleaseYear,
        Genres      = item.Genres,
        ExternalId  = item.ExternalId,

        Director         = item.MovieDetails?.Director,
        DurationMinutes  = item.MovieDetails?.DurationMinutes,
        OriginalLanguage = item.MovieDetails?.OriginalLanguage,

        Creator       = item.SeriesDetails?.Creator,
        TotalSeasons  = item.SeriesDetails?.TotalSeasons,
        TotalEpisodes = item.SeriesDetails?.TotalEpisodes,
        SeriesStatus  = item.SeriesDetails?.SeriesStatus,

        Author    = item.BookDetails?.Author,
        Publisher = item.BookDetails?.Publisher,
        Pages     = item.BookDetails?.Pages,
        Isbn      = item.BookDetails?.Isbn,

        Developer = item.GameDetails?.Developer,
        Platforms = item.GameDetails?.Platforms ?? Array.Empty<string>()
    };
}