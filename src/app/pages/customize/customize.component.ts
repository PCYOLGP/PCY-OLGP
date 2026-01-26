import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { CustomizeService, SiteContent, OfficerBatch, DirectoryMember } from '../../services/customize.service';

@Component({
    selector: 'app-customize',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './customize.component.html',
    styleUrl: './customize.component.css'
})
export class CustomizeComponent implements OnInit {
    private authService = inject(AuthService);
    private customizeService = inject(CustomizeService);
    private router = inject(Router);
    private sanitizer = inject(DomSanitizer);

    // State management
    activeTab = signal<'landing' | 'videos' | 'officers' | 'directory'>('landing');
    isSaving = signal(false);
    showSuccessMessage = signal(false);

    // Landing page content
    landingContent = signal({
        welcomeLabel: 'Welcome to our community',
        heroTitle: 'This is OLGP | PCY',
        heroSubtitle: 'The Parish Commission on Youth is a group of young people dedicated to faith, fellowship, and service. Whether you\'re looking to volunteer or grow in spirit, there\'s a place for you here.',
        logoImage: 'assets/PCY.png',
        heroButtonText: 'PCY OFFICERS 2026',
        gsffLabel: 'Short Film Festival',
        gsffTitle: 'GSFF 2022',
        gsffDescription: 'GSFF is a short film festival of Our Lady of Guadalupe Parish in Marilao, Bulacan, bringing stories of faith and reflection to the screen.'
    });

    // Videos content
    videos = signal([
        { title: 'KANDILA', description: '"Ama patawarin mo sila sapagkat hindi nila alam ang kaniyang ginagawa"', url: 'https://www.youtube.com/embed/pz7DJU7Os7U' },
        { title: 'NAKAW NA PARAISO', description: '"Sinasabi ko sa \'yo: Ngayon din ay isasama kita sa Pariso."', url: 'https://www.youtube.com/embed/vYoLj4PfGlE' },
        { title: 'BUBOY', description: '"Babae, narito, ang iyong anak!" "Narito, ang iyong ina!"', url: 'https://www.youtube.com/embed/HXq1xr8PMWI' },
        { title: 'ILAW', description: '"Diyos ko, Diyos ko! Bakit mo ako pinabayaan?"', url: 'https://www.youtube.com/embed/AV0o6VQXmZs' },
        { title: 'KAMAYAN', description: '"Nauuhaw ako!"', url: 'https://www.youtube.com/embed/olTlczcdFWQ' },
        { title: 'ANGHEL SA DILIM', description: '"Naganap na"', url: 'https://www.youtube.com/embed/jl76Iw6mwJM' },
        { title: 'GULONG NA BUHAY', description: '"Ama, sa mga kamay mo, inihahabilin ko ang aking espiritu"', url: 'https://www.youtube.com/embed/5l1V56qClC0' }
    ]);

    // Officers terms
    officerTerms = signal<OfficerBatch[]>([
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
            ]
        }
    ]);

    // PCY Directory
    directoryMembers = signal<DirectoryMember[]>([
        { name: 'Tristan Jhon Fruelda', role: 'Auditor', age: 23, yearJoined: 2023, address: 'St. Martha', bio: 'Youth Leader and community servant.', image: 'assets/tan.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/profile.php?id=100008628315250' },
        { name: 'Aeron jay Boringot', role: 'Member', age: 22, yearJoined: 2023, address: 'Marilao', bio: 'Tech enthusiast and active PCY member.', image: 'assets/tan.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/Aeronjay.11.1827A' },
        { name: 'Nixarene Nicole P. Escobillo', role: 'Coordinator', age: 21, yearJoined: 2024, address: 'Marilao', bio: 'Leading the youth with passion and dedication.', image: 'assets/nica.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/Nixarene.Escobilo' },
        { name: 'Zianna Crisolo', role: 'Vice Coordinator (External)', age: 20, yearJoined: 2024, address: 'Marilao', bio: 'Passionate about external relations and service.', image: 'assets/nica.jpg', email: 'sample@gmail.com', fb: 'https://www.facebook.com/profile.php?id=100074652100042' }
    ]);

    // Comparison data
    initialContent = signal<SiteContent | null>(null);

    hasChanges = computed(() => {
        const initial = this.initialContent();
        if (!initial) return false;

        const current: SiteContent = {
            landing: this.landingContent(),
            videos: this.videos(),
            officerTerms: this.officerTerms(),
            directory: this.directoryMembers()
        };

        // Deep comparison
        return JSON.stringify(initial) !== JSON.stringify(current);
    });

    // Logo upload
    selectedLogoFile = signal<File | null>(null);
    logoPreview = signal<string | null>(null);

    ngOnInit() {
        // Check if user is admin
        if (this.authService.currentUser()?.username !== 'OLGP_PCY') {
            this.router.navigate(['/dashboard']);
            return;
        }

        // Load saved content
        this.loadContent();
    }

    loadContent() {
        this.customizeService.getContent().subscribe(content => {
            if (content) {
                if (content.landing) {
                    this.landingContent.set(content.landing);
                }
                if (content.videos) {
                    this.videos.set(content.videos);
                }
                if (content.officerTerms) {
                    this.officerTerms.set(content.officerTerms);
                }
                if (content.directory) {
                    this.directoryMembers.set(content.directory);
                }

                // Store initial content for change tracking
                this.initialContent.set(JSON.parse(JSON.stringify({
                    landing: this.landingContent(),
                    videos: this.videos(),
                    officerTerms: this.officerTerms(),
                    directory: this.directoryMembers()
                })));
            }
        });
    }

    setActiveTab(tab: 'landing' | 'videos' | 'officers' | 'directory') {
        this.activeTab.set(tab);
    }

    onLogoSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedLogoFile.set(file);
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.logoPreview.set(e.target.result);
                this.landingContent.update(content => ({
                    ...content,
                    logoImage: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    }

    onMemberImageSelected(event: any, index: number) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.directoryMembers.update(members => {
                    const newMembers = [...members];
                    newMembers[index].image = e.target.result;
                    return newMembers;
                });
            };
            reader.readAsDataURL(file);
        }
    }

    addVideo() {
        this.videos.update(videos => [
            ...videos,
            { title: 'New Video', description: 'Video description', url: '' }
        ]);
    }

    removeVideo(index: number) {
        this.videos.update(videos => videos.filter((_, i) => i !== index));
    }

    onVideoUrlChange(index: number, newUrl: string) {
        let embedUrl = newUrl;

        // Handle various YouTube URL formats
        if (newUrl.includes('youtube.com/watch?v=')) {
            const videoId = newUrl.split('v=')[1]?.split('&')[0];
            if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (newUrl.includes('youtu.be/')) {
            const videoId = newUrl.split('youtu.be/')[1]?.split('?')[0];
            if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (newUrl.includes('youtube.com/shorts/')) {
            const videoId = newUrl.split('shorts/')[1]?.split('?')[0];
            if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        this.videos.update(videos => {
            const newVideos = [...videos];
            newVideos[index] = { ...newVideos[index], url: embedUrl };
            return newVideos;
        });
    }

    addOfficerTerm() {
        this.officerTerms.update(terms => [
            {
                year: 'YYYY-YYYY',
                youthAdviser: 'Youth Adviser Name',
                officers: [
                    { position: 'Coordinator/President', name: 'Name' }
                ],
                committees: []
            },
            ...terms
        ]);
    }

    removeOfficerTerm(index: number) {
        this.officerTerms.update(terms => terms.filter((_: OfficerBatch, i: number) => i !== index));
    }

    addOfficer(termIndex: number) {
        this.officerTerms.update(terms => {
            const newTerms = [...terms];
            newTerms[termIndex].officers.push({ position: 'Position', name: 'Name' });
            return newTerms;
        });
    }

    removeOfficer(termIndex: number, officerIndex: number) {
        this.officerTerms.update(terms => {
            const newTerms = [...terms];
            newTerms[termIndex].officers = newTerms[termIndex].officers.filter((_: any, i: number) => i !== officerIndex);
            return newTerms;
        });
    }

    addCommitteeMember(termIndex: number) {
        this.officerTerms.update(terms => {
            const newTerms = [...terms];
            if (!newTerms[termIndex].committees) newTerms[termIndex].committees = [];
            newTerms[termIndex].committees!.push({ position: 'Committee', name: 'Member Name' });
            return newTerms;
        });
    }

    removeCommitteeMember(termIndex: number, committeeIndex: number) {
        this.officerTerms.update(terms => {
            const newTerms = [...terms];
            if (newTerms[termIndex].committees) {
                newTerms[termIndex].committees = newTerms[termIndex].committees!.filter((_, i) => i !== committeeIndex);
            }
            return newTerms;
        });
    }

    addDirectoryMember() {
        this.directoryMembers.update(members => [
            ...members,
            { name: 'New Member', role: 'Member', age: 18, yearJoined: new Date().getFullYear(), address: '', bio: '', image: 'assets/PCY.png', email: '', fb: '' }
        ]);
    }

    removeDirectoryMember(index: number) {
        this.directoryMembers.update(members => members.filter((_, i) => i !== index));
    }

    saveChanges() {
        this.isSaving.set(true);

        const content: SiteContent = {
            landing: this.landingContent(),
            videos: this.videos(),
            officerTerms: this.officerTerms(),
            directory: this.directoryMembers()
        };

        this.customizeService.saveContent(content).subscribe({
            next: () => {
                this.isSaving.set(false);
                this.showSuccessMessage.set(true);
                // Update initial content after successful save
                this.initialContent.set(JSON.parse(JSON.stringify(content)));
                setTimeout(() => this.showSuccessMessage.set(false), 3000);
            },
            error: (err: any) => {
                console.error('Error saving content:', err);
                this.isSaving.set(false);
            }
        });
    }

    sanitizeUrl(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }
}
