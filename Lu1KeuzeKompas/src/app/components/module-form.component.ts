import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ModuleService } from '../services/module.service';
import { Module } from '../../domain/module.entity';

@Component({
  selector: 'app-module-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './html/module-form.component.html',
  styleUrls: ['./css/module-form.component.css']
})
export class ModuleFormComponent implements OnInit {
  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');
  moduleId = signal<string | null>(null);

  // Form fields
  formId = signal<number | null>(null);
  name = signal('');
  shortDescription = signal('');
  description = signal('');
  content = signal('');
  studyCredit = signal(15);
  location = signal('');
  contactId = signal<number | null>(null);
  level = signal('NLQF-5');
  learningOutcomes = signal('');

  // Options
  creditOptions = [15, 30];
  levelOptions = ['NLQF5', 'NLQF6'];
  locationOptions = ['Breda', 'Den Bosch', 'Tilburg'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private moduleService: ModuleService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditMode.set(true);
      this.moduleId.set(id);
      this.loadModule(id);
    }
  }

  loadModule(id: string): void {
    this.isLoading.set(true);
    this.moduleService.getModuleById(id).subscribe({
      next: (module) => {
        if (module) {
          this.populateForm(module);
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

  populateForm(module: Module): void {
    this.formId.set(Number(module.id));
    this.name.set(module.name);
    this.shortDescription.set(module.shortDescription);
    this.description.set(module.description);
    this.content.set(module.content);
    this.studyCredit.set(module.studyCredit);
    this.location.set(module.location);
    this.contactId.set(module.contactId ? Number(module.contactId) : null);
    this.level.set(module.level);
    this.learningOutcomes.set(module.learningOutcomes);
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    if (this.isEditMode()) {
      this.updateModule();
    } else {
      this.createModule();
    }
  }

  validateForm(): boolean {
    if (!this.name().trim()) {
      this.errorMessage.set('Naam is verplicht');
      return false;
    }

    if (!this.isEditMode() && !this.formId()) {
      this.errorMessage.set('Module ID is verplicht');
      return false;
    }

    if (!this.studyCredit() || this.studyCredit() <= 0) {
      this.errorMessage.set('Studiepunten moeten groter dan 0 zijn');
      return false;
    }

    if (!this.location().trim()) {
      this.errorMessage.set('Locatie is verplicht');
      return false;
    }

    if (!this.level().trim()) {
      this.errorMessage.set('Niveau is verplicht');
      return false;
    }

    return true;
  }

  createModule(): void {
    const data = {
      id: this.formId()!,
      name: this.name(),
      shortdescription: this.shortDescription(),
      description: this.description(),
      content: this.content(),
      studycredit: this.studyCredit(),
      location: this.location(),
      contact_id: this.contactId() || undefined,
      level: this.level(),
      learningoutcomes: this.learningOutcomes()
    };

    this.moduleService.createModule(data).subscribe({
      next: (module) => {
        console.log('Module created:', module);
        alert('Module succesvol aangemaakt!');
        this.router.navigate(['/modules', module.id]);
      },
      error: (err) => {
        console.error('Error creating module:', err);
        this.errorMessage.set(err.error?.message || 'Fout bij aanmaken van module');
        this.isSaving.set(false);
      }
    });
  }

  updateModule(): void {
    const data = {
      name: this.name(),
      shortdescription: this.shortDescription(),
      description: this.description(),
      content: this.content(),
      studycredit: this.studyCredit(),
      location: this.location(),
      contact_id: this.contactId() || undefined,
      level: this.level(),
      learningoutcomes: this.learningOutcomes()
    };

    this.moduleService.updateModule(this.moduleId()!, data).subscribe({
      next: (module) => {
        console.log('Module updated:', module);
        alert('Module succesvol bijgewerkt!');
        this.router.navigate(['/modules', module.id]);
      },
      error: (err) => {
        console.error('Error updating module:', err);
        this.errorMessage.set(err.error?.message || 'Fout bij bijwerken van module');
        this.isSaving.set(false);
      }
    });
  }

  cancel(): void {
    if (this.isEditMode()) {
      this.router.navigate(['/modules', this.moduleId()]);
    } else {
      this.router.navigate(['/modules']);
    }
  }
}