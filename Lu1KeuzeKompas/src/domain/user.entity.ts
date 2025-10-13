export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly role: string = 'user', // default role
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}


  public isAdmin(): boolean {
    return this.role.toLowerCase() === 'admin';
  }

  // Update naam van gebruiker
  public updateName(name: string): User {
    return new User(
      this.id,
      name,
      this.email,
      this.role,
      this.createdAt,
      new Date()
    );
  }
}
