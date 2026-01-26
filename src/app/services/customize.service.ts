import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface LandingContent {
    welcomeLabel: string;
    heroTitle: string;
    heroSubtitle: string;
    logoImage: string;
    gsffLabel: string;
    gsffTitle: string;
    gsffDescription: string;
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

@Injectable({
    providedIn: 'root'
})
export class CustomizeService {
    private http = inject(HttpClient);
    private apiUrl = '/.netlify/functions';

    getContent(): Observable<SiteContent | null> {
        return (this.http as any).get(`${this.apiUrl}/site-content`).pipe(
            catchError((_error: unknown) => of(null))
        );
    }

    saveContent(content: SiteContent): Observable<SaveContentResponse> {
        return (this.http as any).post(`${this.apiUrl}/site-content`, content);
    }
}

