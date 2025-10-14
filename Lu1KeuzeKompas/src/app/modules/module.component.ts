import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuleService, ModuleFilters } from '../services/module.service';
import { FavoriteService } from '../services/favorite.service';
import { Module } from '../../domain/module.entity';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.css']
})
export class ModulesComponent implements OnInit {
  // State signals
  allModules = signal<Module[]>([]);
  filteredModules = signal<Module[]>([]);
  isLoading = signal(true);

  // Filter values
  searchTerm = signal('');
  selectedCredit = signal<number | undefined>(undefined);
  selectedLevel = signal<string>('');
  selectedLocation = signal<string>('');

  // Available filter options
  availableCredits = [15, 30];
  availableLevels = ['NLQF-5', 'NLQF-6'];
  availableLocations = signal<string[]>([]);

  // Computed: aantal actieve filters
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchTerm()) count++;
    if (this.selectedCredit()) count++;
    if (this.selectedLevel()) count++;
    if (this.selectedLocation()) count++;
    return count;
  });

  // Computed: favorite count
  favoriteCount = computed(() => this.favoriteService.getFavoriteCount());

  constructor(
    private moduleService: ModuleService,
    public favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.isLoading.set(true);
    this.moduleService.getModules().subscribe({
      next: (modules) => {
        this.allModules.set(modules);
        this.filteredModules.set(modules);
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
    this.availableLocations.set(locations);
  }

  applyFilters(): void {
    const filters: ModuleFilters = {
      searchTerm: this.searchTerm(),
      studycredit: this.selectedCredit(),
      level: this.selectedLevel(),
      location: this.selectedLocation()
    };

    this.isLoading.set(true);
    this.moduleService.getModulesWithFilters(filters).subscribe({
      next: (modules) => {
        this.filteredModules.set(modules);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error filtering modules:', err);
        this.isLoading.set(false);
      }
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCredit.set(undefined);
    this.selectedLevel.set('');
    this.selectedLocation.set('');
    this.filteredModules.set(this.allModules());
  }

  toggleFavorite(event: Event, moduleId: string): void {
    event.stopPropagation();
    
    this.favoriteService.toggleFavorite(moduleId).subscribe({
      next: () => {
        console.log('Favorite toggled successfully');
      },
      error: (err) => {
        console.error('Error toggling favorite:', err);
        alert('Er ging iets mis. Probeer het opnieuw.');
      }
    });
  }

  isFavorite(moduleId: string): boolean {
    return this.favoriteService.isFavorite(moduleId);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
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
}