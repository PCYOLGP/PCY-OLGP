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
    { name: 'Tristan Jhon Fruelda', role: 'Auditor', age: 23, yearJoined: 2023, address: 'St. Martha', bio: 'Youth Leader and community servant.', image: 'assets/tan.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/profile.php?id=100008628315250' },
    { name: 'Aeron jay Boringot', role: 'Member', age: 22, yearJoined: 2023, address: 'Marilao', bio: 'Tech enthusiast and active PCY member.', image: 'assets/tan.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/Aeronjay.11.1827A' },
    { name: 'Nixarene Nicole P. Escobillo', role: 'Coordinator', age: 21, yearJoined: 2024, address: 'Marilao', bio: 'Leading the youth with passion and dedication.', image: 'assets/nica.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/Nixarene.Escobilo' },
    { name: 'Zianna Crisolo', role: 'Vice Coordinator (External)', age: 20, yearJoined: 2024, address: 'Marilao', bio: 'Passionate about external relations and service.', image: 'assets/nica.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/profile.php?id=100074652100042' }
  ]);

  searchTerm = signal('');
  selectedYear = signal<number | 'all'>('all');
  selectedMember = signal<DirectoryMember | null>(null);
  isYearDropdownOpen = signal(false);

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

  toggleYearDropdown() {
    this.isYearDropdownOpen.update(v => !v);
  }

  selectYear(year: number | 'all') {
    this.selectedYear.set(year);
    this.isYearDropdownOpen.set(false);
  }
}
