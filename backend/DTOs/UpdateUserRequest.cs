namespace RewindAPI.DTOs;

public class UpdateUserRequest
{
    public string? Username        { get; set; }
    public string? CurrentPassword { get; set; }
    public string? NewPassword     { get; set; }
}