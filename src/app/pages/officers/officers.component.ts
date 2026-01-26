import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CustomizeService, OfficerBatch } from '../../services/customize.service';

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

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.customizeService.getContent().subscribe(content => {
        if (content && content.officerTerms && content.officerTerms.length > 0) {
          this.officerBatches.set(content.officerTerms);
        }
      });
    }
  }
}
