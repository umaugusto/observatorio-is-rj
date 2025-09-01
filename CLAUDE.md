# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Observatório de Inovação Social do Rio de Janeiro (Social Innovation Observatory of Rio de Janeiro) is a digital platform for cataloging, visualizing, and promoting social innovation cases in Rio de Janeiro state. It connects university extension workers with social impact initiatives.

**Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Supabase + Netlify

**User Roles**:
- **Visitors**: Public access to browse cases
- **Extensionistas**: University extension workers who can manage their own cases  
- **Admins**: System administrators who manage users and all cases

## Development Commands

```bash
# Development
npm install                 # Install dependencies
npm run dev                # Start development server (Vite)
npm run build              # Production build (TypeScript check + Vite build)
npm run preview            # Preview production build
npm run lint               # ESLint check

# Environment
# .env.local file is already configured with Supabase credentials
# Uses VITE_ prefix for environment variables
```

## Architecture & Key Patterns

### Authentication & Data Flow
- **Authentication**: Supabase Auth with custom user profiles in `usuarios` table
- **Data Layer**: All Supabase operations centralized in `src/services/supabase.ts`
- **Auth Context**: `src/hooks/useAuth.tsx` provides `AuthProvider` and `useAuth()` hook
- **User Types**: Enforced through `tipo` field ('admin' | 'extensionista') with role-based access

### Database Schema (Supabase)
```sql
-- Core tables (need to be created in Supabase)
usuarios: id, email, nome, tipo, data_criacao
casos_inovacao: id, titulo, descricao, localizacao, categoria, extensionista_id, 
                imagem_url, coordenadas_mapa, data_cadastro, status_ativo
```

### Component Architecture
```
src/
├── components/
│   ├── common/              # Shared UI (Header, Footer, Loading)
│   ├── auth/                # Authentication components
│   └── casos/               # Case-specific components (CaseCard)
├── pages/                   # Route components (Home, Casos, Login)
├── hooks/useAuth.tsx        # Authentication context & hook
├── services/supabase.ts     # Database operations & Supabase client
├── types/index.ts           # TypeScript interfaces
└── utils/constants.ts       # App constants (routes, categories)
```

### Styling System
- **Framework**: Tailwind CSS with custom configuration
- **Custom Classes**: `container-custom`, `btn-primary`, `btn-secondary`, `card`
- **Color Palette**: `primary-*`, `gray-*`, `red-*`, `green-*` scales
- **Responsive**: Mobile-first approach (base → sm: → md: → lg:)
- **Typography**: Inter font family loaded via Google Fonts

### Key Service Functions
```typescript
// src/services/supabase.ts
getCasos()                    // Fetch all active cases with extensionista data
getCasosByCategory(categoria) // Filter cases by category
getUser(userId)               // Get user profile data

// Authentication (via useAuth hook)
signIn(email, password)       // Login
signOut()                     // Logout
```

### Routing Structure
- **Public Routes**: `/` (Home), `/casos` (Cases), `/login`
- **Protected Routes**: Authentication handled via `useAuth()` context
- **Placeholder Routes**: `/categorias`, `/mapa`, `/sobre`, `/contato` (show placeholder page)
- **SPA Routing**: React Router with catch-all redirect configured in `netlify.toml`

## Environment Configuration

**Development**: 
- Variables in `.env.local` (already configured)
- Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Production**: 
- Environment variables configured in `netlify.toml`
- Automatic deploy on push to main branch
- Build command: `npm run build`, Publish directory: `dist`

## Development Guidelines

### TypeScript Requirements
- Always use `.tsx` extensions for React components
- Strict TypeScript configuration with `noUnusedLocals` and `noUnusedParameters`
- All props must be typed with interfaces
- Use existing interfaces in `src/types/index.ts`

### Component Standards  
- Functional components only with hooks
- One component per file with default export
- Import order: types first, then React, libraries, then local imports
- Error boundaries and loading states for async operations

### Supabase Integration
- Row Level Security (RLS) should be configured on database tables
- Always handle Supabase errors appropriately
- Use `supabase.auth` for authentication, custom `usuarios` table for profiles
- Never expose service_role key in frontend code

### Code Quality
- ESLint must pass with zero warnings for production builds  
- TypeScript compilation must succeed
- Follow existing naming conventions and file structure
- Use existing Tailwind utility classes rather than custom CSS


# 📋 Instruções Gerais - Observatório de Inovação Social RJ

## 🎯 **CONTEXTO DO PROJETO**
Este é o **Observatório de Inovação Social do Rio de Janeiro** - uma plataforma para catalogar casos de inovação social por extensionistas universitários. Stack: React + TypeScript + Supabase + Tailwind CSS.

## ⚙️ **PADRÕES OBRIGATÓRIOS**

### **Estrutura de Código**
- **SEMPRE usar TypeScript** - nunca .jsx, sempre .tsx
- **Functional components** com hooks (nunca class components)
- **Imports organizados**: tipos primeiro, depois React, depois libraries, depois locais
- **Props tipadas** sempre - criar interfaces quando necessário
- **Error handling** em todas as operações async (try/catch)

### **Estilização com Tailwind**
- **Mobile-first**: sempre começar com classe base, depois sm:, md:, lg:
- **Consistência de cores**: usar apenas primary-X, gray-X, red-X, green-X
- **Classes customizadas** já definidas: `container-custom`, `btn-primary`, `btn-secondary`
- **NUNCA criar CSS customizado** - resolver tudo com Tailwind

### **Integração Supabase**
- **Variáveis ambiente**: sempre usar `VITE_` prefix
- **Funções de serviço**: colocar em `src/services/supabase.ts`
- **RLS (Row Level Security)**: considerrar sempre nas queries
- **Error handling** específico para Supabase errors

### **Componentes e Arquitetura**
- **Um componente por arquivo** - export default sempre
- **Nomes descritivos**: `UserManagementPanel`, não `Panel`
- **Responsabilidade única**: cada componente faz uma coisa bem feita
- **Reutilização**: criar componentes genéricos quando possível

## 🔒 **REGRAS DE SEGURANÇA**

### **Autenticação**
- **SEMPRE verificar** se user está logado antes de mostrar conteúdo restrito
- **Verificar tipo de usuário**: admin vs extensionista
- **Loading states** durante verificação de auth
- **Redirect automático** quando não autorizado

### **Dados Sensíveis**
- **NUNCA usar service_role key** no frontend
- **SOMENTE anon key** nas variáveis de ambiente
- **Validação server-side** via RLS do Supabase

## 📱 **UX/UI OBRIGATÓRIAS**

### **Estados de Interface**
- **Loading**: spinner ou skeleton durante carregamento
- **Error**: mensagem clara e botão para retry
- **Empty state**: quando não há dados, mostrar mensagem amigável
- **Success**: feedback visual após ações importantes

### **Responsividade**
- **Header**: menu hamburger no mobile
- **Grids**: 1 col mobile → 2-3 cols tablet → 3-4 cols desktop  
- **Formulários**: stack vertical mobile → horizontal desktop
- **Botões**: full-width mobile quando apropriado

### **Acessibilidade**
- **Alt text** em todas as imagens
- **Aria-labels** em botões de ação
- **Focus visible** em elementos interativos
- **Contraste** adequado sempre

## 🎨 **DESIGN SYSTEM**

### **Cores Primárias**
```css
primary-50 → primary-900 (azul institucional)
gray-50 → gray-900 (neutros)
red-50 → red-900 (erros)
green-50 → green-900 (sucesso)
```

### **Tipografia**
```css
text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
font-normal, font-medium, font-semibold, font-bold
```

### **Espaçamentos**
```css
Interno: p-2, p-4, p-6, p-8
Externo: m-2, m-4, m-6, m-8
Gap: gap-2, gap-4, gap-6, gap-8
```

## 🔄 **FLUXOS CRÍTICOS**

### **Para Admins**
- Login → Dashboard Admin → Gestão Usuários → Gestão Casos
- CRUD completo de extensionistas
- Visualização de todas as métricas

### **Para Extensionistas**  
- Login → Dashboard Extensionista → Meus Casos
- CRUD apenas dos próprios casos
- Visualização de estatísticas básicas

### **Para Visitantes**
- Homepage → Casos → Filtros/Busca → Detalhes
- Páginas públicas sem necessidade de login

## ⚡ **PERFORMANCE**

### **Otimizações Obrigatórias**
- **Lazy loading** de imagens
- **Pagination** em listas grandes (>20 items)
- **React.memo** em componentes que re-renderizam muito
- **useCallback/useMemo** quando apropriado

### **SEO Básico**
- **Títulos descritivos** nas páginas
- **Meta descriptions** quando relevante  
- **URLs semânticas** sempre

## 🐛 **DEBUG & MANUTENÇÃO**

### **Console**
- **SEMPRE usar** console.error para erros
- **Remover** console.log em produção
- **Logs estruturados** com contexto

### **Comentários**
- **Lógica complexa**: comentar o "por quê", não o "o quê"
- **TODOs**: format `// TODO: descrição específica`
- **APIs externas**: documentar parâmetros esperados

## 🚀 **DEPLOY & BUILD**

### **Variáveis Ambiente**
- **Desenvolvimento**: `.env.local`
- **Produção**: Netlify environment variables
- **NUNCA commitar** arquivos .env

### **Build Process**
- **TypeScript check** deve passar sempre
- **ESLint warnings** devem ser zero
- **Build size** consciente - não importar libraries desnecessárias

---

## 🎯 **LEMBRE-SE**
**Princípio**: Funcionalidade > Beleza > Performance
Melhor um componente simples que funciona do que um complexo que quebra.