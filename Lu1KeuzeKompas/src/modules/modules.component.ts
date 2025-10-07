import { Component, OnInit } from '@angular/core';
import { CsvDataService } from './csv-data.service';
import { CommonModule } from '@angular/common'; // <-- nodig voor *ngFor, *ngIf etc.

@Component({
  selector: 'app-modules',
  standalone: true, // standalone component
  imports: [CommonModule], // <-- hier importeren
  templateUrl: './modules.component.html',
})
export class ModulesComponent implements OnInit {
  modules: any[] = [];

  constructor(private csvService: CsvDataService) {}

  ngOnInit(): void {
    this.csvService.getModules().subscribe((data: any[]) => {
      this.modules = data;
    });
  }
}
