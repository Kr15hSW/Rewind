using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RewindAPI.Data;
using RewindAPI.DTOs;
using RewindAPI.Helpers;
using RewindAPI.Models;
using System.Security.Claims;

namespace RewindAPI.Controllers;

[ApiController]
[Route("api/collection")]
[Authorize]
public class CollectionController : ControllerBase
{
    private readonly AppDbContext _db;

    public CollectionController(AppDbContext db)
    {
        _db = db;
    }

    // Extrae el ID del usuario autenticado desde el token JWT
    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Convierte el enum a string con el formato correcto para la API
    private static string StatusToString(CollectionStatus s) => s switch
    {
        CollectionStatus.InProgress => "in_progress",
        _ => s.ToString().ToLower()
    };

    // Parsea el string de la petición al enum correspondiente
    private static bool TryParseStatus(string input, out CollectionStatus result)
    {
        result = input.ToLower() switch
        {
            "pending"     => CollectionStatus.Pending,
            "in_progress" => CollectionStatus.InProgress,
            "completed"   => CollectionStatus.Completed,
            "dropped"     => CollectionStatus.Dropped,
            _             => CollectionStatus.Pending
        };
        return input.ToLower() is "pending" or "in_progress" or "completed" or "dropped";
    }

    // GET api/collection
    [HttpGet]
    public async Task<IActionResult> GetCollection()
    {
        var userId = GetUserId();

        var entries = await _db.CollectionEntries
            .Where(e => e.UserId == userId)
            .Include(e => e.MediaItem).ThenInclude(m => m.MovieDetails)
            .Include(e => e.MediaItem).ThenInclude(m => m.SeriesDetails)
            .Include(e => e.MediaItem).ThenInclude(m => m.BookDetails)
            .Include(e => e.MediaItem).ThenInclude(m => m.GameDetails)
            .OrderByDescending(e => e.AddedAt)
            .ToListAsync();

        var response = entries.Select(e => new CollectionEntryResponse
        {
            Id             = e.Id,
            Status         = StatusToString(e.Status),
            Score          = e.Score,
            Review         = e.Review,
            PlatformPlayed = e.PlatformPlayed,
            AddedAt        = e.AddedAt,
            MediaItem      = MediaMapper.ToResponse(e.MediaItem)
        });

        return Ok(response);
    }

    // POST api/collection
    [HttpPost]
    public async Task<IActionResult> AddToCollection([FromBody] AddToCollectionRequest request)
    {
        var userId = GetUserId();

        var mediaItem = await _db.MediaItems.FindAsync(request.MediaItemId);
        if (mediaItem is null)
            return NotFound(new { message = "El contenido no existe en el catálogo" });

        var alreadyAdded = await _db.CollectionEntries.AnyAsync(e =>
            e.UserId == userId && e.MediaItemId == request.MediaItemId);
        if (alreadyAdded)
            return Conflict(new { message = "Este contenido ya está en tu colección" });

        if (!TryParseStatus(request.Status, out var status))
            return BadRequest(new { message = "Estado inválido. Usa: pending, in_progress, completed, dropped" });

        if (request.Score.HasValue && (request.Score < 1 || request.Score > 10))
            return BadRequest(new { message = "La puntuación debe estar entre 1 y 10" });

        var entry = new CollectionEntry
        {
            UserId         = userId,
            MediaItemId    = request.MediaItemId,
            Status         = status,
            Score          = request.Score,
            Review         = request.Review,
            PlatformPlayed = request.PlatformPlayed
        };

        _db.CollectionEntries.Add(entry);
        await _db.SaveChangesAsync();

        return Created("", new { message = "Añadido a la colección", id = entry.Id });
    }

    // PUT api/collection/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEntry(Guid id, [FromBody] UpdateCollectionEntryRequest request)
    {
        var userId = GetUserId();

        var entry = await _db.CollectionEntries
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (entry is null)
            return NotFound(new { message = "Entrada no encontrada" });

        if (request.Status is not null)
        {
            if (!TryParseStatus(request.Status, out var status))
                return BadRequest(new { message = "Estado inválido. Usa: pending, in_progress, completed, dropped" });
            entry.Status = status;
        }

        // Validamos el rango solo si llega una puntuación.
        if (request.Score.HasValue && (request.Score < 1 || request.Score > 10))
            return BadRequest(new { message = "La puntuación debe estar entre 1 y 10" });

        // To be able to persist a delete score or review from frontend
        entry.Score  = request.Score;
        entry.Review = request.Review;

        if (request.PlatformPlayed is not null) entry.PlatformPlayed = request.PlatformPlayed;

        entry.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Entrada actualizada correctamente" });
    }

    // DELETE api/collection/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveFromCollection(Guid id)
    {
        var userId = GetUserId();

        var entry = await _db.CollectionEntries
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (entry is null)
            return NotFound(new { message = "Entrada no encontrada" });

        _db.CollectionEntries.Remove(entry);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Eliminado de la colección" });
    }
}