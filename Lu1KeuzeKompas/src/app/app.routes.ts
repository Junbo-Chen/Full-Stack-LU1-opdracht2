import { Routes } from '@angular/router';
import { ModulesComponent } from './modules/module.component';

export const routes: Routes = [
  { path: 'modules', component: ModulesComponent },
  { path: '', redirectTo: '/modules', pathMatch: 'full' },
];