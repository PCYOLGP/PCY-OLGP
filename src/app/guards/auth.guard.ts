import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    // If we are on the server, we allow the route to render.
    // The actual login check will happen on the client after hydration.
    // This prevents sudden logout/redirect on refresh because localStorage is unavailable on server.
    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    if (authService.isLoggedIn()) {
        return true;
    }

    router.navigate(['/login']);
    return false;
};
