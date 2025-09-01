-- Migração para adicionar flags is_admin e is_root à tabela usuarios
-- Execute este SQL no Supabase SQL Editor

-- Adicionar colunas is_admin e is_root
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_root BOOLEAN DEFAULT FALSE;

-- Migrar usuários existentes com tipo 'admin' para ter is_admin = true
UPDATE usuarios
SET is_admin = TRUE
WHERE tipo = 'admin';

-- Agora podemos remover 'admin' como tipo válido e manter apenas os tipos de usuário
-- Primeiro, atualizar usuários com tipo 'admin' para 'extensionista' mantendo is_admin
UPDATE usuarios
SET tipo = 'extensionista'
WHERE tipo = 'admin';

-- Comentário: No frontend, removeremos 'admin' como opção de tipo
-- e usaremos is_admin para controle de permissões

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_is_admin ON usuarios(is_admin);
CREATE INDEX IF NOT EXISTS idx_usuarios_is_root ON usuarios(is_root);

-- Adicionar comentários às colunas para documentação
COMMENT ON COLUMN usuarios.is_admin IS 'Indica se o usuário tem permissões administrativas';
COMMENT ON COLUMN usuarios.is_root IS 'Indica se o usuário é o root do sistema (criado pelo emergency setup)';
COMMENT ON COLUMN usuarios.tipo IS 'Tipo de usuário: extensionista, pesquisador, coordenador ou demo';