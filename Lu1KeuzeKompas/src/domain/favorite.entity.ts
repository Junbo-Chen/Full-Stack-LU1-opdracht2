export class Favorite {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly notes?: string, // optioneel
  ) {}

  // Check of dit favoriet van een specifieke gebruiker is
  public belongsTo(userId: string): boolean {
    return this.userId === userId;
  }

  // Update notities van favoriet
  public updateNotes(notes: string): Favorite {
    return new Favorite(
      this.id,
      this.userId,
      this.courseId,
      this.createdAt,
      new Date(),
      notes
    );
  }
}
