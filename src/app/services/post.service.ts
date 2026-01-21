import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Post {
    id: number;
    username: string;
    image: string;
    caption: string;
    timestamp: Date;
    comments?: Comment[];
    likes?: Like[];
    userImage?: string | null;
}

export interface Like {
    id: number;
    post_id: number;
    user_id: number;
    username?: string;
    timestamp: string;
}

export interface Comment {
    id: number;
    post_id: number;
    username: string;
    comment: string;
    timestamp: string;
    userImage?: string | null;
}

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PostService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/posts`;

    getPosts(): Observable<Post[]> {
        return (this.http as any).get(this.apiUrl).pipe(
            map((posts: any[]) => {
                if (!Array.isArray(posts)) return [];
                return posts.map((post: any) => ({
                    ...post,
                    image: post.image || 'assets/PCY.png',
                    username: post.username || 'Anonymous',
                    caption: post.caption || '',
                    timestamp: post.timestamp ? new Date(post.timestamp) : new Date(),
                    likes: post.likes || []
                }));
            }),
            catchError(err => {
                console.error('PostService.getPosts error:', err);
                return of([]);
            })
        );
    }

    createPost(postData: any): Observable<Post> {
        return (this.http as any).post(this.apiUrl, postData);
    }

    updatePost(id: number, data: { caption: string }): Observable<Post> {
        return (this.http as any).patch(`${this.apiUrl}/${id}`, data);
    }

    deletePost(id: number): Observable<any> {
        return (this.http as any).delete(`${this.apiUrl}/${id}`);
    }

    getComments(postId: number): Observable<Comment[]> {
        return (this.http as any).get(`${this.apiUrl}/${postId}/comments`);
    }

    addComment(postId: number, username: string, comment: string): Observable<Comment> {
        return (this.http as any).post(`${this.apiUrl}/${postId}/comments`, { username, comment });
    }

    toggleLike(postId: number, userId: number): Observable<{ success: boolean, liked: boolean }> {
        return (this.http as any).post(`${this.apiUrl}/${postId}/toggle-like`, { userId });
    }
}
