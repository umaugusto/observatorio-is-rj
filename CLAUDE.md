# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Observatório de Inovação Social do Rio de Janeiro - plataforma para catalogar casos de inovação social por extensionistas universitários.

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Supabase + Netlify

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
- User types: `admin` | `extensionista` (stored in `usuarios.tipo`)
- Auth context in `src/hooks/useAuth.tsx` wraps entire app
- Login redirects handled automatically via `useAuth()` state

### Core Data Models
```typescript
// src/types/index.ts
User: { id, email, nome, tipo, instituicao, ativo }
CasoInovacao: { id, titulo, descricao, categoria, extensionista_id, status_ativo }
```

### Key Service Functions
```typescript
// src/services/supabase.ts
getCasos()                    // All active cases with extensionista join
getCasosByCategory(categoria) // Filtered by category
getUser(userId)               // User profile (with 10s timeout)
getOrCreateUser(authUser)     // Auto-create user if missing
```

### Database Setup
- **Setup Script**: `src/scripts/setup-database.sql` (run in Supabase SQL Editor)
- **Verification**: `src/services/database-setup.ts` checks table existence
- **Tables**: usuarios, casos_inovacao, caso_imagens, caso_parceiros, caso_metricas
- **RLS**: Row Level Security policies configured per table

## File Structure

```
src/
├── components/
│   ├── setup/DatabaseSetup.tsx    # First-time database setup UI
│   ├── casos/CaseCard.tsx         # Case display component
│   └── common/                    # Header, Footer, Loading, etc
├── pages/                         # Route components
├── hooks/useAuth.tsx              # Authentication context & state
├── services/
│   ├── supabase.ts               # Database operations
│   └── database-setup.ts         # Setup verification functions
├── types/index.ts                # TypeScript interfaces
└── utils/constants.ts            # Routes, categories, user types
```

## Development Patterns

### Error Handling
- Always wrap Supabase calls in try/catch
- Use timeout promises for queries that may hang
- Show user-friendly error messages in UI
- Log detailed errors with context for debugging

### State Management
- Authentication state via React Context (`useAuth`)
- Component-level state with `useState` for forms
- No external state management library

### Styling Standards
- Tailwind CSS only - no custom CSS
- Custom classes: `container-custom`, `btn-primary`, `btn-secondary`, `card`
- Mobile-first responsive design
- Color scheme: `primary-*` (blue), `gray-*`, `red-*`, `green-*`

## Known Issues & Debugging

### Supabase Connection Issues
- `getUser()` queries may timeout due to network/RLS issues
- Added 10-second timeout with detailed logging
- Check Network tab in DevTools for hanging requests
- Fallback: disable RLS temporarily if needed

### Authentication Debug
- Extensive console logging in auth flow (search for 🔍, ✅, ❌ emojis)
- Login state handled in Login.tsx component
- Session persistence managed by Supabase Auth automatically