using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RewindAPI.Data;
using RewindAPI.DTOs;
using RewindAPI.Helpers;
using RewindAPI.Models;

namespace RewindAPI.Controllers;

[ApiController]
[Route("api/media")]
[Authorize]
public class MediaController : ControllerBase
{
    private readonly AppDbContext _db;

    public MediaController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/media/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMediaItem(Guid id)
    {
        var item = await _db.MediaItems
            .Include(m => m.MovieDetails)
            .Include(m => m.SeriesDetails)
            .Include(m => m.BookDetails)
            .Include(m => m.GameDetails)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (item is null)
            return NotFound(new { message = "Contenido no encontrado" });

        return Ok(MediaMapper.ToResponse(item));
    }

    // POST api/media
    [HttpPost]
    public async Task<IActionResult> CreateMediaItem([FromBody] CreateMediaItemRequest request)
    {
        if (!Enum.TryParse<MediaType>(request.Type, ignoreCase: true, out var mediaType))
            return BadRequest(new { message = "Tipo inválido. Usa: movie, series, book, game" });

        if (request.ExternalId is not null)
        {   
            // if the item exists in the global catalogue, return it as is
            // (200 OK). This way different users can add the same content to
            // their collections without the catalogue trying to duplicate
            var existing = await _db.MediaItems
                .Include(m => m.MovieDetails)
                .Include(m => m.SeriesDetails)
                .Include(m => m.BookDetails)
                .Include(m => m.GameDetails)
                .FirstOrDefaultAsync(m =>
                    m.ExternalId == request.ExternalId && m.Type == mediaType);

            if (existing is not null)
                return Ok(MediaMapper.ToResponse(existing));
        }

        var item = new MediaItem
        {
            ExternalId  = request.ExternalId,
            Type        = mediaType,
            Title       = request.Title,
            Description = request.Description,
            CoverUrl    = request.CoverUrl,
            ReleaseYear = request.ReleaseYear,
            Genres      = request.Genres
        };

        switch (mediaType)
        {
            case MediaType.Movie:
                item.MovieDetails = new MovieDetails
                {
                    Director         = request.Director,
                    DurationMinutes  = request.DurationMinutes,
                    OriginalLanguage = request.OriginalLanguage
                };
                break;
            case MediaType.Series:
                item.SeriesDetails = new SeriesDetails
                {
                    Creator       = request.Creator,
                    TotalSeasons  = request.TotalSeasons,
                    TotalEpisodes = request.TotalEpisodes,
                    SeriesStatus  = request.SeriesStatus
                };
                break;
            case MediaType.Book:
                item.BookDetails = new BookDetails
                {
                    Author    = request.Author,
                    Publisher = request.Publisher,
                    Pages     = request.Pages,
                    Isbn      = request.Isbn
                };
                break;
            case MediaType.Game:
                item.GameDetails = new GameDetails
                {
                    Developer = request.Developer,
                    Publisher = request.GamePublisher,
                    Platforms = request.Platforms
                };
                break;
        }

        _db.MediaItems.Add(item);
        await _db.SaveChangesAsync();

        return Created("", MediaMapper.ToResponse(item));
    }
}