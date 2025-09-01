-- ===============================================
-- 👑 SCRIPT PARA CRIAR USUÁRIO ROOT (ADMIN)
-- ===============================================
-- Execute este script no Supabase SQL Editor

-- IMPORTANTE: Substitua o ID pelo ID real do seu usuário Supabase Auth
-- Para encontrar o ID: vá em Authentication > Users no painel Supabase

-- 1. VERIFICAR SE JÁ EXISTE
-- ===============================================
SELECT id, email, nome, tipo, ativo 
FROM usuarios 
WHERE email = 'antonio.aas@ufrj.br';

-- 2. CRIAR USUÁRIO ROOT MANUALMENTE
-- ===============================================
-- ATENÇÃO: Substitua 'SEU_USER_ID_AQUI' pelo ID real do Supabase Auth

INSERT INTO usuarios (
    id, 
    email, 
    nome, 
    tipo, 
    ativo,
    created_at,
    updated_at
) 
VALUES (
    '8f023f8e-81c2-4135-9d6a-f2a8e35ddf81', -- ID do Supabase Auth
    'antonio.aas@ufrj.br',
    'Antonio (Root)',
    'admin',
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET 
    tipo = 'admin',
    nome = 'Antonio (Root)',
    ativo = true,
    updated_at = now();

-- 3. CONFIRMAR CRIAÇÃO
-- ===============================================
SELECT id, email, nome, tipo, ativo, created_at 
FROM usuarios 
WHERE email = 'antonio.aas@ufrj.br';

-- RESULTADO ESPERADO: 
-- - Usuário criado com tipo 'admin'
-- - Ativo = true