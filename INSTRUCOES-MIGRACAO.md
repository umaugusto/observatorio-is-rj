# Instruções de Migração - Sistema de Autenticação Refatorado

## Passo a Passo para Aplicar as Mudanças

### 1. Execute a Migração SQL no Supabase

Acesse o **SQL Editor** no painel do Supabase e execute o script de migração localizado em:
```
migrations/add_admin_flags.sql
```

Este script irá:
- Adicionar as colunas `is_admin` e `is_root` na tabela `usuarios`
- Migrar usuários existentes com tipo 'admin' para ter `is_admin = true`
- Atualizar o tipo desses usuários para 'extensionista' mantendo permissões admin
- Criar índices para otimização

### 2. Remova a Service Role Key do Frontend

**IMPORTANTE**: O sistema não usa mais `supabase.auth.admin.createUser()` no frontend. 
Isso é mais seguro pois não expõe a Service Role Key.

Para criar usuários agora, use:
- Interface de gestão de usuários no path `/admin/usuarios`
- API Functions do Supabase (se configuradas)
- Dashboard do Supabase diretamente

### 3. Teste o Novo Fluxo de Autenticação

#### Criando o Usuário Root (se necessário)
1. Acesse `/emergency-setup`
2. Clique em "Criar Usuário Root"
3. Faça login com as credenciais fornecidas
4. Altere a senha quando solicitado

#### Testando Criação de Usuários
1. Faça login como usuário com `is_admin = true`
2. Acesse "Gerenciar Usuários" no menu
3. Clique em "Novo Usuário"
4. Teste as duas opções:
   - **Senha Padrão**: Cria com senha 12345678 e força troca
   - **Senha Personalizada**: Define senha específica

### 4. Estrutura do Novo Sistema

#### Tipos de Usuário vs Permissões
- **Tipos**: `extensionista`, `pesquisador`, `coordenador`, `demo`
- **Permissões**: `is_admin` (gestão do sistema), `is_root` (usuário principal)

#### Fluxo de Senha
1. Admin cria usuário com senha (padrão ou customizada)
2. Se `must_change_password = true`, usuário é forçado a trocar no primeiro login
3. `PasswordChangeGuard` intercepta e redireciona para `/change-password`
4. Após troca, usuário acessa normalmente

### 5. Funcionalidades Principais

#### Gestão de Usuários Melhorada
- Campo para definir senha customizada ao criar usuário
- Checkbox opcional "Forçar troca no primeiro login"
- Visualização clara de permissões (tipo + admin + root)
- Reset de senha para padrão com um clique

#### Segurança Aprimorada
- Sem Service Role Key no frontend
- Whitelist de usuários (sem criação automática)
- Senhas customizadas não podem ser iguais à padrão
- Validação de senha mínima (8 caracteres)

### 6. Checklist de Verificação

- [ ] Migração SQL executada com sucesso
- [ ] Usuário root criado e funcionando
- [ ] Login com senha padrão + troca obrigatória funcionando
- [ ] Criação de usuário com senha customizada funcionando
- [ ] Permissões admin sendo respeitadas
- [ ] Menu admin aparece apenas para is_admin = true
- [ ] Reset de senha funcionando

### 7. Rollback (se necessário)

Para reverter as mudanças no banco:
```sql
-- Remover novas colunas
ALTER TABLE usuarios 
DROP COLUMN IF EXISTS is_admin,
DROP COLUMN IF EXISTS is_root;

-- Restaurar tipo 'admin' para usuários administrativos
-- (necessário identificar manualmente quais eram admin)
```

### 8. Notas Importantes

- **Usuários existentes**: Continuam funcionando normalmente
- **Sessões ativas**: Não são afetadas pela migração
- **Compatibilidade**: Sistema mantém compatibilidade com dados existentes
- **Demo mode**: Continua funcionando independentemente

## Suporte

Em caso de problemas:
1. Verifique os logs do console do navegador
2. Confirme que a migração SQL foi executada
3. Use `/emergency-setup` para criar usuário root se necessário
4. Verifique as políticas RLS no Supabase