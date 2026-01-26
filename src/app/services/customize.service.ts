import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface LandingContent {
    welcomeLabel: string;
    heroTitle: string;
    heroSubtitle: string;
    logoImage: string;
    gsffLabel: string;
    gsffTitle: string;
    gsffDescription: string;
    heroButtonText: string;
}

export interface VideoContent {
    title: string;
    description: string;
    url: string;
}

export interface Officer {
    position: string;
    name: string;
}

export interface OfficerBatch {
    year: string;
    youthAdviser: string;
    officers: Officer[];
    committees?: Officer[];
}

export interface DirectoryMember {
    name: string;
    role: string;
    previousPosition?: string;
    age?: number;
    yearJoined: number;
    address?: string;
    bio?: string;
    image: string;
    email: string;
    fb: string;
}

export interface SiteContent {
    landing: LandingContent;
    videos: VideoContent[];
    officerTerms: OfficerBatch[];
    directory: DirectoryMember[];
}

export interface SaveContentResponse {
    success: boolean;
    message: string;
}

const DEFAULT_CONTENT: SiteContent = {
    landing: {
        welcomeLabel: 'Welcome to our community',
        heroTitle: 'This is OLGP | PCY',
        heroSubtitle: 'The Parish Commission on Youth is a group of young people dedicated to faith, fellowship, and service. Whether you\'re looking to volunteer or grow in spirit, there\'s a place for you here.',
        heroButtonText: 'PCY OFFICERS',
        logoImage: '/assets/PCY.png',
        gsffLabel: 'Short Film Festival',
        gsffTitle: 'GSFF 2022',
        gsffDescription: 'GSFF is a short film festival of Our Lady of Guadalupe Parish in Marilao, Bulacan, bringing stories of faith and reflection to the screen.'
    },
    videos: [
        { title: 'KANDILA', description: '"Ama patawarin mo sila sapagkat hindi nila alam ang kaniyang ginagawa"', url: 'https://www.youtube.com/embed/pz7DJU7Os7U' },
        { title: 'NAKAW NA PARAISO', description: '"Sinasabi ko sa \'yo: Ngayon din ay isasama kita sa Pariso."', url: 'https://www.youtube.com/embed/vYoLj4PfGlE' },
        { title: 'BUBOY', description: '"Babae, narito, ang iyong anak!" "Narito, ang iyong ina!"', url: 'https://www.youtube.com/embed/HXq1xr8PMWI' },
        { title: 'ILAW', description: '"Diyos ko, Diyos ko! Bakit mo ako pinabayaan?"', url: 'https://www.youtube.com/embed/AV0o6VQXmZs' },
        { title: 'KAMAYAN', description: '"Nauuhaw ako!"', url: 'https://www.youtube.com/embed/olTlczcdFWQ' },
        { title: 'ANGHEL SA DILIM', description: '"Naganap na"', url: 'https://www.youtube.com/embed/jl76Iw6mwJM' },
        { title: 'GULONG NA BUHAY', description: '"Ama, sa mga kamay mo, inihahabilin ko ang aking espiritu"', url: 'https://www.youtube.com/embed/5l1V56qClC0' }
    ],
    officerTerms: [
        {
            year: '2026',
            youthAdviser: 'Rev. Fr. Ronaldo Samonte',
            officers: [{ position: 'TBC', name: 'To Be Confirmed' }],
            committees: []
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
            year: '2023-2024',
            youthAdviser: 'Rev. Fr. Ronaldo Samonte',
            officers: [
                { position: 'Coordinator', name: 'Tristan Fruelda' },
                { position: 'Vice Coor', name: 'Aeron jay Boringot' },
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
            year: '2022-2023',
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
            year: '2021-2022',
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
            officers: [{ position: 'TBC', name: 'To Be Confirmed' }]
        },
        {
            year: '2018',
            youthAdviser: 'Rev. Fr. Lazaro Benedictos',
            officers: [{ position: 'TBC', name: 'To Be Confirmed' }]
        },
        {
            year: '2016',
            youthAdviser: 'Rev. Fr. Lazaro Benedictos',
            officers: [{ position: 'TBC', name: 'To Be Confirmed' }]
        }
    ],
    directory: [
        {
            name: 'Tristan Fruelda',
            role: 'Auditor',
            previousPosition: '2023-2024 Coordinator',
            age: 23,
            yearJoined: 2023,
            address: 'St. Martha',
            bio: 'Youth Leader and community servant.',
            image: 'assets/tan.jpg',
            email: 'sample@gmail.com',
            fb: 'https://www.facebook.com/profile.php?id=100008628315250'
        }
    ]
};

@Injectable({
    providedIn: 'root'
})
export class CustomizeService {
    private http = inject(HttpClient);
    private apiUrl = '/.netlify/functions';

    getContent(): Observable<SiteContent | null> {
        return (this.http as any).get(`${this.apiUrl}/site-content`).pipe(
            map((data: any) => {
                if (!data) return DEFAULT_CONTENT;
                // Deep merge and provide fallbacks
                return {
                    landing: { ...DEFAULT_CONTENT.landing, ...(data.landing || {}) },
                    videos: (data.videos && data.videos.length > 0) ? data.videos : DEFAULT_CONTENT.videos,
                    officerTerms: (data.officerTerms && data.officerTerms.length > 0) ? data.officerTerms : DEFAULT_CONTENT.officerTerms,
                    directory: data.directory || DEFAULT_CONTENT.directory
                };
            }),
            catchError((_error: unknown) => of(DEFAULT_CONTENT))
        );
    }

    saveContent(content: SiteContent): Observable<SaveContentResponse> {
        return (this.http as any).post(`${this.apiUrl}/site-content`, content);
    }
}

