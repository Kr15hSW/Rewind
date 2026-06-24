namespace RewindAPI.DTOs;

public class UserResponse
{
    public Guid           Id        { get; set; }
    public string         Username  { get; set; } = null!;
    public string         Email     { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
}