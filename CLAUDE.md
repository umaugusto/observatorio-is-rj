# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Designário** - Observatório de Inovação Social do Rio de Janeiro - plataforma para catalogar casos de inovação social por extensionistas universitários.

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Supabase + Netlify + Leaflet Maps

## Development Commands

```bash
npm install                 # Install dependencies
npm run dev                # Start development server (configured for localhost:3000)
npm run build              # Production build (TypeScript + Vite)
npm run lint               # ESLint check (must pass with 0 warnings)
npm run preview            # Preview production build
```

### Database Operations (via SQL scripts)
```bash
# Execute via Supabase SQL Editor or psql command
fix-messages-flow.sql        # Complete messages system setup and RLS policies
check-table-structure.sql    # Verify database schema and data integrity
fix-missing-cidade.sql       # Fix cases with missing cidade field
cleanup-duplicated-cases.sql # Remove duplicate cases and maintain data consistency
```

## Architecture

### Authentication Flow
- **Supabase Auth** → **Custom usuarios table** → **useAuth hook**
- User types: `extensionista` | `pesquisador` | `coordenador` | `demo` (stored in `usuarios.tipo`)
- Permission flags: `is_admin` (boolean) and `is_root` (boolean) for administrative access
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
  id, email, nome, 
  tipo: 'extensionista' | 'pesquisador' | 'coordenador' | 'demo',
  is_admin?: boolean,    // Administrative permissions
  is_root?: boolean,      // Root user (can manage admins)
  instituicao?, telefone?, bio?, avatar_url?: string | null, 
  ativo, must_change_password?, isDemo?, 
  created_at, updated_at
}
CasoInovacao: {
  // Basic info
  id, titulo, descricao, resumo?, categoria, subcategoria?,
  // Location (updated schema)
  cidade?, estado?, bairro?, cep?, localizacao?, coordenadas_lat?, coordenadas_lng?,
  // Media & social
  imagem_url?, link_projeto?, video_url?, instagram_url?, facebook_url?, whatsapp?,
  // Impact data
  pessoas_impactadas?, orcamento?, data_inicio?, data_fim?, status?, tags?,
  // Team contact
  contato_nome?, contato_email?, contato_telefone?,
  // Meta
  extensionista_id, status_ativo, visualizacoes?, created_at, updated_at
}
ContactMessage: {
  id, nome, email, telefone?, assunto, mensagem,
  tipo_solicitacao: 'acesso' | 'duvida' | 'sugestao' | 'outro',
  status: 'pendente' | 'lido' | 'respondido',
  concluido?: boolean, respondido_por?, resposta?,
  created_at, updated_at
}
```

### Database Schema Evolution
The database has undergone significant improvements:
- **Location fields**: Migrated from single `localizacao` to separate `cidade`, `estado`, `bairro`, `cep` fields
- **Social media**: Added `instagram_url`, `facebook_url`, `whatsapp` fields
- **Enhanced metadata**: Added `status`, `tags`, `video_url`, team contact fields
- **Backwards compatibility**: Old `localizacao` field still supported for data migration

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
getCasoById(id)             // Single case with full details
createCase(caseData)        // Create new case
updateCaso(id, updates)     // Update existing case (with detailed logging)
uploadCaseImage(file)       // Upload case cover image to storage

// Messages System
createContactMessage(data)   // Create new contact message (public access)
getAllMessages()            // Get all messages (extensionistas only)
updateMessageStatus(id, status, userId?, resposta?) // Update message status
toggleMessageComplete(id, concluido, userId) // Mark message as completed/incomplete
getUnreadMessagesCount()    // Count pending messages for badge counter
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
├── services/
│   ├── supabase.ts                # Database operations & avatar storage
│   ├── demoInterceptor.ts         # Demo mode simulation layer
│   └── demoData.ts                # Mock data for demo mode
├── types/index.ts                 # TypeScript interfaces
├── utils/
│   ├── constants.ts               # Routes, categories, user types  
│   └── formatters.ts              # Phone number formatting utilities
└── sql/
    └── fix-messages-flow.sql      # Complete database setup script
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
- Brand name: **Designário** (color: `#002f42`)
- Subtitle: **Observatório de Inovação Social** (background: `#ff6b6b`, white text)
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
- `updateCaso()` includes extensive debugging logging with existence checks before updates
- Extensive logging helps diagnose query timing issues

### RLS Policy Issues
- **Admin case editing**: Ensure RLS policies check `is_admin` flag, not deprecated `tipo='admin'`
- **Policy example**: `(auth.uid() = extensionista_id OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND is_admin = true))`
- **Data integrity**: Use dedicated SQL scripts for bulk operations to avoid RLS conflicts

### Storage Permissions
- Avatar bucket needs policies for user file upload/update
- Case image bucket (`case-images`) for cover photo uploads
- File paths use user ID for security: `avatars/{userId}-{timestamp}.ext`

### CEP Integration & Location Data
- **ViaCEP API**: Automatic address lookup when CEP is entered (8-digit format only)
- **Form mapping**: Handles both new location fields (cidade/estado/bairro) and legacy `localizacao`
- **Required fields**: `cidade` field is mandatory for case publication (enables Publish button)
- **CORS considerations**: ViaCEP works in development and production environments

## Page Structure & Components

### Main Pages
- **Home** (`src/pages/Home.tsx`): Hero section with Rio de Janeiro background image, stats, and bento box case layout
- **Dashboard** (`src/pages/Dashboard.tsx`): Extensionist control center with colored shortcut cards for main functions
- **Cases** (`src/pages/Casos.tsx`): Enhanced case listing with visual category filters and pagination
- **Categories** (`src/pages/Categorias.tsx`): Category overview with recent cases and fixed action buttons
- **Case Details** (`src/pages/CasoDetalhes.tsx`): Tab-based case viewing with interactive map
- **About** (`src/pages/Sobre.tsx`): Project information, methodology, and institutional details based on academic documentation
- **Login** (`src/pages/Login.tsx`): Authentication with new Designário branding

### Admin Pages
- **Case Management** (`src/pages/admin/CaseManagement.tsx`): Full CRUD with icon-based actions
- **Case Editor** (`src/pages/admin/CaseEditor.tsx`): Tab-based form with CEP integration, social media fields, and comprehensive validation
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
2. **System sends password reset email** via Supabase Auth
3. **User receives email** with secure reset link
4. **User clicks link** → redirected to password reset page
5. **Emergency Setup**: `/emergency-setup` creates root admin if access issues occur

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

### Server Configuration
- **Development server**: Vite configured for `localhost:3000` with CORS enabled (differs from default Vite port 5173)
- **Host configuration**: `host: true` allows external connections
- **Port fallback**: If port 3000 is occupied, Vite will automatically use next available port
- **Production vs Development**: README mentions port 5173 but `vite.config.ts` explicitly sets port 3000

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

### Database Maintenance Scripts
- **fix-messages-flow.sql**: Complete messages system setup with RLS policies and field validation
- **check-table-structure.sql**: Verify database schema and data integrity
- **fix-missing-cidade.sql**: Fix cases with empty cidade field (enables Publish button)
- **cleanup-duplicated-cases.sql**: Remove duplicate cases and maintain data consistency
- **01-adicionar-campos-completos.sql**: Database schema migration script
- **02-popular-casos-completos.sql**: Populate database with 15 complete example cases
- **03-fix-rls-policies.sql**: Update RLS policies for proper admin access

## Production Information

### URLs
- **Application**: https://observatorio-is-rj.netlify.app
- **Emergency Setup**: https://observatorio-is-rj.netlify.app/emergency-setup
- **Login**: https://observatorio-is-rj.netlify.app/login

### Deployment
- **Platform**: Netlify
- **Auto-deploy**: Pushes to `main` branch trigger automatic deployment
- **Environment Variables**: Configured in Netlify dashboard (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

## User Creation Guide

### Manual User Creation (Supabase Dashboard)
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Invite User" button
3. Enter user email
4. User receives email with setup link
5. Add user to `usuarios` table with appropriate `tipo` and permissions

### Admin-Created Users (In-App)
1. Admin navigates to `/admin/usuarios`
2. Click "Novo Usuário" button
3. Fill in user details
4. Choose password option:
   - Default password (12345678) with forced change
   - Custom password
5. User logs in and changes password if required

### Emergency Root User Recovery
1. Navigate to `/emergency-setup`
2. Create root user with email and password
3. User automatically has `is_admin: true` and `is_root: true`
4. Use only when no admin access available

## Dashboard System

### Extensionist Control Center
- **Route**: `/dashboard` - Protected route for authenticated users only
- **Purpose**: Central hub for extensionists and administrators to access main functions
- **Access**: "Área do Extensionista" button on Home page redirects here

### Dashboard Features
- **Personalized greeting** with first name extraction
- **Grid layout**: Responsive 3-column grid on desktop, adaptive on mobile
- **Color-coded cards** with consistent hover effects and animations
- **Real-time notifications** for unread messages with badge counter
- **Role-based visibility**: Admin-only cards (User Management) shown conditionally

### Available Shortcuts
1. **📊 Gerenciar Casos** (Blue) → `/admin/casos` - Case CRUD operations
2. **👥 Gerenciar Usuários** (Purple, Admin only) → `/admin/usuarios` - User management
3. **📬 Mensagens** (Green) → `/mensagens` - Contact messages with unread counter
4. **👤 Meu Perfil** (Orange) → `/perfil` - Personal profile settings
5. **🗺️ Ver Mapa** (Teal) → `/mapa` - Interactive case map
6. **🚪 Sair** (Red) - Logout functionality

### Implementation Notes
- Cards use Tailwind color system with hover effects (`hover:scale-105`)
- Unread message count updates every 30 seconds via `setInterval`
- User type badge shown at bottom (Demo, Extensionista, Admin, etc.)
- Automatic navigation handling for non-authenticated users

## Data Consistency & Statistics

### Cross-Page Data Synchronization
All pages showing case counts must display consistent numbers from the database:

### Home Page Statistics
- **All cases count**: Uses `allCasos.length` for accurate total count
- **Visual limitation**: Only shows 6 most recent cases in card display
- **Separation**: `casos` (6 items for display) vs `allCasos` (all items for stats)

### Categories Page Statistics  
- **Global numbers**: Uses all cases from database for header statistics
- **Category filtering**: Only cases with valid categories for category-specific stats
- **Validation**: Filters out NULL, empty, or invalid category names

### Cases Page Consistency
- **Filter**: Shows only active cases where `status_ativo = true`
- **Count alignment**: Should match Home and Categories total counts

### Statistical Accuracy
```typescript
// Home page: separate data for display vs statistics
const [casos, setCasos] = useState<CasoInovacao[]>([]); // For display (limited)
const [allCasos, setAllCasos] = useState<CasoInovacao[]>([]); // For statistics (all)

// Categories page: all cases for global stats, filtered for categories
const casosStats = {
  total: allCasos.length, // Use all cases for accuracy
  categorias: new Set(allCasos.map(caso => caso.categoria)).size,
  extensionistas: new Set(allCasos.map(caso => caso.extensionista_id)).size,
};
```

## Messages System

### Contact Message Flow
- **Public Access**: Visitors can submit messages via `/contato` form (no authentication required)
- **Extensionist Access**: All extensionistas can view and manage messages via `/mensagens`
- **Status Management**: Messages progress through: `pendente` → `lido` → `respondido`
- **Task Completion**: Additional `concluido` boolean flag for workflow tracking

### Message Management Interface
- **Filtering**: View all, pending, read, or responded messages
- **Status Controls**: 
  - 📖 Mark as Read (pendente → lida)
  - ⏳ Mark as Pending (lida → pendente)
  - ✅ Mark as Completed (adds completion flag)
  - ❌ Mark as Incomplete (removes completion flag)
- **Real-time Updates**: Message counts update automatically in Dashboard badge
- **Visual Indicators**: Color-coded status badges and completion indicators

### RLS Policies for Messages
```sql
-- Visitors can create messages (public form access)
CREATE POLICY "Visitantes podem criar mensagens" ON mensagens_contato FOR INSERT 
TO anon, authenticated WITH CHECK (true);

-- Extensionistas can read all messages  
CREATE POLICY "Extensionistas podem ler todas mensagens" ON mensagens_contato FOR SELECT
TO authenticated USING (EXISTS (
  SELECT 1 FROM usuarios WHERE usuarios.id::uuid = auth.uid() 
  AND (usuarios.tipo IN ('extensionista', 'pesquisador', 'coordenador') OR usuarios.is_admin = true)
));

-- Extensionistas can update message status
CREATE POLICY "Extensionistas podem atualizar mensagens" ON mensagens_contato FOR UPDATE
TO authenticated USING (/* same conditions as SELECT */);
```

## Phone Number Formatting System

### Automatic Phone Masking
- **Format**: `(99) 9999-9999` for landlines, `(99) 99999-9999` for mobile
- **Real-time**: Applies formatting as user types
- **Limit**: Automatically caps at 11 digits (Brazilian standard)
- **Applied to**: All phone input fields across the application

### Formatting Utilities (`src/utils/formatters.ts`)
```typescript
formatTelefone(value: string)    // Apply mask (99) 99999-9999
cleanTelefone(value: string)     // Remove all non-digits  
isValidTelefone(value: string)   // Validate 10-11 digit format
```

### Forms with Phone Formatting
- **Contact Form** (`/contato`): Visitor phone input
- **User Profile** (`/perfil`): Personal phone editing
- **Admin User Management** (`/admin/usuarios`): User phone field
- **Case Editor** (`/admin/casos/editar`): Contact team phone (`contato_telefone`)

### Implementation Pattern
```typescript
const handleInputChange = (e) => {
  const { name, value } = e.target;
  let processedValue = value;
  if (name === 'telefone' || name === 'contato_telefone') {
    processedValue = formatTelefone(value);
  }
  setFormData(prev => ({ ...prev, [name]: processedValue }));
};
```