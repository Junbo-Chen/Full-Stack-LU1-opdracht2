import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ModuleService } from '../services/module.service';
import { FavoriteService } from '../services/favorite.service';
import { AuthService } from '../services/auth.service';
import { Module } from '../../domain/module.entity';

@Component({
  selector: 'app-module-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './html/module-detail.component.html',
  styleUrls: ['./css/module-detail.component.css']
})
export class ModuleDetailComponent implements OnInit {
  module = signal<Module | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private moduleService: ModuleService,
    public favoriteService: FavoriteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadModule(id);
    }
  }

  loadModule(id: string): void {
    this.isLoading.set(true);
    this.moduleService.getModuleById(id).subscribe({
      next: (module) => {
        if (module) {
          this.module.set(module);
        } else {
          this.errorMessage.set('Module niet gevonden');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading module:', err);
        this.errorMessage.set('Fout bij laden van module');
        this.isLoading.set(false);
      }
    });
  }

  toggleFavorite(): void {
    const module = this.module();
    if (!module) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Je moet ingelogd zijn om favorieten toe te voegen');
      return;
    }

    this.favoriteService.toggleFavorite(module.id).subscribe({
      next: () => {
        console.log('Favorite toggled successfully');
      },
      error: (err) => {
        console.error('Error toggling favorite:', err);
        alert('Er ging iets mis. Probeer het opnieuw.');
      }
    });
  }

  isFavorite(): boolean {
    const module = this.module();
    return module ? this.favoriteService.isFavorite(module.id) : false;
  }

  deleteModule(): void {
    const module = this.module();
    if (!module) return;

    if (confirm(`Weet je zeker dat je "${module.name}" wilt verwijderen?`)) {
      this.moduleService.deleteModule(module.id).subscribe({
        next: () => {
          alert('Module succesvol verwijderd');
          this.router.navigate(['/modules']);
        },
        error: (err) => {
          console.error('Error deleting module:', err);
          alert('Fout bij verwijderen van module');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/modules']);
  }

  getLevelBadgeClass(level: string): string {
    return level.includes('6') ? 'level-advanced' : 'level-beginner';
  }
}