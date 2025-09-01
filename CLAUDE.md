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
- **Default Password System**: Admins can create users with default password `12345678`
- **Forced Password Change**: Users with `must_change_password = true` are redirected to `/change-password`
- **Password Reset**: Reset user passwords to default and force change on next login
- Profile management system with avatar upload functionality
- Protected routes using `ProtectedRoute` component with role-based access
- Five user types including `demo` for demonstration mode

### Core Data Models
```typescript
// src/types/index.ts
User: { 
  id, email, nome, tipo: 'admin' | 'extensionista' | 'pesquisador' | 'coordenador' | 'demo',
  instituicao?, telefone?, bio?, avatar_url?: string | null, ativo, must_change_password?, 
  isDemo?, created_at, updated_at
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
getAllUsers()                           // Get all users (admin only)
getUser(userId)                        // User profile (with 5s timeout)
getOrCreateUser(authUser)              // SECURITY: Only returns existing users, no auto-creation
updateUser(userId, updates)            // Update user profile
createNewUser(userData)                // Create new user (admin) - legacy
createUserWithDefaultPassword(data)   // Create user with password "12345678" + must_change_password=true
resetUserPassword(userId)              // Reset password to "12345678" + force change
toggleUserStatus()                     // Activate/deactivate user
deleteUser()                           // Remove user

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
│   │   ├── ProtectedRoute.tsx        # Role-based route protection
│   │   └── PasswordChangeGuard.tsx   # Forces password change when must_change_password=true
│   ├── common/
│   │   ├── Avatar.tsx                # Avatar component with initials fallback
│   │   ├── Header.tsx                # Navigation with user menu
│   │   └── DemoBanner.tsx            # Demo mode indicator banner
│   └── setup/DatabaseSetup.tsx       # First-time database setup UI
├── pages/
│   ├── Profile.tsx                # User profile with avatar upload
│   ├── ChangePassword.tsx         # Forced password change page
│   ├── EmergencySetup.tsx         # Emergency root user creation (admin recovery)
│   └── admin/
│       └── UserManagement.tsx     # Complete admin user management with default passwords
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
- **Security Model**: Only pre-registered users can access (no auto-registration)
- `getOrCreateUser()` rejects login if user not in `usuarios` table
- Supabase client configured with explicit session persistence options
- **Password Management**: Default password system with forced change on first login
- **PasswordChangeGuard** component intercepts users needing password changes
- Debug logging includes localStorage token verification and session state
- **Emergency Setup**: `/emergency-setup` route for admin account recovery

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

## Password Management System

### Default Password Flow
1. **Admin creates user** via `/admin/usuarios` → auto-assigns password `12345678`
2. **User first login** → `PasswordChangeGuard` detects `must_change_password = true`
3. **Automatic redirect** to `/change-password` → user cannot access app until password changed
4. **Password validation**: Cannot use default password `12345678`, minimum 8 characters
5. **After successful change** → `must_change_password = false` → normal access granted

### Password Reset Flow
1. **Admin clicks reset button** for user → confirms with warning dialog
2. **System resets password** to `12345678` + sets `must_change_password = true`
3. **User notified** to change password on next login
4. **Emergency Setup**: `/emergency-setup` creates root admin if access issues occur

### Key Components
- **PasswordChangeGuard**: Wraps entire app, intercepts users needing password change
- **ChangePassword page**: Secure password change with validation and UI feedback
- **UserManagement**: Admin interface with create/reset password functionality
- **EmergencySetup**: Recovery tool for creating root admin account

## Demo Mode System

### Demo Features
- **Demo banner** appears when `isDemoMode()` returns true
- **DemoInterceptor** class intercepts all database operations
- **Mock data** returned for users, cases, and messages without persistence
- **Demo user authentication** via `signInDemo()` function
- **Visual indicators** throughout UI to show demo status

### Demo Data Sources
- `src/services/demoData.ts` contains mock users, cases, and messages
- Demo user has `isDemo: true` flag for identification
- All CRUD operations simulated with realistic delays
- No actual database modifications in demo mode

## Security Features

### Access Control
- **Whitelist-only access**: Only users in `usuarios` table can login
- **Role-based permissions**: Different UI/features per user type
- **Protected routes**: `ProtectedRoute` component with `adminOnly` flag
- **Session management**: Persistent authentication with auto-refresh

### Database Security
- **Row Level Security (RLS)** policies required on all tables
- **User-scoped access**: Users can only modify their own data
- **Admin permissions**: Special access for user management operations
- **API key security**: Never expose service role keys in client code

## Development Guidelines

### Code Style & Architecture
- **TypeScript strict mode**: All new code must be properly typed
- **Component patterns**: Use functional components with hooks
- **Error handling**: Always wrap Supabase calls in try/catch with user-friendly messages
- **Console logging**: Use emoji prefixes for debugging (🔍, ✅, ❌, 🔑, 🚨)
- **Responsive design**: Mobile-first approach with Tailwind classes

### Database Operations
- **Timeout handling**: Use 5-second timeouts for queries that may hang
- **RLS compliance**: All queries must respect Row Level Security policies
- **User security**: Never auto-create users - only return existing registered users
- **Avatar management**: Clean up old files when updating user avatars

### Password Security
- **Default password**: Always `12345678` for admin-created accounts
- **Force change**: Set `must_change_password = true` for new/reset accounts
- **Validation**: Prevent reuse of default password, enforce minimum 8 characters
- **Emergency access**: Use `/emergency-setup` for admin account recovery

### Important Files & Scripts
- **GUIA-CADASTRO-USUARIOS.md**: Step-by-step user registration guide
- **create-admin-users.sql**: SQL script for bulk admin user creation
- **EmergencySetup.tsx**: Admin account recovery interface
- **PasswordChangeGuard.tsx**: Password change enforcement component
- o dominio é https://observatorio-is-rj.netlify.app/login