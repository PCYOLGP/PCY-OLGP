import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Activity {
  title: string;
  year: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

  activities = signal<Activity[]>([
    {
      title: 'PULSO 2024',
      year: '2024',
      description: 'The biggest youth gathering of the parish, focusing on spiritual revival and community building.',
      icon: '🔥'
    },
    {
      title: 'Panunuluyan Re-enactment',
      year: '2023',
      description: 'A traditional Christmas event bringing the story of Mary and Joseph to life through the streets of Marilao.',
      icon: '🕯️'
    },
    {
      title: 'Lenten Youth Pilgrimage',
      year: '2023',
      description: 'A journey of reflection and sacrifice across the different chapels of the parish.',
      icon: '⛪'
    },
    {
      title: 'PCY Sports Fest',
      year: '2022',
      description: 'Building sportsmanship and camaraderie among the youth through various athletic competitions.',
      icon: '🏀'
    }
  ]);
}
