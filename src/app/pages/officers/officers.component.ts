import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface OfficerBatch {
  year: string;
  coordinator: string;
  members: string[];
}

@Component({
  selector: 'app-officers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './officers.component.html',
  styleUrl: './officers.component.css'
})
export class OfficersComponent {
  officerBatches = signal<OfficerBatch[]>([
    {
      year: '2025 - 2026',
      coordinator: 'Candidate TBD',
      members: ['Member 1', 'Member 2', 'Member 3']
    },
    {
      year: '2024 - 2025',
      coordinator: 'Kuya Tristan',
      members: ['Kuya Aeron', 'Ate Nixarene', 'Ate Zianna', 'Ate Pearly', 'Kuya Wency', 'Kuya Kendra', 'Ate Daisy', 'Ate Ria']
    },
    {
      year: '2023 - 2024',
      coordinator: 'Juan Dela Cruz',
      members: ['Maria Santos', 'Pedro Reyes', 'Ana Ramos', 'Jose Rizal']
    },
    {
      year: '2022 - 2023',
      coordinator: 'Elena Garcia',
      members: ['Marco Polo', 'Sisa Maria', 'Crisostomo Ibarra', 'Basilio S.']
    },
    {
      year: '2020 - 2022',
      coordinator: 'Ricardo Lim',
      members: ['Teresa Magbanua', 'Gregorio Del Pilar', 'Melchora Aquino']
    },
    {
      year: '2019 - 2020',
      coordinator: 'Sofia Aragon',
      members: ['Miguel Lopez', 'Isabel Daza', 'Francis Magalona']
    },
    {
      year: '2018 - 2019',
      coordinator: 'Gabriel Silang',
      members: ['Diego Silang', 'Gabriela Silang', 'Andres Bonifacio']
    },
    {
      year: '2016 - 2018',
      coordinator: 'Emilio Aguinaldo',
      members: ['Apolinario Mabini', 'Antonio Luna', 'Marcelo H. Del Pilar']
    }
  ]);
}
