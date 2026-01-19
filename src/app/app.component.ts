import { Component, signal, inject, HostListener } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent, FooterComponent, CommonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    protected readonly title = signal('PCY-WEBDOC');
    private router = inject(Router);



    showNavbar(): boolean {
        const url = this.router.url;
        return !url.includes('/login') && !url.includes('/dashboard');
    }
}
