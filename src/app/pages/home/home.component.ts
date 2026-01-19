import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

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

  safeVideos: { title: string; description: string; url: SafeResourceUrl }[] = this.videos.map(v => ({
    ...v,
    url: this.sanitizer.bypassSecurityTrustResourceUrl(v.url)
  }));

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }
}
