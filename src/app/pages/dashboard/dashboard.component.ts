import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { PostService, Post, Like } from '../../services/post.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  protected authService = inject(AuthService);
  private postService = inject(PostService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  posts = signal<Post[]>([]);
  allUsersList = signal<User[]>([]);
  view = signal<'home' | 'profile' | 'accounts'>('home');
  selectedProfileUsername = signal<string | null>(null);
  viewedUserProfile = signal<any | null>(null);
  showCreateModal = signal(false);
  isEditing = signal(false);
  showLogoutConfirm = signal(false);
  showDeleteConfirm = signal(false);
  postIdToDelete = signal<number | null>(null);
  editingPost = signal<Post | null>(null);
  selectedPostForView = signal<Post | null>(null);
  showPostModal = signal(false);
  currentVideoIndex = signal(0);
  activeMenuId = signal<number | null>(null);
  newComment = '';
  postComments = signal<any[]>([]);
  isLoadingPosts = signal(false);
  showLikesModal = signal(false);
  likesToShow = signal<Like[]>([]);
  showShareToast = signal(false);
  showAuthModal = signal(false);

  // Edit Profile States
  showEditProfileModal = signal(false);
  editUsername = signal('');
  editBio = signal('');
  editPassword = signal('');
  isUpdatingProfile = signal(false);
  showUpdateSuccess = signal(false);
  selectedProfileFile = signal<File | null>(null);
  profileImagePreview = signal<string | null>(null);
  removeProfilePhoto = signal(false);

  hasProfileChanges = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return false;
    return (
      this.editUsername() !== user.username ||
      this.profileImagePreview() !== user.image ||
      this.editPassword() !== "" ||
      this.removeProfilePhoto()
    );
  });

  isAdmin = computed(() => this.authService.currentUser()?.username === 'OLGP_PCY');

  // Account Management State
  showCreateAccountModal = signal(false);
  isEditingAccount = signal(false);
  editingAccountId = signal<number | null>(null);
  accountImagePreview = signal<string | null>(null);
  selectedAccountFile = signal<File | null>(null);
  newAccountData = {
    username: '',
    password: '',
    email: '',
    fname: '',
    lname: '',
    bio: ''
  };

  userPosts = computed(() => {
    const username = this.selectedProfileUsername() || this.authService.currentUser()?.username;
    return this.posts().filter(p => p.username === username);
  });

  totalUserLikes = computed(() => {
    return this.userPosts().reduce((acc, post) => acc + (post.likes?.length || 0), 0);
  });

  isViewingSelf = computed(() => {
    const selected = this.selectedProfileUsername();
    const current = this.authService.currentUser()?.username;
    return !selected || selected === current;
  });

  // Post Creation States
  selectedFile = signal<File | null>(null);
  selectedFilePreview = signal<string | null>(null);
  postCaption = '';
  isUploading = signal(false);

  private videoData = [
    { title: 'KANDILA', description: '"Ama patawarin mo sila sapagkat hindi nila alam ang kaniyang ginagawa"', url: 'https://www.youtube.com/embed/pz7DJU7Os7U' },
    { title: 'NAKAW NA PARAISO', description: '"Sinasabi ko sa \'yo: Ngayon din ay isasama kita sa Pariso."', url: 'https://www.youtube.com/embed/vYoLj4PfGlE' },
    { title: 'BUBOY', description: '“Babae, narito, ang iyong anak!” “Narito, ang iyong ina!”', url: 'https://www.youtube.com/embed/HXq1xr8PMWI' },
    { title: 'ILAW', description: '“Diyos ko, Diyos ko! Bakit mo ako pinabayaan?”', url: 'https://www.youtube.com/embed/AV0o6VQXmZs' },
    { title: 'KAMAYAN', description: '“Nauuhaw ako!"', url: 'https://www.youtube.com/embed/olTlczcdFWQ' },
    { title: 'ANGHEL SA DILIM', description: '"Naganap na""', url: 'https://www.youtube.com/embed/jl76Iw6mwJM' },
    { title: 'GULONG NA BUHAY', description: '"Ama, sa mga kamay mo, inihahabilin ko ang aking espiritu"', url: 'https://www.youtube.com/embed/5l1V56qClC0' }
  ];

  safeVideos = signal<{ title: string; description: string; url: SafeResourceUrl }[]>(
    this.videoData.map(v => ({
      ...v,
      url: this.sanitizer.bypassSecurityTrustResourceUrl(v.url)
    }))
  );

  get currentTimestamp(): string {
    return new Date().toISOString();
  }

  constructor() {
    this.loadPosts();
  }

  onVideoScroll(event: Event) {
    const element = event.target as HTMLElement;
    const scrollPosition = element.scrollLeft;
    const itemWidth = 450 + 32; // item width (450) + gap (2rem = 32px)
    const index = Math.round(scrollPosition / itemWidth);
    if (this.currentVideoIndex() !== index) {
      this.currentVideoIndex.set(index);
    }
  }

  scrollToVideo(index: number) {
    const grid = document.querySelector('.video-grid');
    if (grid) {
      const itemWidth = 450 + 32;
      grid.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth'
      });
    }
  }

  private pollSubscription?: Subscription;

  ngOnInit() {
    this.loadPosts();

    // Handle deep linking to a specific post
    const postId = this.route.snapshot.queryParamMap.get('postId');
    if (postId) {
      this.postService.getPosts().subscribe(posts => {
        const post = posts.find(p => p.id === Number(postId));
        if (post) {
          this.openPostModal(post);
        }
      });
    }

    // Real-time polling every 5 seconds
    this.pollSubscription = interval(5000).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnDestroy() {
    this.pollSubscription?.unsubscribe();
  }

  refreshData() {
    this.postService.getPosts().subscribe(data => {
      const sorted = data.sort((a, b) => b.id - a.id);
      this.posts.set(sorted);

      // Update modal post if open
      const currentModalPost = this.selectedPostForView();
      if (this.showPostModal() && currentModalPost) {
        const updated = sorted.find(p => p.id === currentModalPost.id);
        if (updated) {
          this.selectedPostForView.set(updated);
          // If likes modal is open for this post, refresh the list
          if (this.showLikesModal()) {
            this.likesToShow.set(updated.likes || []);
          }
        }
        this.loadComments(currentModalPost.id);
      }
      if (this.isAdmin()) {
        this.loadAllUsers();
      }
    });
  }

  loadPosts() {
    this.isLoadingPosts.set(true);
    this.postService.getPosts().subscribe(data => {
      this.posts.set(data.sort((a, b) => b.id - a.id));
      // Add a slight delay for smooth transition if data loads too fast
      setTimeout(() => {
        this.isLoadingPosts.set(false);
      }, 800);
    });
  }

  trackById(index: number, post: Post): number {
    return post.id;
  }

  isDashboardHome(): boolean {
    return this.router.url === '/dashboard';
  }

  togglePostMenu(event: Event, postId: number) {
    event.stopPropagation();
    if (this.activeMenuId() === postId) {
      this.activeMenuId.set(null);
    } else {
      this.activeMenuId.set(postId);
    }
  }

  closeAllMenus() {
    this.activeMenuId.set(null);
  }

  viewProfile(username: string) {
    this.selectedProfileUsername.set(username);
    this.view.set('profile');
    this.closePostModal();
    this.closeLikesModal();
    this.closeAllMenus();

    // Fetch user details for bio etc
    this.authService.getUserByUsername(username).subscribe(user => {
      this.viewedUserProfile.set(user);
    });
  }

  viewOwnProfile() {
    this.selectedProfileUsername.set(null);
    this.viewedUserProfile.set(this.authService.currentUser());
    this.view.set('profile');
  }

  openEditProfileModal() {
    const user = this.authService.currentUser();
    if (user) {
      this.editUsername.set(user.username);
      this.editBio.set(user.bio || '');
      this.editPassword.set(''); // Keep password empty for security
      this.profileImagePreview.set(this.getUserImage(user));
      this.selectedProfileFile.set(null);
      this.removeProfilePhoto.set(false);
      this.showEditProfileModal.set(true);
    }
  }

  removeProfileImage() {
    this.profileImagePreview.set(null);
    this.selectedProfileFile.set(null);
    this.removeProfilePhoto.set(true);
  }

  onProfileImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.removeProfilePhoto.set(false);
      this.compressImage(file).then(compressedFile => {
        this.selectedProfileFile.set(compressedFile);
        const reader = new FileReader();
        reader.onload = (e: any) => this.profileImagePreview.set(e.target.result);
        reader.readAsDataURL(compressedFile);
      });
    }
  }

  async compressImage(file: File): Promise<File> {
    if (file.size <= 1 * 1024 * 1024) return file; // Skip if under 1MB

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Simple downscaling
          const MAX_SIZE = 1200;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  closeEditProfileModal() {
    this.showEditProfileModal.set(false);
  }

  handleUpdateProfile() {
    const user = this.authService.currentUser();
    if (!user || !this.hasProfileChanges()) return;

    this.isUpdatingProfile.set(true);
    const updateData: any = {
      username: this.editUsername(),
      bio: this.editBio()
    };

    if (this.editPassword()) {
      updateData.password = this.editPassword();
    }

    if (this.profileImagePreview() && this.selectedProfileFile()) {
      updateData.image = this.profileImagePreview();
    }

    if (this.removeProfilePhoto()) {
      updateData.image = "";
    }

    // Single profile update including image
    this.authService.updateProfile(user.id, updateData).subscribe({
      next: (updatedUser) => {
        this.finalizeUpdate(updatedUser);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.isUpdatingProfile.set(false);
      }
    });
  }

  private finalizeUpdate(updatedUser: any) {
    this.isUpdatingProfile.set(false);
    this.viewedUserProfile.set(updatedUser);
    this.showUpdateSuccess.set(true);

    // Auto-close success message and modal after 2 seconds
    setTimeout(() => {
      this.showUpdateSuccess.set(false);
      this.closeEditProfileModal();
    }, 2000);

    this.loadPosts(); // Refresh posts to show new username
  }

  getUserImage(user: any): string | null {
    if (!user) return null;
    if (user.image) {
      if (user.image.startsWith('profile/')) return '/' + user.image;
      return user.image; // Supports Base64 directly
    }
    if (user.username === 'OLGP_PCY') return 'assets/PCY.png';
    return null;
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.showCreateModal.set(true);
  }

  openEditModal(post: Post) {
    this.editingPost.set(post);
    this.postCaption = post.caption;
    this.isEditing.set(true);
    this.activeMenuId.set(null); // Close menu
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.isEditing.set(false);
    this.editingPost.set(null);
    this.resetCreation();
  }

  openPostModal(post: Post) {
    this.selectedPostForView.set(post);
    this.showPostModal.set(true);
    this.loadComments(post.id);

    // Update URL with postId for deep linking
    this.router.navigate([], {
      queryParams: { postId: post.id },
      queryParamsHandling: 'merge'
    });
  }

  closePostModal() {
    this.showPostModal.set(false);
    this.selectedPostForView.set(null);
    this.postComments.set([]);

    // Clear the query parameter when modal closes
    this.router.navigate([], {
      queryParams: { postId: null },
      queryParamsHandling: 'merge'
    });
  }

  loadComments(postId: number) {
    this.postService.getComments(postId).subscribe(comments => {
      this.postComments.set(comments);
    });
  }

  handlePostComment(postId: number, commentText: string) {
    if (!commentText.trim()) return;

    const username = this.authService.currentUser()?.username || 'Anonymous';
    this.postService.addComment(postId, username, commentText).subscribe(comment => {
      this.postComments.update(comments => [...comments, comment]);
      this.newComment = '';
      this.refreshData();
    });
  }

  handlePostCommentFromFeed(postId: number, inputElement: HTMLInputElement) {
    const commentText = inputElement.value;
    if (!commentText.trim()) return;

    const username = this.authService.currentUser()?.username || 'Anonymous';
    this.postService.addComment(postId, username, commentText).subscribe(() => {
      inputElement.value = '';
      this.refreshData();
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.compressImage(file).then(compressedFile => {
        this.selectedFile.set(compressedFile);
        const reader = new FileReader();
        reader.onload = () => {
          this.selectedFilePreview.set(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      });
    }
  }

  isPostOwner(post: Post): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    if (user.username === 'OLGP_PCY') return true;
    return post.username === user.username;
  }

  handleCreatePost() {
    const fileContent = this.selectedFilePreview();
    if (!fileContent) return;

    this.isUploading.set(true);
    const postData = {
      image: fileContent,
      username: this.authService.currentUser()?.username || 'Anonymous',
      caption: this.postCaption
    };

    this.postService.createPost(postData).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.closeCreateModal();
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error creating post:', err);
        this.isUploading.set(false);
      }
    });
  }

  handleUpdatePost() {
    const post = this.editingPost();
    if (!post) return;

    this.isUploading.set(true);
    this.postService.updatePost(post.id, { caption: this.postCaption }).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.closeCreateModal();
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error updating post:', err);
        this.isUploading.set(false);
      }
    });
  }

  handleDeletePost(id: number) {
    this.postIdToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  confirmDeletePost() {
    const id = this.postIdToDelete();
    if (id !== null) {
      this.postService.deletePost(id).subscribe({
        next: () => {
          this.loadPosts();
          this.activeMenuId.set(null);
          this.showDeleteConfirm.set(false);
          this.postIdToDelete.set(null);
        },
        error: (err) => {
          console.error('Error deleting post:', err);
          this.showDeleteConfirm.set(false);
        }
      });
    }
  }

  resetCreation() {
    this.selectedFile.set(null);
    this.selectedFilePreview.set(null);
    this.postCaption = '';
  }

  logout() {
    this.showLogoutConfirm.set(true);
  }

  confirmLogout() {
    this.showLogoutConfirm.set(false);
    this.authService.logout();
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
      this.showAuthModal.set(true);
      return;
    }

    this.postService.toggleLike(post.id, currentUserId).subscribe(res => {
      if (res.success) {
        this.refreshData();
      }
    });
  }

  openLikesModal(post: Post | null | undefined) {
    if (!post || !post.likes || post.likes.length === 0) return;
    this.likesToShow.set(post.likes);
    this.showLikesModal.set(true);
  }

  closeLikesModal() {
    this.showLikesModal.set(false);
    this.likesToShow.set([]);
  }

  sharePost(post: Post | null | undefined) {
    if (!post) return;

    // Simplified deep link for the community wall
    const shareUrl = `${window.location.origin}/dashboard?postId=${post.id}`;
    const postCaption = post.caption ? ` - "${post.caption}"` : '';
    const shareText = `Check out this post on OLGP | PCY Wall${postCaption}`;

    if (navigator.share) {
      navigator.share({
        title: 'OLGP | PCY Wall',
        text: shareText,
        url: shareUrl
      }).catch(() => {
        this.copyToClipboard(shareUrl);
      });
    } else {
      this.copyToClipboard(shareUrl);
    }
  }

  private copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.showShareToast.set(true);
      setTimeout(() => this.showShareToast.set(false), 3000);
    });
  }

  loadAllUsers() {
    this.authService.getAllUsers().subscribe(users => {
      this.allUsersList.set(users);
    });
  }

  viewAccounts() {
    this.view.set('accounts');
    this.loadAllUsers();
  }

  openCreateAccountModal() {
    this.isEditingAccount.set(false);
    this.newAccountData = { username: '', password: '', email: '', fname: '', lname: '', bio: '' };
    this.accountImagePreview.set(null);
    this.showCreateAccountModal.set(true);
  }

  openEditAccountModal(user: User) {
    this.isEditingAccount.set(true);
    this.editingAccountId.set(user.id);
    this.newAccountData = {
      username: user.username,
      password: '', // Leave blank to keep current
      email: user.email || '',
      fname: user.fname || '',
      lname: user.lname || '',
      bio: user.bio || ''
    };
    this.accountImagePreview.set(user.image || null);
    this.showCreateAccountModal.set(true);
  }

  onAccountImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.compressImage(file).then(compressedFile => {
        this.selectedAccountFile.set(compressedFile);
        const reader = new FileReader();
        reader.onload = () => {
          this.accountImagePreview.set(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      });
    }
  }

  handleSaveAccount() {
    if (!this.newAccountData.username) return;
    if (!this.isEditingAccount() && !this.newAccountData.password) return;

    const data: any = { ...this.newAccountData };
    if (this.accountImagePreview()) {
      data.image = this.accountImagePreview();
    }

    if (this.isEditingAccount()) {
      const id = this.editingAccountId();
      if (!id) return;
      if (!data.password) delete data.password;

      this.authService.updateProfile(id, data).subscribe({
        next: () => {
          this.loadAllUsers();
          this.closeAccountModal();
        },
        error: (err) => console.error('Error updating account:', err)
      });
    } else {
      this.authService.createUser(data).subscribe({
        next: () => {
          this.loadAllUsers();
          this.closeAccountModal();
        },
        error: (err) => console.error('Error creating account:', err)
      });
    }
  }

  closeAccountModal() {
    this.showCreateAccountModal.set(false);
    this.isEditingAccount.set(false);
    this.editingAccountId.set(null);
    this.accountImagePreview.set(null);
    this.selectedAccountFile.set(null);
    this.newAccountData = { username: '', password: '', email: '', fname: '', lname: '', bio: '' };
  }
}
