import { Routes } from '@angular/router';
import { ModulesComponent } from './modules/module.component';
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
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];