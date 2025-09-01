-- ===============================================
-- 🚨 SCRIPT DE DIAGNÓSTICO E CORREÇÃO - TABELA USUARIOS
-- ===============================================
-- Execute este script no Supabase SQL Editor se houver problemas

-- 1. DIAGNÓSTICO DA TABELA USUARIOS
-- ===============================================
-- Verificar se a tabela existe
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- Verificar duplicatas por ID
SELECT id, COUNT(*) as count 
FROM usuarios 
GROUP BY id 
HAVING COUNT(*) > 1;

-- Verificar duplicatas por email
SELECT email, COUNT(*) as count 
FROM usuarios 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Ver estrutura da tabela
\d usuarios;

-- 2. LIMPAR DUPLICATAS (SE NECESSÁRIO)
-- ===============================================
-- ATENÇÃO: Execute apenas se encontrar duplicatas!

-- Backup dos dados duplicados (opcional)
-- CREATE TABLE usuarios_backup AS SELECT * FROM usuarios;

-- Remover duplicatas mantendo o registro mais recente
DELETE FROM usuarios a USING (
    SELECT MIN(ctid) as ctid, id
    FROM usuarios 
    GROUP BY id HAVING COUNT(*) > 1
) b
WHERE a.id = b.id AND a.ctid <> b.ctid;

-- 3. VERIFICAR CONSTRAINTS E ÍNDICES
-- ===============================================
-- Ver constraints existentes
SELECT conname, contype, confrelid::regclass, conkey 
FROM pg_constraint 
WHERE conrelid = 'usuarios'::regclass;

-- Criar constraint UNIQUE no ID se não existir
-- ALTER TABLE usuarios ADD CONSTRAINT usuarios_id_key UNIQUE (id);

-- Criar constraint UNIQUE no email se não existir  
-- ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_key UNIQUE (email);

-- 4. VERIFICAR RLS (ROW LEVEL SECURITY)
-- ===============================================
-- Ver se RLS está ativo
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename = 'usuarios';

-- Ver políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 5. COMANDOS DE EMERGÊNCIA
-- ===============================================
-- Se nada funcionar, recriar a tabela (CUIDADO!)
/*
-- Backup completo
CREATE TABLE usuarios_backup_emergency AS SELECT * FROM usuarios;

-- Dropar e recriar tabela
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'extensionista',
    instituicao TEXT,
    telefone TEXT,
    bio TEXT,
    avatar_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reativar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Recriar políticas básicas
CREATE POLICY "Users can read their own data" ON usuarios
    FOR SELECT USING (auth.uid() = id::uuid);

CREATE POLICY "Users can update their own data" ON usuarios
    FOR UPDATE USING (auth.uid() = id::uuid);

-- Restaurar dados
INSERT INTO usuarios SELECT * FROM usuarios_backup_emergency;
*/