-- ============================================
-- OBSERVATÓRIO DE INOVAÇÃO SOCIAL RJ
-- Script para Corrigir Políticas RLS - Problema de Edição
-- ============================================
-- 
-- PROBLEMA: Erro "Caso não encontrado ou não foi possível atualizar"
-- CAUSA: Políticas RLS verificam tipo='admin' mas usuários admin têm is_admin=true
-- SOLUÇÃO: Atualizar políticas para reconhecer is_admin corretamente
-- 
-- EXECUTE este script no Supabase SQL Editor
-- ============================================

-- Primeiro, vamos ver as políticas atuais
SELECT 'POLÍTICAS ATUAIS ANTES DA CORREÇÃO:' as status;
SELECT 
  policyname as nome_politica,
  cmd as comando,
  qual as condicao
FROM pg_policies 
WHERE tablename = 'casos_inovacao';

-- ============================================
-- REMOVER POLÍTICAS ANTIGAS PROBLEMÁTICAS
-- ============================================

-- Remove política de update antiga que verifica tipo='admin'
DROP POLICY IF EXISTS "casos_update_owner_or_admin" ON casos_inovacao;

-- Remove política de insert se existir
DROP POLICY IF EXISTS "casos_insert_authenticated" ON casos_inovacao;

-- Remove outras políticas antigas
DROP POLICY IF EXISTS "casos_select_public" ON casos_inovacao;

-- ============================================
-- CRIAR POLÍTICAS CORRIGIDAS
-- ============================================

-- Política: Todos podem visualizar casos ativos
CREATE POLICY "casos_select_public" ON casos_inovacao
  FOR SELECT USING (status_ativo = true);

-- Política: Usuários autenticados podem criar casos
CREATE POLICY "casos_insert_authenticated" ON casos_inovacao
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND ativo = true
    )
  );

-- Política CORRIGIDA: Update para donos OU admins (usando is_admin)
CREATE POLICY "casos_update_owner_or_admin" ON casos_inovacao
  FOR UPDATE USING (
    -- Dono do caso
    auth.uid() = extensionista_id
    OR
    -- Usuário com is_admin = true
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND ativo = true
      AND (is_admin = true OR is_root = true)
    )
  );

-- Política: Delete para donos OU admins (usando is_admin)
CREATE POLICY "casos_delete_owner_or_admin" ON casos_inovacao
  FOR DELETE USING (
    -- Dono do caso
    auth.uid() = extensionista_id
    OR
    -- Usuário com is_admin = true
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND ativo = true
      AND (is_admin = true OR is_root = true)
    )
  );

-- ============================================
-- VERIFICAR POLÍTICAS CORRIGIDAS
-- ============================================

SELECT 'POLÍTICAS APÓS CORREÇÃO:' as status;
SELECT 
  policyname as nome_politica,
  cmd as comando,
  qual as condicao
FROM pg_policies 
WHERE tablename = 'casos_inovacao'
ORDER BY policyname;

-- ============================================
-- TESTAR PERMISSÕES DO USUÁRIO ATUAL
-- ============================================

SELECT 'TESTE DE PERMISSÕES DO USUÁRIO ATUAL:' as status;

-- Verificar usuário autenticado
SELECT 
  'ID do usuário atual: ' || COALESCE(auth.uid()::text, 'NÃO AUTENTICADO') as usuario_info;

-- Verificar se tem permissão admin
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND ativo = true 
      AND (is_admin = true OR is_root = true)
    ) THEN 'USUÁRIO TEM PERMISSÕES DE ADMIN ✅'
    ELSE 'USUÁRIO NÃO TEM PERMISSÕES DE ADMIN ❌'
  END as status_admin;

-- Verificar dados do usuário atual
SELECT 
  id, email, nome, tipo, 
  is_admin, is_root, ativo
FROM usuarios 
WHERE id = auth.uid();

-- ============================================
-- TESTAR UPDATE EM UM CASO (se existir)
-- ============================================

SELECT 'TESTE DE UPDATE (se houver casos):' as status;

-- Tentar fazer um update simples em um caso existente
DO $$
DECLARE
    test_case_id UUID;
    update_result INTEGER;
BEGIN
    -- Pegar ID de um caso qualquer
    SELECT id INTO test_case_id 
    FROM casos_inovacao 
    LIMIT 1;
    
    IF test_case_id IS NOT NULL THEN
        -- Tentar fazer update
        UPDATE casos_inovacao 
        SET updated_at = NOW() 
        WHERE id = test_case_id;
        
        GET DIAGNOSTICS update_result = ROW_COUNT;
        
        IF update_result > 0 THEN
            RAISE NOTICE 'TESTE DE UPDATE: SUCESSO ✅ (Caso ID: %)', test_case_id;
        ELSE
            RAISE NOTICE 'TESTE DE UPDATE: FALHOU ❌ (Sem permissão ou caso não existe)';
        END IF;
    ELSE
        RAISE NOTICE 'TESTE DE UPDATE: Não há casos para testar';
    END IF;
END $$;

-- ============================================
-- INSTRUÇÃO FINAL
-- ============================================

SELECT 'CORREÇÃO CONCLUÍDA!' as status;
SELECT 'Agora tente editar um caso no sistema novamente.' as proxima_acao;
SELECT 'Se ainda houver erro, execute o script check-update-permissions.sql' as alternativa;