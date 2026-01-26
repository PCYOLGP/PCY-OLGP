import { Component, signal, inject, OnInit, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CustomizeService, OfficerBatch, DirectoryMember } from '../../services/customize.service';

@Component({
  selector: 'app-officers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './officers.component.html',
  styleUrl: './officers.component.css'
})
export class OfficersComponent implements OnInit {
  private customizeService = inject(CustomizeService);
  private platformId = inject(PLATFORM_ID);

  officerBatches = signal<OfficerBatch[]>([]);
  directory = signal<DirectoryMember[]>([]);

  // Find the latest batch that is not TBC
  displayBatch = computed(() => {
    const batches = this.officerBatches();
    if (batches.length === 0) return null;

    // Filter out TBC batches for the preview
    const validBatches = batches.filter(batch =>
      !batch.officers.some(o => o.name.includes('To Be Confirmed') || o.position === 'TBC')
    );

    return validBatches.length > 0 ? validBatches[0] : batches[0];
  });

  // Get officers for the display batch with their directory info
  displayOfficers = computed(() => {
    const batch = this.displayBatch();
    if (!batch) return [];

    return batch.officers.map(officer => {
      const memberInfo = this.directory().find(m =>
        m.name.toLowerCase().includes(officer.name.toLowerCase()) ||
        officer.name.toLowerCase().includes(m.name.toLowerCase())
      );

      // Ensure we have a valid image path, fallback to default if missing or empty
      const imagePath = (memberInfo && memberInfo.image && memberInfo.image.trim() !== '')
        ? memberInfo.image
        : 'assets/PCY.png';

      return {
        ...officer,
        image: imagePath,
        email: memberInfo?.email || '',
        fb: memberInfo?.fb || '#'
      };
    });
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.customizeService.getContent().subscribe(content => {
        if (content) {
          if (content.officerTerms && content.officerTerms.length > 0) {
            this.officerBatches.set(content.officerTerms);
          }
          if (content.directory && content.directory.length > 0) {
            this.directory.set(content.directory);
          }
        }
      });
    }
  }
}
