# Observatório de Inovação Social - Rio de Janeiro

## 🎯 Sobre o Projeto

O Observatório de Inovação Social do Rio de Janeiro é uma plataforma digital para catalogar, visualizar e promover casos de inovação social no estado, conectando extensionistas universitários com iniciativas de impacto social.

## 🏗 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Backend**: Supabase (Database + Auth)
- **Roteamento**: React Router DOM
- **Deploy**: Netlify

## 🚀 Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   - O arquivo `.env.local` já está configurado com as credenciais do Supabase

3. **Executar em modo de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acessar aplicação**:
   - Abra http://localhost:5173 no seu navegador

## 📱 Estrutura do Projeto

```
src/
├── components/
│   ├── common/          # Header, Footer, Loading
│   ├── auth/            # Login, Register  
│   └── casos/           # Card, List, Form
├── pages/
│   ├── Home.tsx         # Página inicial
│   ├── Casos.tsx        # Listagem de casos
│   └── Login.tsx        # Página de login
├── services/
│   └── supabase.ts      # Configuração Supabase
├── hooks/
│   └── useAuth.tsx      # Hook de autenticação
└── utils/
    └── constants.ts     # Constantes do projeto
```

## 👥 Tipos de Usuário

- **Visitantes**: Podem visualizar casos publicamente
- **Extensionistas**: Podem cadastrar e gerenciar casos
- **Admin**: Gerencia extensionistas e sistema

## 🌐 Deploy

O projeto está configurado para deploy automático no Netlify:
- **URL**: https://observatorio-is-rj.netlify.app

## 📊 Status Atual

- ✅ Estrutura base do React configurada
- ✅ Integração com Supabase implementada
- ✅ Sistema de autenticação funcional
- ✅ Páginas principais criadas
- ✅ Responsividade implementada
- ⏳ Aguardando dados no Supabase para testes completos

## 🔧 Comandos Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
npm run lint     # Linting do código
```