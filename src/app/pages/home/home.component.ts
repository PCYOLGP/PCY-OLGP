import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CustomizeService } from '../../services/customize.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private customizeService = inject(CustomizeService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  landingContent = signal({
    welcomeLabel: 'Welcome to our community',
    heroTitle: 'This is OLGP | PCY',
    heroSubtitle: 'The Parish Commission on Youth is a group of young people dedicated to faith, fellowship, and service. Whether you\'re looking to volunteer or grow in spirit, there\'s a place for you here.',
    heroButtonText: 'PCY OFFICERS 2024',
    logoImage: 'assets/PCY.png',
    gsffLabel: 'Short Film Festival',
    gsffTitle: 'GSFF 2022',
    gsffDescription: 'GSFF is a short film festival of Our Lady of Guadalupe Parish in Marilao, Bulacan, bringing stories of faith and reflection to the screen.'
  });

  videos = [
    {
      title: 'KANDILA',
      description: '"Ama patawarin mo sila sapagkat hindi nila alam ang kaniyang ginagawa"',
      url: 'https://www.youtube.com/embed/pz7DJU7Os7U'
    },
    {
      title: 'NAKAW NA PARAISO',
      description: '"Sinasabi ko sa \'yo: Ngayon din ay isasama kita sa Pariso."',
      url: 'https://www.youtube.com/embed/vYoLj4PfGlE'
    },
    {
      title: 'BUBOY',
      description: '“Babae, narito, ang iyong anak!” “Narito, ang iyong ina!”',
      url: 'https://www.youtube.com/embed/HXq1xr8PMWI'
    },
    {
      title: 'ILAW',
      description: '“Diyos ko, Diyos ko! Bakit mo ako pinabayaan?”',
      url: 'https://www.youtube.com/embed/AV0o6VQXmZs'
    },
    {
      title: 'KAMAYAN',
      description: '“Alam ni hesus na naganap na ang lahat ng bagay. Kaya’t upang matupad ang kasulatan ay sinabi niya “Nauuhaw ako!"',
      url: 'https://www.youtube.com/embed/olTlczcdFWQ'
    },
    {
      title: 'ANGHEL SA DILIM',
      description: '"Naganap na""',
      url: 'https://www.youtube.com/embed/jl76Iw6mwJM'
    },
    {
      title: 'GULONG NA BUHAY',
      description: '"Ama, sa mga kamay mo, inihahabilin ko ang aking espiritu"',
      url: 'https://www.youtube.com/embed/5l1V56qClC0'
    }
  ];

  safeVideos: { title: string; description: string; url: SafeResourceUrl }[] = [];

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.customizeService.getContent().subscribe(content => {
      if (content) {
        if (content.landing) {
          this.landingContent.set(content.landing);
        }
        if (content.videos && content.videos.length > 0) {
          this.safeVideos = content.videos.map(v => ({
            ...v,
            url: this.sanitizer.bypassSecurityTrustResourceUrl(v.url)
          }));
        } else {
          this.safeVideos = this.videos.map(v => ({
            ...v,
            url: this.sanitizer.bypassSecurityTrustResourceUrl(v.url)
          }));
        }
      } else {
        this.safeVideos = this.videos.map(v => ({
          ...v,
          url: this.sanitizer.bypassSecurityTrustResourceUrl(v.url)
        }));
      }
    });
  }
}
