import { Routes } from '@angular/router';
import { ModulesComponent } from '../modules/modules.component';

// export const routes: Routes = [];
export const routes: Routes = [
  { path: 'modules', component: ModulesComponent }, // <-- hier je component
  { path: '', redirectTo: '/modules', pathMatch: 'full' }, // optioneel: default route
];