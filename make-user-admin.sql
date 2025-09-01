-- ===============================================
-- 👑 SCRIPT PARA TORNAR USUÁRIO ADMIN
-- ===============================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR USUÁRIO ATUAL
-- ===============================================
SELECT id, email, nome, tipo, ativo, created_at 
FROM usuarios 
WHERE email = 'antonio.aas@ufrj.br';

-- 2. TORNAR USUÁRIO ADMIN
-- ===============================================
UPDATE usuarios 
SET tipo = 'admin' 
WHERE email = 'antonio.aas@ufrj.br';

-- 3. CONFIRMAR ALTERAÇÃO
-- ===============================================
SELECT id, email, nome, tipo, ativo, created_at 
FROM usuarios 
WHERE email = 'antonio.aas@ufrj.br';

-- RESULTADO ESPERADO: tipo deve ser 'admin'