import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  showPassword = signal(false);
  error = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  errorMessage = signal('');

  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.showError('Incorrect username or password.');
        }
      },
      error: (err) => {
        const msg = err.error?.message || err.error?.error || 'Server connection failed';
        this.showError(msg);
      }
    });
  }

  private showError(msg: string) {
    this.errorMessage.set(msg);
    this.error.set(true);
    setTimeout(() => {
      this.error.set(false);
      this.errorMessage.set('');
    }, 4000);
  }
}
