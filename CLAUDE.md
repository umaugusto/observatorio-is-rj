# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Designário** - Observatório de Inovação Social do Rio de Janeiro - plataforma para catalogar casos de inovação social por extensionistas universitários.

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Supabase + Netlify + Leaflet Maps

## Development Commands

```bash
npm install                 # Install dependencies
npm run dev                # Start development server (localhost:5173)
npm run build              # Production build (TypeScript + Vite)
npm run lint               # ESLint check (must pass with 0 warnings)
npm run preview            # Preview production build
```

## Architecture

### Authentication Flow
- **Supabase Auth** → **Custom usuarios table** → **useAuth hook**
- User types: `admin` | `extensionista` | `pesquisador` | `coordenador` (stored in `usuarios.tipo`)
- Auth context in `src/hooks/useAuth.tsx` wraps entire app with optimized session persistence
- Supabase client configured with `persistSession: true` and `autoRefreshToken: true`
- Login redirects handled automatically via `useAuth()` state

### User Management System
- Complete admin interface at `/admin/usuarios` for user CRUD operations
- Profile management system with avatar upload functionality
- Protected routes using `ProtectedRoute` component with role-based access
- Four user types with different permissions and UI styling

### Core Data Models
```typescript
// src/types/index.ts
User: { 
  id, email, nome, tipo: 'admin' | 'extensionista' | 'pesquisador' | 'coordenador',
  instituicao?, telefone?, bio?, avatar_url?: string | null, ativo, created_at, updated_at
}
CasoInovacao: { 
  id, titulo, descricao, resumo?, localizacao, categoria, subcategoria?,
  extensionista_id, status_ativo, imagem_url?, coordenadas_lat?, coordenadas_lng?
}
```

### Key Service Functions
```typescript
// src/services/supabase.ts
// User Management
getAllUsers()                 // Get all users (admin only)
getUser(userId)              // User profile (with 5s timeout)
getOrCreateUser(authUser)    // Auto-create user if missing
updateUser(userId, updates)  // Update user profile
createNewUser(userData)      // Create new user (admin)
toggleUserStatus()           // Activate/deactivate user
deleteUser()                 // Remove user

// Avatar Management
uploadAvatar(userId, file)   // Upload and update user avatar
uploadAvatarOnly(file)       // Upload without DB update
deleteAvatar(userId, url?)   // Remove avatar and clean storage

// Cases
getCasos()                   // All active cases with extensionista join
getCasosByCategory(categoria) // Filtered by category
```

### File Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx     # Role-based route protection
│   ├── common/
│   │   ├── Avatar.tsx             # Avatar component with initials fallback
│   │   └── Header.tsx             # Navigation with user menu
│   └── setup/DatabaseSetup.tsx    # First-time database setup UI
├── pages/
│   ├── Profile.tsx                # User profile with avatar upload
│   └── admin/
│       └── UserManagement.tsx     # Complete admin user management
├── hooks/useAuth.tsx              # Authentication context & state
├── services/supabase.ts           # Database operations & avatar storage
├── types/index.ts                 # TypeScript interfaces
└── utils/constants.ts             # Routes, categories, user types
```

## Development Patterns

### Error Handling
- Always wrap Supabase calls in try/catch
- Use timeout promises for queries that may hang (5s for getUser)
- Show user-friendly error messages in UI
- Extensive console logging with emoji prefixes (🔍, ✅, ❌)

### Authentication & Session Management
- Supabase client configured with explicit session persistence options
- Debug logging includes localStorage token verification
- Fallback user creation if profile fetch fails but auth session exists
- Session state debugging with timestamp and expiry logging

### State Management
- Authentication state via React Context (`useAuth`)
- Component-level state with `useState` for forms
- No external state management library

### Styling Standards & Brand Colors
- Tailwind CSS only - no custom CSS
- Custom classes: `container-custom`, `btn-primary`, `btn-secondary`, `card`
- Mobile-first responsive design

#### Brand Color Palette
- **Primary (Orange)**: `primary-*` - Main brand color (#E95420)
- **Secondary (Green)**: `secondary-*` - Complementary color (#4CAF50)  
- **Accent (Navy)**: `accent-*` - Supporting color (#003F5C)
- **Neutral (Gray)**: `neutral-*` - Text and backgrounds (#F0F0F0 to #171717)

#### Logo & Branding
- Logo component: `<Logo />` in `src/components/common/Logo.tsx`
- Features: Open book with growth arrow, available in multiple sizes
- Brand name: **Designário** 
- Subtitle: **Observatório de Inovação Social**
- Favicon: `/favicon.svg` (book + arrow icon)

#### User Type Badge Colors
- Admin: purple, Coordenador: indigo, Pesquisador: green, Extensionista: blue

## Interactive Maps System

### Map Components & Features
- **Interactive maps**: Leaflet + OpenStreetMap integration via `react-leaflet`
- **CaseMap component**: `src/components/common/CaseMap.tsx` - displays case location with impact area
- **Neighborhood boundaries**: Real neighborhood polygons via Overpass API when available
- **Geocoding**: ViaCEP (Brazilian postal codes) + Nominatim (OpenStreetMap) for coordinates
- **Fallback system**: Circle approximation when boundary data unavailable

### Location Data Priority
1. **CEP (postal code)** → ViaCEP API → Nominatim coordinates
2. **Bairro + Cidade** → Direct Nominatim search  
3. **Cidade apenas** → Broad city coordinates
4. **Fallback**: Rio de Janeiro default coordinates

### Map Features
- **Markers**: Red pin for project location with popup info
- **Impact areas**: Blue polygons (real boundaries) or circles (approximated)
- **Interactive popups**: Case details, impact statistics
- **Zoom levels**: Auto-adjust based on boundary type (13 for polygons, 14 for circles)

## Avatar & File Upload System

### Storage Configuration
- Supabase Storage bucket: `avatars`
- File naming: `{userId}-{timestamp}.{extension}`
- Max file size: 2MB, images only
- Automatic cleanup of old avatars when updating

### Upload Functions
- `uploadAvatar()`: Complete upload with database update
- `uploadAvatarOnly()`: Storage upload without DB changes (for user creation flow)
- Avatar component shows user initials when no image available

## Known Issues & Debugging

### Authentication Issues
- Session persistence requires proper RLS policies on `usuarios` table
- Common RLS policy needed: `CREATE POLICY "Users can update their own profile" ON usuarios FOR UPDATE USING (auth.uid() = id::uuid)`
- Check Network tab for 406 errors indicating RLS permission issues

### Database Query Optimization
- `getUser()` has 5-second timeout to prevent hanging
- `updateUser()` modified to handle array responses (removed `.single()` to prevent "Cannot coerce to single JSON object" errors)
- Extensive logging helps diagnose query timing issues

### Storage Permissions
- Avatar bucket needs policies for user file upload/update
- File paths use user ID for security: `avatars/{userId}-{timestamp}.ext`

## Page Structure & Components

### Main Pages
- **Home** (`src/pages/Home.tsx`): Hero section with Rio de Janeiro background image, stats, and bento box case layout
- **Cases** (`src/pages/Casos.tsx`): Enhanced case listing with visual category filters and pagination
- **Categories** (`src/pages/Categorias.tsx`): Category overview with recent cases and fixed action buttons
- **Case Details** (`src/pages/CasoDetalhes.tsx`): Tab-based case viewing with interactive map
- **Login** (`src/pages/Login.tsx`): Authentication with new Designário branding

### Admin Pages
- **Case Management** (`src/pages/admin/CaseManagement.tsx`): Full CRUD with icon-based actions
- **Case Editor** (`src/pages/admin/CaseEditor.tsx`): Tab-based form with CEP integration and social media fields
- **User Management** (`src/pages/admin/UserManagement.tsx`): Complete admin user interface

### Common Components  
- **Logo** (`src/components/common/Logo.tsx`): SVG logo with open book + growth arrow
- **Header** (`src/components/common/Header.tsx`): Navigation with Designário branding
- **CaseMap** (`src/components/common/CaseMap.tsx`): Interactive neighborhood boundary maps