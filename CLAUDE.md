- 🎯 Objetivo
Criar um observatório digital para catalogar, visualizar e promover casos de inovação social no Rio de Janeiro, conectando extensionistas universitários com iniciativas de impacto social.
- 🏗 Arquitetura Técnica

Frontend: React (via Claude Code)
Backend/Database: Supabase
Autenticação: Supabase Auth
Deploy: Netlify
Desenvolvimento: VS Code + Claude Code
Controle: Git + GitHub
- 👥 Usuários do Sistema

Admin: Usuário root que gerencia extensionistas
Extensionistas: Cadastram e gerenciam casos de inovação social
Visitantes: Consultam casos publicamente (sem login)

# Configurações do Projeto - Observatório de Inovação Social RJ

## 🔐 **Credenciais Supabase**

### **Project URL**
```
https://vpdtoxesovtplyowquyh.supabase.co
```

### **Anon Key** (para frontend)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZHRveGVzb3Z0cGx5b3dxdXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2ODk4ODgsImV4cCI6MjA3MjI2NTg4OH0.88ILT7YBuC492W8l0A77N6Qi9YrdgfY8zyAPz0M9ynI
```

### **Service Role Key** (apenas servidor - não expor)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZHRveGVzb3Z0cGx5b3dxdXloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY4OTg4OCwiZXhwIjoyMDcyMjY1ODg4fQ.TSNfIPtJT_w1PSoajuO3CtgmVCdXmj1wuoLQWQB4CMc
```

## 🌐 **Deploy**

### **Netlify Site**
```
https://observatorio-is-rj.netlify.app
```

## 📝 **Variáveis de Ambiente (.env.local)**
```env
REACT_APP_SUPABASE_URL=https://vpdtoxesovtplyowquyh.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZHRveGVzb3Z0cGx5b3dxdXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2ODk4ODgsImV4cCI6MjA3MjI2NTg4OH0.88ILT7YBuC492W8l0A77N6Qi9YrdgfY8zyAPz0M9ynI
```

## ⚠️ **Segurança**
- **Anon Key**: Pode ser exposta no frontend
- **Service Key**: NUNCA expor no frontend ou commits públicos
- **Arquivo .env.local**: Adicionar no .gitignore

## 🎯 **Status do Projeto**
- ✅ Supabase configurado
- ✅ Netlify conectado
- ⏳ Aguardando criação do projeto React
- ⏳ Aguardando primeiro deploy

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