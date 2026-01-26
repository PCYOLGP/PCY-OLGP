import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomizeService, DirectoryMember } from '../../services/customize.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent implements OnInit {
  private customizeService = inject(CustomizeService);

  team = signal<DirectoryMember[]>([
    { name: 'Tristan Jhon Fruelda', role: 'Coordinator', age: 22, yearJoined: 2023, address: 'St. Martha', bio: 'Dedicated leader...', image: 'assets/tan.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/profile.php?id=100008628315250' },
    { name: 'Aeron jay Boringot', role: 'Vice Coordinator', age: 21, yearJoined: 2023, address: 'Marilao', bio: 'Tech enthusiast...', image: 'images/team2.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/Aeronjay.11.1827A' },
    { name: 'Nixarene Nicole P. Escobillo', role: 'Secretary', age: 20, yearJoined: 2024, address: 'Marilao', bio: 'Community driven...', image: 'assets/nica.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/Nixarene.Escobilo' },
    { name: 'Zianna Crisolo', role: 'Treasurer', age: 19, yearJoined: 2024, address: 'Marilao', bio: 'Faithful servant...', image: 'images/team1.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/profile.php?id=100074652100042' },
    { name: 'Pearly Colacion', role: 'Auditor', age: 21, yearJoined: 2023, address: 'Marilao', bio: 'Detail oriented...', image: 'assets/perly.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/profile.php?id=100088571894565' },
    { name: 'Wency Opiso', role: 'Officer', age: 22, yearJoined: 2022, address: 'Marilao', bio: 'Creative mind...', image: 'team/wency.jpg', email: 'sample@gmail.com', fb: '#' },
    { name: 'Kenneth Baselonia', role: 'Officer', age: 23, yearJoined: 2022, address: 'Marilao', bio: 'Spiritual guide...', image: 'assets/ken.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/kenneth.baselonia' },
    { name: 'Daisy Lazar', role: 'Officer', age: 22, yearJoined: 2022, address: 'Marilao', bio: 'Cheerful spirit...', image: 'assets/daisy.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/daisy.lazar' },
    { name: 'Ria Ligason', role: 'Officer', age: 21, yearJoined: 2023, address: 'Marilao', bio: 'Committed volunteer...', image: 'images/team1.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/mariavina.ligason' }
  ]);

  searchTerm = signal('');
  selectedYear = signal<number | 'all'>('all');
  selectedMember = signal<DirectoryMember | null>(null);

  availableYears = computed(() => {
    const years = this.team().map(m => m.yearJoined);
    return [...new Set(years)].sort((a, b) => b - a);
  });

  filteredMembers = computed(() => {
    return this.team().filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        member.role.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        member.address?.toLowerCase().includes(this.searchTerm().toLowerCase());

      const matchesYear = this.selectedYear() === 'all' || member.yearJoined === this.selectedYear();

      return matchesSearch && matchesYear;
    });
  });

  ngOnInit() {
    this.customizeService.getContent().subscribe(content => {
      if (content && content.directory && content.directory.length > 0) {
        this.team.set(content.directory);
      }
    });
  }

  showMemberDetails(member: DirectoryMember) {
    this.selectedMember.set(member);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.selectedMember.set(null);
    document.body.style.overflow = 'auto';
  }
}
