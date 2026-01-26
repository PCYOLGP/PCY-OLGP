import { Component, OnInit, OnDestroy, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PostService, Post, Like } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-pcywall',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pcywall.component.html',
  styleUrl: './pcywall.component.css'
})
export class PcyWallComponent implements OnInit, OnDestroy {
  private postService = inject(PostService);
  public authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  posts = signal<Post[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  view = signal<'feed' | 'profile'>('feed');
  selectedProfileUsername = signal<string | null>(null);
  viewedUserProfile = signal<any | null>(null);
  selectedPostForView = signal<Post | null>(null);
  showPostModal = signal(false);
  postComments = signal<any[]>([]);
  newComment = signal('');
  showLikesModal = signal(false);
  likesToShow = signal<Like[]>([]);

  userPosts = computed(() => {
    const username = this.selectedProfileUsername();
    return this.posts().filter(p => p.username === username);
  });

  totalUserLikes = computed(() => {
    return this.userPosts().reduce((acc, post) => acc + (post.likes?.length || 0), 0);
  });
  private pollSubscription?: Subscription;

  constructor() { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPosts();
      // Real-time polling every 5 seconds - Only in browser
      this.pollSubscription = interval(5000).subscribe(() => {
        this.refreshData();
      });
    }
  }

  ngOnDestroy() {
    this.pollSubscription?.unsubscribe();
  }

  refreshData() {
    this.postService.getPosts().subscribe({
      next: (data: Post[]) => {
        const sorted = data.sort((a, b) => b.id - a.id);
        this.posts.set(sorted);

        // Update modal post if open
        const currentModalPost = this.selectedPostForView();
        if (currentModalPost) {
          const updated = sorted.find(p => p.id === currentModalPost.id);
          if (updated) {
            this.selectedPostForView.set(updated);

            // If likes modal is open for this post, refresh the list
            if (this.showLikesModal()) {
              this.likesToShow.set(updated.likes || []);
            }
          }
          if (this.showPostModal()) {
            this.loadComments(currentModalPost.id);
          }
        }
      }
    });
  }

  loadPosts() {
    this.loading.set(true);
    this.error.set(null);
    this.postService.getPosts().subscribe({
      next: (data: Post[]) => {
        console.log(`PcyWall loaded ${data.length} posts`);
        this.posts.set(data.sort((a, b) => b.id - a.id));
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('PCY Wall Load Error:', err);
        this.error.set('We couldn\'t load the posts. Please check your connection.');
        this.loading.set(false);
      }
    });
  }

  handleImageError(event: any) {
    console.warn(`Failed to load image: ${event.target.src}`);
    event.target.src = 'assets/PCY.png';
  }

  openPostModal(post: Post) {
    this.selectedPostForView.set(post);
    this.showPostModal.set(true);
    this.loadComments(post.id);
  }

  closePostModal() {
    this.showPostModal.set(false);
    this.selectedPostForView.set(null);
    this.postComments.set([]);
  }

  viewProfile(username: string) {
    this.selectedProfileUsername.set(username);
    this.view.set('profile');
    this.closePostModal();
    this.closeLikesModal();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch user details for bio etc
    this.authService.getUserByUsername(username).subscribe(user => {
      this.viewedUserProfile.set(user);
    });
  }

  backToFeed() {
    this.view.set('feed');
    this.selectedProfileUsername.set(null);
    this.viewedUserProfile.set(null);
  }

  loadComments(postId: number) {
    this.postService.getComments(postId).subscribe(comments => {
      this.postComments.set(comments);
    });
  }

  isPostLiked(post: Post | null): boolean {
    if (!post || !post.likes) return false;
    const currentUserId = this.authService.currentUser()?.id;
    if (currentUserId === undefined) return false;
    return post.likes.some(like => like.user_id === currentUserId);
  }

  toggleLike(post: Post | null) {
    if (!post) return;
    const currentUserId = this.authService.currentUser()?.id;
    if (currentUserId === undefined) {
      alert('Please login to like posts');
      return;
    }

    this.postService.toggleLike(post.id, currentUserId).subscribe(res => {
      if (res.success) {
        this.refreshData();
      }
    });
  }

  handlePostComment(postId: number, commentText: string) {
    if (!commentText.trim()) return;

    const username = this.authService.currentUser()?.username || 'Anonymous';
    this.postService.addComment(postId, username, commentText).subscribe(comment => {
      this.postComments.update(comments => [...comments, comment]);
      this.newComment.set('');
      this.refreshData();
    });
  }

  openLikesModal(post: Post | null | undefined) {
    if (!post || !post.likes || post.likes.length === 0) return;
    this.selectedPostForView.set(post);
    this.likesToShow.set(post.likes);
    this.showLikesModal.set(true);
  }

  closeLikesModal() {
    this.showLikesModal.set(false);
    this.likesToShow.set([]);
    // Only clear selectedPostForView if the post detail modal is also closed
    if (!this.showPostModal()) {
      this.selectedPostForView.set(null);
    }
  }
}
