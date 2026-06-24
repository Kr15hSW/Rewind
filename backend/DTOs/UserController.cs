using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RewindAPI.Data;
using RewindAPI.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace RewindAPI.Controllers;

[ApiController]
[Route("api/user")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db)
    {
        _db = db;
    }

    private Guid GetUserId() =>
        Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)!
        );

    // GET api/user
    [HttpGet]
    public async Task<IActionResult> GetUser()
    {
        var userId = GetUserId();
        var user   = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        return Ok(new UserResponse
        {
            Id        = user.Id,
            Username  = user.Username,
            Email     = user.Email,
            CreatedAt = user.CreatedAt,
        });
    }

    // PUT api/user: actualiza username y/o contraseña
    [HttpPut]
    public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest request)
    {
        var userId = GetUserId();
        var user   = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(request.Username) && request.Username != user.Username)
        {
            if (await _db.Users.AnyAsync(u => u.Username == request.Username && u.Id != userId))
                return Conflict(new { message = "El nombre de usuario ya está en uso" });

            user.Username = request.Username;
        }

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
                return BadRequest(new { message = "Se requiere la contraseña actual" });

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return Unauthorized(new { message = "Contraseña actual incorrecta" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        }

        await _db.SaveChangesAsync();

        return Ok(new UserResponse
        {
            Id        = user.Id,
            Username  = user.Username,
            Email     = user.Email,
            CreatedAt = user.CreatedAt,
        });
    }

    // DELETE api/user: elimina la cuenta y toda su colección (ON DELETE CASCADE)
    [HttpDelete]
    public async Task<IActionResult> DeleteUser()
    {
        var userId = GetUserId();
        var user   = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}