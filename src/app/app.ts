import { Component, signal, inject, HostListener } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('PCY-WEBDOC');
  private router = inject(Router);

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Check for Ctrl + Shift + F
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      this.router.navigate(['/login']);
    }
  }

  showNavbar(): boolean {
    const url = this.router.url;
    return !url.includes('/login') && !url.includes('/dashboard');
  }
}
