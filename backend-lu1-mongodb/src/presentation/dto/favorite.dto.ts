export class CreateFavoriteDto {
  studentId: string;
  moduleId: number;
  moduleName: string;
  moduleLevel?: string;
  moduleCredits?: number;
  notes?: string;
}

export class UpdateFavoriteDto {
  notes?: string;
  moduleLevel?: string;
  moduleCredits?: number;
}

export class FavoriteResponseDto {
  _id: string;
  studentId: string;
  moduleId: number;
  moduleName: string;
  moduleLevel?: string;
  moduleCredits?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}