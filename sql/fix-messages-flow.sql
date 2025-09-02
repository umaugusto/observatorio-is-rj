-- Script para verificar e corrigir o fluxo de mensagens
-- Observatório de Inovação Social - Rio de Janeiro

-- 1. VERIFICAR ESTRUTURA DA TABELA mensagens_contato
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'mensagens_contato' 
ORDER BY ordinal_position;

-- 2. VERIFICAR DADOS EXISTENTES
SELECT 
  COUNT(*) as total_mensagens,
  COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
  COUNT(CASE WHEN status = 'lido' THEN 1 END) as lidas,
  COUNT(CASE WHEN status = 'respondido' THEN 1 END) as respondidas
FROM mensagens_contato;

-- 3. VERIFICAR RLS POLICIES EXISTENTES
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'mensagens_contato';

-- 4. CRIAR/ATUALIZAR RLS POLICIES (se necessário)

-- Política para permitir que extensionistas leiam todas as mensagens
DROP POLICY IF EXISTS "Extensionistas podem ler todas mensagens" ON mensagens_contato;
CREATE POLICY "Extensionistas podem ler todas mensagens" 
ON mensagens_contato FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id::uuid = auth.uid() 
    AND usuarios.tipo IN ('extensionista', 'pesquisador', 'coordenador')
  )
  OR
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id::uuid = auth.uid() 
    AND usuarios.is_admin = true
  )
);

-- Política para permitir que extensionistas atualizem status das mensagens
DROP POLICY IF EXISTS "Extensionistas podem atualizar mensagens" ON mensagens_contato;
CREATE POLICY "Extensionistas podem atualizar mensagens" 
ON mensagens_contato FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id::uuid = auth.uid() 
    AND usuarios.tipo IN ('extensionista', 'pesquisador', 'coordenador')
  )
  OR
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id::uuid = auth.uid() 
    AND usuarios.is_admin = true
  )
);

-- Política para permitir que qualquer pessoa (visitante) crie mensagens
DROP POLICY IF EXISTS "Visitantes podem criar mensagens" ON mensagens_contato;
CREATE POLICY "Visitantes podem criar mensagens" 
ON mensagens_contato FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 5. VERIFICAR E ADICIONAR CAMPOS NECESSÁRIOS
DO $$
BEGIN
    -- Adicionar campo concluido se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mensagens_contato' 
                   AND column_name = 'concluido') THEN
        ALTER TABLE mensagens_contato ADD COLUMN concluido BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Campo concluido adicionado à tabela mensagens_contato';
    END IF;
    
    -- Verificar se campo telefone existe, se não adicionar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mensagens_contato' 
                   AND column_name = 'telefone') THEN
        ALTER TABLE mensagens_contato ADD COLUMN telefone TEXT;
        RAISE NOTICE 'Campo telefone adicionado à tabela mensagens_contato';
    END IF;
    
    -- Adicionar campo arquivado se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mensagens_contato' 
                   AND column_name = 'arquivado') THEN
        ALTER TABLE mensagens_contato ADD COLUMN arquivado BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Campo arquivado adicionado à tabela mensagens_contato';
    END IF;
END
$$;

-- 6. VERIFICAR ESTRUTURA FINAL DA TABELA
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'mensagens_contato' 
ORDER BY ordinal_position;

-- 7. EXIBIR ALGUMAS MENSAGENS DE EXEMPLO
SELECT 
  id,
  nome,
  email,
  assunto,
  tipo_solicitacao,
  status,
  concluido,
  arquivado,
  created_at
FROM mensagens_contato 
ORDER BY created_at DESC 
LIMIT 5;

-- INSTRUÇÕES PARA EXECUÇÃO:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Verifique se não há erros
-- 3. Confirme que as políticas RLS foram criadas
-- 4. Teste criando uma mensagem via formulário de contato
-- 5. Teste visualizando mensagens no painel de extensionistas