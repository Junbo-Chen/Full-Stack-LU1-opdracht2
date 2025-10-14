import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./auth.component.css']
})
export class RegisterComponent {
  name = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validatie
    if (!this.name() || !this.email() || !this.password() || !this.confirmPassword()) {
      this.errorMessage.set('Vul alle velden in');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Wachtwoorden komen niet overeen');
      return;
    }

    if (this.password().length < 6) {
      this.errorMessage.set('Wachtwoord moet minimaal 6 karakters bevatten');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register({
      name: this.name(),
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.router.navigate(['/modules']);
      },
      error: (err) => {
        console.error('Register error:', err);
        this.errorMessage.set(err.error?.message || 'Registratie mislukt');
        this.isLoading.set(false);
      }
    });
  }
}