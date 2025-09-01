# 👥 GUIA COMPLETO - Cadastro de Usuários com Senha Padrão

## 🎯 Sistema Implementado
Sistema que força usuários a trocar senha padrão no primeiro acesso.

---

## 📋 USUÁRIOS PARA CADASTRAR (TODOS ADMIN)
- `weslie.lospennato@ufrj.br`
- `claudia.amaral@adc.coppe.ufrj.br` 
- `ivansssilveira@ufrj.br`
- `souza.c.marcia@ufrj.br`

**Senha padrão**: `12345678`

---

## 🚀 PASSO A PASSO PARA IMPLEMENTAÇÃO

### **ETAPA 1: Criar Usuários no Supabase Auth**
1. Acesse https://supabase.com/dashboard
2. Vá em **Authentication** → **Users**
3. Clique **Add user**
4. Para cada usuário:
   - **Email**: (email do usuário)
   - **Password**: `12345678`
   - **Auto Confirm**: ✅ Marcar
   - Clique **Create user**

### **ETAPA 2: Executar Script SQL**
1. No Supabase, vá em **SQL Editor**
2. **PRIMEIRO**, execute para adicionar coluna:
```sql
ALTER TABLE usuarios ADD COLUMN must_change_password BOOLEAN DEFAULT false;
```

3. **DEPOIS**, para cada usuário criado:
   - Copie o **ID** do usuário em Authentication → Users
   - Execute no SQL Editor:
```sql
INSERT INTO usuarios (
    id, 
    email, 
    nome, 
    tipo, 
    ativo,
    must_change_password,
    created_at,
    updated_at
) 
VALUES (
    'ID_COPIADO_DO_SUPABASE_AUTH',
    'EMAIL_DO_USUARIO',
    'NOME_DO_USUARIO',
    'admin',
    true,
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET 
    tipo = 'admin',
    ativo = true,
    must_change_password = true,
    updated_at = now();
```

---

## 🔄 FLUXO DO SISTEMA

### **Primeiro Acesso do Usuário:**
1. **Login com senha padrão** (`12345678`)
2. **Sistema detecta** `must_change_password = true`
3. **Redireciona automaticamente** para `/change-password`
4. **Usuário obrigado** a criar senha personalizada
5. **Após trocar senha**, `must_change_password = false`
6. **Acesso liberado** para todas as funcionalidades

### **Validações Implementadas:**
- ❌ **Não pode usar senha padrão** `12345678`
- ✅ **Mínimo 8 caracteres**
- ✅ **Confirmação obrigatória**
- ✅ **Atualização automática** no banco

---

## 📁 ARQUIVOS CRIADOS/MODIFICADOS

### **Novos Arquivos:**
- `/src/pages/ChangePassword.tsx` - Tela de troca de senha
- `/src/components/auth/PasswordChangeGuard.tsx` - Interceptor
- `/create-admin-users.sql` - Script completo

### **Modificados:**
- `/src/types/index.ts` - Adicionado `must_change_password`
- `/src/App.tsx` - Rota `/change-password` + PasswordChangeGuard
- *(Build testado e funcionando)*

---

## 🎯 RESULTADO FINAL

### **Para Você (Root):**
- ✅ **Acesso total** como sempre

### **Para Novos Usuários:**
1. **Recebem email/credenciais**: `email` + `12345678`
2. **Primeiro login**: Forçados a trocar senha
3. **Após trocar**: Acesso completo como admin
4. **Segurança**: Não podem usar senha padrão

---

## ⚡ PARA ATIVAR AGORA

1. **Execute os comandos SQL** no Supabase
2. **Faça git commit** das alterações
3. **Deploy para produção**
4. **Teste** com um dos usuários criados

**Tudo pronto para uso! 🎉**