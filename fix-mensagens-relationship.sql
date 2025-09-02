-- ============================================
-- CORRIGIR RELACIONAMENTO MENSAGENS_CONTATO
-- ============================================
-- Script para corrigir o erro de relacionamento entre mensagens_contato e usuarios

-- 1. Verificar estrutura atual da tabela mensagens_contato
SELECT 
  '=== ESTRUTURA DA TABELA mensagens_contato ===' as status;

\d mensagens_contato;

-- 2. Verificar constraints/foreign keys existentes
SELECT 
  '=== FOREIGN KEYS DA TABELA mensagens_contato ===' as status;

SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE 
  tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='mensagens_contato';

-- 3. Verificar se a coluna respondido_por existe e tem dados válidos
SELECT 
  '=== ANÁLISE DA COLUNA respondido_por ===' as status;

SELECT 
  COUNT(*) as total_mensagens,
  COUNT(respondido_por) as com_respondido_por,
  COUNT(CASE WHEN respondido_por IS NOT NULL THEN 1 END) as nao_nulos
FROM mensagens_contato;

-- 4. Verificar se há dados inválidos na coluna respondido_por
SELECT 
  '=== MENSAGENS COM respondido_por INVÁLIDO ===' as status;

SELECT 
  id, email, assunto, respondido_por, created_at
FROM mensagens_contato m
WHERE respondido_por IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM usuarios u WHERE u.id::text = m.respondido_por
  );

-- 5. Verificar se existe a foreign key problemática
SELECT 
  '=== VERIFICANDO CONSTRAINT ESPECÍFICA ===' as status;

SELECT constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'mensagens_contato' 
  AND constraint_name = 'mensagens_contato_respondido_por_fkey';

-- 6. CORREÇÃO: Remover foreign key problemática (se existir)
-- DESCOMENTE APENAS APÓS VERIFICAR OS RESULTADOS ACIMA

/*
-- Remover a constraint problemática
ALTER TABLE mensagens_contato 
DROP CONSTRAINT IF EXISTS mensagens_contato_respondido_por_fkey;

-- Limpar dados inválidos
UPDATE mensagens_contato 
SET respondido_por = NULL 
WHERE respondido_por IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM usuarios u WHERE u.id::text = respondido_por
  );

-- Recriar a foreign key corretamente (assumindo que respondido_por é UUID string)
ALTER TABLE mensagens_contato 
ADD CONSTRAINT mensagens_contato_respondido_por_fkey 
FOREIGN KEY (respondido_por) 
REFERENCES usuarios(id) 
ON DELETE SET NULL;
*/

-- 7. Verificação final
SELECT 
  '=== VERIFICAÇÃO FINAL ===' as status;

SELECT 
  COUNT(*) as total_mensagens,
  COUNT(respondido_por) as com_respondido_por,
  MAX(created_at) as mensagem_mais_recente
FROM mensagens_contato;

-- 8. Testar query que estava falhando
SELECT 
  '=== TESTE DA QUERY ORIGINAL ===' as status;

SELECT 
  id, email, assunto, status, respondido_por, created_at
FROM mensagens_contato
ORDER BY created_at DESC
LIMIT 5;