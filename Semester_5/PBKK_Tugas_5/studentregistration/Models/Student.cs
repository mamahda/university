namespace StudentRegistration.Models;

public class Student
{
    public int StudentId { get; set; }

    public string NIM { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public int ProgramId { get; set; }

    public string ProgramName { get; set; } = string.Empty;

    public DateTime? BirthDate { get; set; }

    public string Address { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
