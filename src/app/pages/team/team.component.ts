import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent {
  team = [
    { name: 'Kuya Tristan', role: 'President', image: 'assets/tan.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/profile.php?id=100008628315250' },
    { name: 'Kuya Aeron', role: 'Vice President', image: 'images/team2.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/Aeronjay.11.1827A' },
    { name: 'Ate Nixarene', role: 'Secretary', image: 'assets/nica.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/Nixarene.Escobilo' },
    { name: 'Ate Zianna', role: 'Treasurer', image: 'images/team1.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/profile.php?id=100074652100042' },
    { name: 'Ate Pearly', role: 'Auditor', image: 'assets/perly.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/profile.php?id=100088571894565' },
    { name: 'Kuya Wency', role: 'Officer', image: 'team/wency.jpg', email: 'sample@gmail.com', fb: '#' },
    { name: 'Kuya Kendra', role: 'Officer', image: 'assets/ken.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/kenneth.baselonia' },
    { name: 'Ate Daisy', role: 'Officer', image: 'assets/daisy.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/daisy.lazar' },
    { name: 'Ate Ria', role: 'Officer', image: 'images/team1.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/mariavina.ligason' }
  ];
}
