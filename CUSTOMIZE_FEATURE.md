# Customize Page Feature - Implementation Summary

## Overview
Added a comprehensive "Customize Page" feature to the OLGP PCY website that allows the OLGP_PCY admin account to edit website content dynamically.

## Features Implemented

### 1. **Landing Page Customization**
- Edit welcome label text
- Modify hero title and subtitle
- Upload and change the PCY logo
- Edit GSFF section labels and descriptions

### 2. **GSFF Videos Management**
- Add new video entries
- Edit video titles and descriptions
- Update YouTube embed URLs
- Remove videos
- Live preview of embedded videos

### 3. **Officer Terms Management**
- Add new officer terms/periods
- Edit coordinator names
- Manage executive committee members
- Add/remove committee members
- Organize multiple terms chronologically

## Files Created

### Frontend Components
1. **`src/app/pages/customize/customize.component.ts`**
   - Main component logic
   - State management for all editable content
   - File upload handling for logo
   - Save/load functionality

2. **`src/app/pages/customize/customize.component.html`**
   - Three-tab interface (Landing, Videos, Officers)
   - Form inputs for all editable fields
   - Dynamic lists for videos and officer terms
   - Success notifications

3. **`src/app/pages/customize/customize.component.css`**
   - Modern, premium styling with glassmorphism
   - Responsive design for mobile and desktop
   - Smooth animations and transitions
   - Color scheme matching the site's green theme

### Services
4. **`src/app/services/customize.service.ts`**
   - API communication service
   - Type definitions for content structure
   - GET and POST methods for content

### Backend Functions
5. **`netlify/functions/site-content.ts`**
   - Netlify serverless function
   - Database operations for storing/retrieving content
   - CORS handling
   - Creates `site_content` table automatically

## Routing Updates
- Added `/customize` route with auth guard protection
- Only accessible to authenticated admin users (OLGP_PCY)

## Navigation Updates
- Added "Customize Page" link to desktop sidebar (admin only)
- Added settings icon button to mobile bottom navigation (admin only)
- Automatically redirects non-admin users to dashboard

## Database Schema
New table created: `site_content`
```sql
CREATE TABLE site_content (
    id SERIAL PRIMARY KEY,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## Content Structure
```typescript
{
  landing: {
    welcomeLabel: string,
    heroTitle: string,
    heroSubtitle: string,
    logoImage: string,
    gsffLabel: string,
    gsffTitle: string,
    gsffDescription: string
  },
  videos: [{
    title: string,
    description: string,
    url: string
  }],
  officerTerms: [{
    term: string,
    coordinator: string,
    executiveCommittee: string[]
  }]
}
```

## User Experience

### For Admin (OLGP_PCY)
1. Login to dashboard
2. Click "Customize Page" in sidebar or bottom nav
3. Select tab (Landing Page, GSFF Videos, or Officer Terms)
4. Edit content using intuitive forms
5. Click "Save Changes" to persist updates
6. See success notification
7. Changes are stored in database

### Security
- Route protected by auth guard
- Component checks for OLGP_PCY username
- Non-admin users redirected to dashboard
- All API calls require authentication

## Design Features
- **Glassmorphism**: Modern frosted glass effect on cards
- **Smooth Animations**: Fade-in, slide-up effects
- **Color Scheme**: Green gradient theme matching site branding
- **Responsive**: Works on mobile, tablet, and desktop
- **Accessibility**: Clear labels, good contrast, keyboard navigation

## Future Enhancements (Optional)
1. Image upload for video thumbnails
2. Drag-and-drop reordering of videos/terms
3. Preview mode before saving
4. Version history/rollback functionality
5. Bulk import/export of content
6. Rich text editor for descriptions
7. Image gallery management
8. Social media links customization

## Testing Checklist
- [ ] Admin can access customize page
- [ ] Non-admin users are redirected
- [ ] Landing page content can be edited
- [ ] Logo can be uploaded and previewed
- [ ] Videos can be added/edited/removed
- [ ] Video previews work correctly
- [ ] Officer terms can be managed
- [ ] Committee members can be added/removed
- [ ] Save functionality works
- [ ] Success message displays
- [ ] Content persists after page reload
- [ ] Mobile navigation works
- [ ] Desktop navigation works
- [ ] Responsive design on all screen sizes

## Notes
- The customize feature stores all changes in a PostgreSQL database
- Content is saved as JSONB for flexibility
- Each save creates a new record (can implement versioning later)
- The latest record is always retrieved
- Logo images are stored as base64 data URLs
- Video URLs should be YouTube embed format

## Access
**URL**: `/customize`  
**Required Role**: Admin (OLGP_PCY account)  
**Navigation**: Dashboard sidebar or mobile bottom nav
