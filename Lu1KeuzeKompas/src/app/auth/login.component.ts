import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./auth.component.css']
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Vul alle velden in');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.router.navigate(['/modules']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage.set(err.error?.message || 'Ongeldige inloggegevens');
        this.isLoading.set(false);
      }
    });
  }
}