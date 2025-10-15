export class Module {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly shortDescription: string,
    public readonly description: string,
    public readonly content: string,
    public readonly studyCredit: number,
    public readonly location: string,
    public readonly contactId: string,
    public readonly level: string,
    public readonly learningOutcomes: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}


  public hasMinimumCredits(): boolean {
    return this.studyCredit > 0;
  }

  public updateContent(content: string): Module {
    return new Module(
      this.id,
      this.name,
      this.shortDescription,
      this.description,
      content,
      this.studyCredit,
      this.location,
      this.contactId,
      this.level,
      this.learningOutcomes,
      this.createdAt,
      new Date(),
    );
  }
}