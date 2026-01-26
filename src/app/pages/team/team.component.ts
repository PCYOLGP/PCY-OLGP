import { Component, inject, signal, OnInit, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomizeService, DirectoryMember } from '../../services/customize.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent implements OnInit {
  private customizeService = inject(CustomizeService);
  private platformId = inject(PLATFORM_ID);

  team = signal<DirectoryMember[]>([]);

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
    if (isPlatformBrowser(this.platformId)) {
      this.customizeService.getContent().subscribe(content => {
        if (content && content.directory && content.directory.length > 0) {
          this.team.set(content.directory);
        }
      });
    }
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
