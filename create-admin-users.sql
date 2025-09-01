-- ===============================================
-- 👥 SCRIPT PARA CRIAR USUÁRIOS ADMINISTRADORES
-- ===============================================
-- Execute este script no Supabase SQL Editor

-- IMPORTANTE: Execute este script em DUAS ETAPAS:
-- 1. Primeiro crie os usuários no Supabase Auth (painel web)
-- 2. Depois execute este SQL para cadastrar na tabela usuarios

-- ===============================================
-- ETAPA 1: CRIAR NO SUPABASE AUTH (PAINEL WEB)
-- ===============================================
-- Vá em Authentication > Users > Invite a user
-- Ou use Create user e adicione:
-- 
-- Email: weslie.lospennato@ufrj.br        | Senha: 12345678
-- Email: claudia.amaral@adc.coppe.ufrj.br | Senha: 12345678  
-- Email: ivansssilveira@ufrj.br           | Senha: 12345678
-- Email: souza.c.marcia@ufrj.br           | Senha: 12345678

-- ===============================================
-- ETAPA 2: ADICIONAR COLUNA PARA CONTROLE DE SENHA
-- ===============================================

-- Adicionar coluna para controlar troca de senha obrigatória
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'must_change_password') THEN
        ALTER TABLE usuarios ADD COLUMN must_change_password BOOLEAN DEFAULT false;
        RAISE NOTICE 'Coluna must_change_password adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna must_change_password já existe';
    END IF;
END $$;

-- ===============================================
-- ETAPA 3: CADASTRAR NA TABELA USUARIOS
-- ===============================================

-- IMPORTANTE: Substitua os IDs pelos IDs reais do Supabase Auth
-- Para encontrar os IDs: Authentication > Users > clique no usuário

-- Weslie Lospennato
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
    'SUBSTITUIR_PELO_ID_DO_SUPABASE_AUTH', -- ID do Supabase Auth
    'weslie.lospennato@ufrj.br',
    'Weslie Lospennato',
    'admin',
    true,
    true, -- Deve trocar senha no primeiro acesso
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET 
    tipo = 'admin',
    ativo = true,
    must_change_password = true,
    updated_at = now();

-- Claudia Amaral
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
    'SUBSTITUIR_PELO_ID_DO_SUPABASE_AUTH', -- ID do Supabase Auth
    'claudia.amaral@adc.coppe.ufrj.br',
    'Claudia Amaral',
    'admin',
    true,
    true, -- Deve trocar senha no primeiro acesso
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET 
    tipo = 'admin',
    ativo = true,
    must_change_password = true,
    updated_at = now();

-- Ivan Silveira
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
    'SUBSTITUIR_PELO_ID_DO_SUPABASE_AUTH', -- ID do Supabase Auth
    'ivansssilveira@ufrj.br',
    'Ivan Silveira',
    'admin',
    true,
    true, -- Deve trocar senha no primeiro acesso
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET 
    tipo = 'admin',
    ativo = true,
    must_change_password = true,
    updated_at = now();

-- Marcia Souza
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
    'SUBSTITUIR_PELO_ID_DO_SUPABASE_AUTH', -- ID do Supabase Auth
    'souza.c.marcia@ufrj.br',
    'Marcia Souza',
    'admin',
    true,
    true, -- Deve trocar senha no primeiro acesso
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET 
    tipo = 'admin',
    ativo = true,
    must_change_password = true,
    updated_at = now();

-- ===============================================
-- VERIFICAR CADASTRO
-- ===============================================
SELECT id, email, nome, tipo, ativo, must_change_password, created_at 
FROM usuarios 
WHERE tipo = 'admin'
ORDER BY created_at DESC;