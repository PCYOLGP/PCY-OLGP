import { Injectable, signal, PLATFORM_ID, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map, throwError } from 'rxjs';

export interface User {
    id: number;
    username: string;
    email?: string;
    image?: string;
    fname?: string;
    lname?: string;
    bio?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private platformId = inject(PLATFORM_ID);
    private router = inject(Router);
    private http = inject(HttpClient);

    private _isLoggedIn = signal<boolean>(this.getInitialLoginState());
    isLoggedIn = this._isLoggedIn.asReadonly();

    // Signal for current user info
    private _currentUser = signal<User | null>(this.getInitialUser());
    currentUser = this._currentUser.asReadonly();

    private getInitialLoginState(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('isLoggedIn') === 'true';
        }
        return false;
    }

    private getInitialUser(): User | null {
        if (isPlatformBrowser(this.platformId)) {
            const user = localStorage.getItem('user');
            if (user) return JSON.parse(user);

            // Fallback for existing sessions before the update
            if (localStorage.getItem('isLoggedIn') === 'true') {
                const defaultUser: User = { id: 0, username: 'OLGP_PCY' };
                localStorage.setItem('user', JSON.stringify(defaultUser));
                return defaultUser;
            }
        }
        return null;
    }

    login(username: string, password: string): Observable<boolean> {
        return (this.http as any).post('/api/login', { username, password }).pipe(
            map((user: User) => {
                if (isPlatformBrowser(this.platformId)) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('user', JSON.stringify(user));
                }
                this._currentUser.set(user);
                this._isLoggedIn.set(true);
                return true;
            }),
            catchError(() => of(false))
        );
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
        }
        this._isLoggedIn.set(false);
        this._currentUser.set(null);
        this.router.navigate(['/login']);
    }

    updateProfile(id: number, data: any): Observable<User> {
        return (this.http as any).patch(`/api/users/${id}`, data).pipe(
            tap((updatedUser: User) => {
                const currentUser = this._currentUser();
                if (currentUser && currentUser.id === updatedUser.id) {
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    this._currentUser.set(updatedUser);
                }
            }),
            catchError((err: any) => {
                console.error('Update profile error:', err);
                return throwError(() => err);
            })
        );
    }

    uploadProfileImage(id: number, username: string, file: File): Observable<User> {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('image', file);

        return (this.http as any).post(`/api/users/${id}/profile-image`, formData).pipe(
            tap((updatedUser: User) => {
                localStorage.setItem('user', JSON.stringify(updatedUser));
                this._currentUser.set(updatedUser);
            }),
            catchError((err: any) => {
                console.error('Profile image upload error:', err);
                return throwError(() => err);
            })
        );
    }

    getUserByUsername(username: string): Observable<User | null> {
        return (this.http as any).get(`/api/users?username=${username}`).pipe(
            map((users: User[]) => users.length > 0 ? users[0] : null),
            catchError(() => of(null))
        );
    }
}
