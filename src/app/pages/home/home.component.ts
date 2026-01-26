import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CustomizeService, SiteContent } from '../../services/customize.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private authService = inject(AuthService);
  private customizeService = inject(CustomizeService);
  private platformId = inject(PLATFORM_ID);

  landingContent = signal({
    welcomeLabel: 'Welcome to our community',
    heroTitle: 'This is OLGP | PCY',
    heroSubtitle: 'The Parish Commission on Youth is a group of young people dedicated to faith, fellowship, and service. Whether you\'re looking to volunteer or grow in spirit, there\'s a place for you here.',
    heroButtonText: 'PCY OFFICERS',
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
    if (isPlatformBrowser(this.platformId)) {
      if (this.authService.isLoggedIn()) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.customizeService.getContent().subscribe((content: SiteContent | null) => {
        if (content) {
          if (content.landing) {
            const updatedLanding = { ...content.landing };

            // Dynamically update hero button text based on latest valid officer batch
            if (content.officerTerms && content.officerTerms.length > 0) {
              // Filter out TBC batches to match Officers page display logic
              const validBatches = content.officerTerms.filter(batch =>
                batch.officers && batch.officers.length > 0 &&
                !batch.officers.some(o =>
                  (o.name && o.name.toLowerCase().includes('to be confirmed')) ||
                  (o.position && o.position.toUpperCase() === 'TBC')
                )
              );

              const batchToUse = validBatches.length > 0 ? validBatches[0] : content.officerTerms[0];
              updatedLanding.heroButtonText = `PCY OFFICERS ${batchToUse.year}`;
            }

            this.landingContent.set(updatedLanding);
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
}

