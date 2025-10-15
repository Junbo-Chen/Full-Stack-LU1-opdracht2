import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ModuleService, ModuleFilters } from '../services/module.service';
import { FavoriteService } from '../services/favorite.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Module } from '../../domain/module.entity';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './html/module.component.html',
  styleUrls: ['./css/module.component.css']
})
export class ModulesComponent implements OnInit {
  // State signals
  allModules = signal<Module[]>([]);
  isLoading = signal(true);

  // Filter values
  searchTerm = signal('');
  selectedCredits = signal<Set<number>>(new Set());
  selectedLevels = signal<Set<string>>(new Set());
  selectedLocations = signal<Set<string>>(new Set());
  showOnlyFavorites = signal(false);

  // Available filter options
  availableCredits = [15, 30];
  availableLevels = ['NLQF5', 'NLQF6'];
  availableLocationsList = signal<string[]>([]);

  // ✅ COMPUTED - Niet signal!
  filteredModules = computed(() => {
    let filtered = [...this.allModules()];

    // Search term filter
    if (this.searchTerm().trim()) {
      const searchLower = this.searchTerm().toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        m.shortDescription.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower)
      );
    }

    // Credits filter
    if (this.selectedCredits().size > 0) {
      filtered = filtered.filter(m => this.selectedCredits().has(m.studyCredit));
    }

    // Level filter
    if (this.selectedLevels().size > 0) {
      filtered = filtered.filter(m => this.selectedLevels().has(m.level));
    }

    // Location filter
    if (this.selectedLocations().size > 0) {
      filtered = filtered.filter(m => this.selectedLocations().has(m.location));
    }

    // Favorites filter
    if (this.showOnlyFavorites()) {
      filtered = filtered.filter(m => this.favoriteService.isFavorite(m.id));
    }

    return filtered;
  });

  // Computed values
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchTerm()) count++;
    if (this.selectedCredits().size > 0) count++;
    if (this.selectedLevels().size > 0) count++;
    if (this.selectedLocations().size > 0) count++;
    if (this.showOnlyFavorites()) count++; // ✅ NIEUW
    return count;
  });

  favoriteCount = computed(() => this.favoriteService.getFavoriteCount());

  constructor(
    private moduleService: ModuleService,
    public favoriteService: FavoriteService,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      if (isAuthenticated) {
        console.log('✅ User authenticated, loading favorites');
        this.favoriteService.loadFavorites();
      }
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      console.warn('⚠️ User not logged in, redirecting...');
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    console.log('👤 Current user:', currentUser);

    this.loadModules();
    this.favoriteService.loadFavorites();
  }

  loadModules(): void {
    this.isLoading.set(true);
    this.moduleService.getModules().subscribe({
      next: (modules) => {
        console.log('📚 Loaded modules:', modules.length);
        this.allModules.set(modules);
        this.extractLocations(modules);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading modules:', err);
        this.isLoading.set(false);
      }
    });
  }

  extractLocations(modules: Module[]): void {
    const locations = [...new Set(modules.map(m => m.location))].sort();
    this.availableLocationsList.set(locations);
  }

  // Checkbox handlers
  toggleCreditFilter(credit: number): void {
    const current = new Set(this.selectedCredits());
    if (current.has(credit)) {
      current.delete(credit);
    } else {
      current.add(credit);
    }
    this.selectedCredits.set(current);
  }

  isCreditSelected(credit: number): boolean {
    return this.selectedCredits().has(credit);
  }

  toggleLevelFilter(level: string): void {
    const current = new Set(this.selectedLevels());
    if (current.has(level)) {
      current.delete(level);
    } else {
      current.add(level);
    }
    this.selectedLevels.set(current);
  }

  isLevelSelected(level: string): boolean {
    return this.selectedLevels().has(level);
  }

  toggleLocationFilter(location: string): void {
    const current = new Set(this.selectedLocations());
    if (current.has(location)) {
      current.delete(location);
    } else {
      current.add(location);
    }
    this.selectedLocations.set(current);
  }

  isLocationSelected(location: string): boolean {
    return this.selectedLocations().has(location);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCredits.set(new Set());
    this.selectedLevels.set(new Set());
    this.selectedLocations.set(new Set());
    this.showOnlyFavorites.set(false);
  }

  toggleFavorite(event: Event, moduleId: string): void {
    event.stopPropagation();
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('❌ No user logged in');
      alert('Je moet ingelogd zijn om favorieten toe te voegen');
      return;
    }

    console.log('🔄 Toggling favorite:', { userId: currentUser.id, moduleId });
    
    this.favoriteService.toggleFavorite(moduleId).subscribe({
      next: () => {
        console.log('✅ Favorite toggled successfully');
      },
      error: (err) => {
        console.error('❌ Error toggling favorite:', err);
        alert('Er ging iets mis. Probeer het opnieuw.');
      }
    });
  }

  isFavorite(moduleId: string): boolean {
    return this.favoriteService.isFavorite(moduleId);
  }

  navigateToDetail(moduleId: string): void {
    this.router.navigate(['/modules', moduleId]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/modules/new']);
  }

  onSearchChange(): void {
    // Filters worden automatisch toegepast via computed
  }

  getResultText(): string {
    const total = this.allModules().length;
    const filtered = this.filteredModules().length;
    
    if (filtered === total) {
      return `${total} module${total !== 1 ? 's' : ''} beschikbaar`;
    }
    return `${filtered} van ${total} module${total !== 1 ? 's' : ''} gevonden`;
  }

  getLevelBadgeClass(level: string): string {
    return level.includes('6') ? 'level-advanced' : 'level-beginner';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // ✅ NIEUW: Toggle favorites filter
  toggleFavoritesFilter(): void {
    this.showOnlyFavorites.set(!this.showOnlyFavorites());
  }

  logout(): void {
    this.favoriteService.clearFavorites();
    this.authService.logout();
  }
}