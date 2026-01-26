import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  officerBatches = signal<OfficerBatch[]>([
    {
      year: '2026',
      youthAdviser: 'Rev. Fr. Ronaldo Samonte',
      officers: [
        { position: 'Coordinator', name: 'Nixarene Nicole P. Escobillo' },
        { position: 'Vice Coordinator (External)', name: 'Zianna Crisolo' },
        { position: 'Vice Coordinator (Internal)', name: 'Pristine Burio' },
        { position: 'Secretary', name: 'Chloe Paraan' },
        { position: 'Treasurer', name: 'Carl Misajon' },
        { position: 'Auditor', name: 'Tristan Fruelda' }
      ],
      committees: [
        { position: 'Social Communication', name: 'Wency Opiso' },
        { position: 'Sports and Recreational', name: 'Jeffrey Hibanes' },
        { position: 'Liturgy', name: 'Kenneth Baselonia' },
        { position: 'Property Custodial', name: 'Ria Ligason' }
      ]
    },
    {
      year: '2025',
      youthAdviser: 'Rev. Fr. Ronaldo Samonte',
      officers: [
        { position: 'Coordinator', name: 'Nixarene Nicole P. Escobillo' },
        { position: 'Vice Coordinator (External)', name: 'Zianna Crisolo' },
        { position: 'Vice Coordinator (Internal)', name: 'Pristine Burio' },
        { position: 'Secretary', name: 'Chloe Paraan' },
        { position: 'Treasurer', name: 'Carl Misajon' },
        { position: 'Auditor', name: 'Tristan Fruelda' }
      ],
      committees: [
        { position: 'Social Communication', name: 'Wency Opiso' },
        { position: 'Sports and Recreational', name: 'Jeffrey Hibanes' }
      ]
    },
    {
      year: '2023 - 2024',
      youthAdviser: 'Rev. Fr. Ronaldo Samonte',
      officers: [
        { position: 'Coordinator', name: 'Tristan Jhon Fruelda' },
        { position: 'Vice Coordinator', name: 'Aeron jay Boringot' },
        { position: 'Secretary', name: 'Nixarene Escobillo' },
        { position: 'Treasurer', name: 'Zianna Crisolo' },
        { position: 'Auditor', name: 'Pearly Colacion' }
      ],
      committees: [
        { position: 'Liturgy', name: 'Kenneth Baselonia' },
        { position: 'Social Communication', name: 'Wency Opiso' },
        { position: 'Property Custodial', name: 'Ria Ligason' },
        { position: 'Sports and Recreational', name: 'Jeffrey Hibanes' }
      ]
    },
    {
      year: '2022 - 2023',
      youthAdviser: 'Rev. Fr. Ronaldo Samonte',
      officers: [
        { position: 'President', name: 'Richmond Lyle Chang' },
        { position: 'Vice-president', name: 'Rome Azeleigh Salangad' },
        { position: 'Secretary', name: 'Denmark Paningbatan' },
        { position: 'Treasurer', name: 'Gleiza Nones' },
        { position: 'Auditor', name: 'Medarlyn Vergara' }
      ]
    },
    {
      year: '2021 - 2022',
      youthAdviser: 'Rev. Fr. Ronaldo Samonte',
      officers: [
        { position: 'President', name: 'Medarlyn Vergara' },
        { position: 'Vice-president', name: 'Rhode Uy' },
        { position: 'Secretary', name: 'Richmond Lyle Chang' },
        { position: 'Treasurer', name: 'Denmark Paningbatan' },
        { position: 'Auditor', name: 'Janelle Andrea Icay' }
      ]
    },
    {
      year: '2020',
      youthAdviser: 'Rev. Fr. Lazaro Benedictos',
      officers: [
        { position: 'President', name: 'Kenneth Baselonia' },
        { position: 'Vice-president', name: 'Daisy Lazar' },
        { position: 'Secretary', name: 'Jeffrey Hibanes' },
        { position: 'Treasurer', name: 'Emerson Jayme' },
        { position: 'Auditor', name: 'Wency Jezrel Opiso' }
      ]
    },
    {
      year: '2019',
      youthAdviser: 'Rev. Fr. Lazaro Benedictos',
      officers: [
        { position: 'TBC', name: 'To Be Confirmed' }
      ]
    },
    {
      year: '2018',
      youthAdviser: 'Rev. Fr. Lazaro Benedictos',
      officers: [
        { position: 'TBC', name: 'To Be Confirmed' }
      ]
    },
    {
      year: '2016',
      youthAdviser: 'Rev. Fr. Lazaro Benedictos',
      officers: [
        { position: 'TBC', name: 'To Be Confirmed' }
      ]
    }
  ]);

  ngOnInit() {
    this.customizeService.getContent().subscribe(content => {
      if (content && content.officerTerms && content.officerTerms.length > 0) {
        this.officerBatches.set(content.officerTerms);
      }
    });
  }
}
