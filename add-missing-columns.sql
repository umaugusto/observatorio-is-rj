-- ===============================================
-- 🔧 SCRIPT PARA ADICIONAR COLUNAS FALTANTES - TABELA USUARIOS
-- ===============================================
-- Execute este script no Supabase SQL Editor para adicionar colunas

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA
-- ===============================================
-- Ver todas as colunas existentes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- 2. ADICIONAR COLUNAS FALTANTES (SE NÃO EXISTIREM)
-- ===============================================

-- Adicionar coluna instituicao
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'instituicao') THEN
        ALTER TABLE usuarios ADD COLUMN instituicao TEXT;
        RAISE NOTICE 'Coluna instituicao adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna instituicao já existe';
    END IF;
END $$;

-- Adicionar coluna telefone
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'telefone') THEN
        ALTER TABLE usuarios ADD COLUMN telefone TEXT;
        RAISE NOTICE 'Coluna telefone adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna telefone já existe';
    END IF;
END $$;

-- Adicionar coluna bio
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'bio') THEN
        ALTER TABLE usuarios ADD COLUMN bio TEXT;
        RAISE NOTICE 'Coluna bio adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna bio já existe';
    END IF;
END $$;

-- Adicionar coluna avatar_url
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'avatar_url') THEN
        ALTER TABLE usuarios ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Coluna avatar_url adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna avatar_url já existe';
    END IF;
END $$;

-- 3. ATUALIZAR DADOS EXISTENTES (OPCIONAL)
-- ===============================================
-- Preencher instituicao baseado no email para usuários existentes
UPDATE usuarios 
SET instituicao = SPLIT_PART(email, '@', 2) 
WHERE instituicao IS NULL AND email LIKE '%@%';

-- 4. VERIFICAR RESULTADO
-- ===============================================
-- Ver estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- Ver alguns registros para confirmar
SELECT id, email, nome, tipo, instituicao, ativo, created_at 
FROM usuarios 
LIMIT 5;