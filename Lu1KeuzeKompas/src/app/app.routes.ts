import { Routes } from '@angular/router';
import { ModulesComponent } from './modules/module.component';
import { ModuleDetailComponent } from './modules/module-detail.component';
import { ModuleFormComponent } from './modules/module-form.component';
import { LoginComponent } from '../app/auth/login.component';
import { RegisterComponent } from '../app/auth/register.component';
import { authGuard } from '../app/services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'modules', 
    component: ModulesComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'modules/new', 
    component: ModuleFormComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'modules/:id', 
    component: ModuleDetailComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'modules/:id/edit', 
    component: ModuleFormComponent,
    canActivate: [authGuard] 
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];