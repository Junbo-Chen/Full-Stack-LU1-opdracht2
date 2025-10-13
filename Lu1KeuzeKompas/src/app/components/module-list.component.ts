import { Component, OnInit } from '@angular/core';
import { ModuleService } from '../services/module.service';
import { Module } from '../../domain/module.entity';

@Component({
  selector: 'app-module-list',
  templateUrl: './module-list.component.html',
  styleUrls: ['./module-list.component.css']
})
export class ModuleListComponent implements OnInit {
  modules: Module[] = [];

  constructor(private moduleService: ModuleService) {}

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.moduleService.getModules().subscribe(modules => {
      this.modules = modules;
    });
  }
}
