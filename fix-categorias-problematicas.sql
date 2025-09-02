-- ============================================
-- CORRIGIR CATEGORIAS PROBLEMÁTICAS
-- ============================================
-- Script para corrigir casos com categoria NULL, vazia ou inválida

-- 1. Primeiro, vamos ver quais casos têm problema
SELECT 
  '=== CASOS COM CATEGORIAS PROBLEMÁTICAS ===' as status;

SELECT 
  id,
  titulo,
  categoria,
  descricao,
  status_ativo,
  created_at
FROM casos_inovacao 
WHERE (categoria IS NULL OR categoria = '' OR TRIM(categoria) = '')
  AND status_ativo = true
ORDER BY created_at DESC;

-- 2. Ver se há categorias com nomes ligeiramente diferentes
SELECT 
  '=== TODAS AS CATEGORIAS ÚNICAS (para análise) ===' as status;

SELECT DISTINCT 
  categoria,
  LENGTH(categoria) as tamanho,
  ASCII(categoria) as primeiro_char
FROM casos_inovacao 
WHERE categoria IS NOT NULL 
  AND categoria != ''
  AND status_ativo = true
ORDER BY categoria;

-- 3. Script de correção - EXECUTE APENAS APÓS VERIFICAR OS CASOS ACIMA

-- Exemplo de correções (ajuste conforme necessário):

-- Definir categoria padrão para casos sem categoria baseado na descrição/título
-- Você pode ajustar essas regras baseado no conteúdo real dos casos

/*
-- Para casos de educação (palavras-chave no título/descrição)
UPDATE casos_inovacao 
SET categoria = 'Educação'
WHERE (categoria IS NULL OR categoria = '' OR TRIM(categoria) = '')
  AND status_ativo = true
  AND (
    LOWER(titulo) LIKE '%educação%' OR
    LOWER(titulo) LIKE '%escola%' OR 
    LOWER(titulo) LIKE '%ensino%' OR
    LOWER(titulo) LIKE '%aluno%' OR
    LOWER(descricao) LIKE '%educação%' OR
    LOWER(descricao) LIKE '%escola%' OR
    LOWER(descricao) LIKE '%ensino%'
  );

-- Para casos de saúde
UPDATE casos_inovacao 
SET categoria = 'Saúde'
WHERE (categoria IS NULL OR categoria = '' OR TRIM(categoria) = '')
  AND status_ativo = true
  AND (
    LOWER(titulo) LIKE '%saúde%' OR
    LOWER(titulo) LIKE '%médico%' OR 
    LOWER(titulo) LIKE '%hospital%' OR
    LOWER(titulo) LIKE '%clínica%' OR
    LOWER(descricao) LIKE '%saúde%' OR
    LOWER(descricao) LIKE '%médico%'
  );

-- Para casos de meio ambiente
UPDATE casos_inovacao 
SET categoria = 'Meio Ambiente'
WHERE (categoria IS NULL OR categoria = '' OR TRIM(categoria) = '')
  AND status_ativo = true
  AND (
    LOWER(titulo) LIKE '%ambiente%' OR
    LOWER(titulo) LIKE '%sustentável%' OR 
    LOWER(titulo) LIKE '%reciclagem%' OR
    LOWER(titulo) LIKE '%verde%' OR
    LOWER(descricao) LIKE '%ambiente%' OR
    LOWER(descricao) LIKE '%sustentável%'
  );

-- Para casos de cultura
UPDATE casos_inovacao 
SET categoria = 'Cultura'
WHERE (categoria IS NULL OR categoria = '' OR TRIM(categoria) = '')
  AND status_ativo = true
  AND (
    LOWER(titulo) LIKE '%cultura%' OR
    LOWER(titulo) LIKE '%arte%' OR 
    LOWER(titulo) LIKE '%música%' OR
    LOWER(titulo) LIKE '%teatro%' OR
    LOWER(descricao) LIKE '%cultura%' OR
    LOWER(descricao) LIKE '%arte%'
  );

-- Categoria padrão para casos que não se encaixam em nenhuma das anteriores
UPDATE casos_inovacao 
SET categoria = 'Direitos Humanos'
WHERE (categoria IS NULL OR categoria = '' OR TRIM(categoria) = '')
  AND status_ativo = true;
*/

-- 4. Verificar se há categorias com grafias ligeiramente diferentes que devem ser padronizadas
-- Exemplos comuns:

/*
-- Corrigir variações de escrita
UPDATE casos_inovacao SET categoria = 'Educação' WHERE categoria = 'Educacao' AND status_ativo = true;
UPDATE casos_inovacao SET categoria = 'Saúde' WHERE categoria = 'Saude' AND status_ativo = true;
UPDATE casos_inovacao SET categoria = 'Meio Ambiente' WHERE categoria = 'Meio-Ambiente' AND status_ativo = true;
UPDATE casos_inovacao SET categoria = 'Geração de Renda' WHERE categoria = 'Geracao de Renda' AND status_ativo = true;
UPDATE casos_inovacao SET categoria = 'Tecnologia Social' WHERE categoria = 'Tecnologia' AND status_ativo = true;
UPDATE casos_inovacao SET categoria = 'Direitos Humanos' WHERE categoria = 'Direitos Humanos' AND status_ativo = true;

-- Padronizar categorias que podem ter nomes similares
UPDATE casos_inovacao SET categoria = 'Geração de Renda' WHERE categoria = 'Empreendedorismo' AND status_ativo = true;
UPDATE casos_inovacao SET categoria = 'Direitos Humanos' WHERE categoria = 'Inclusão Social' AND status_ativo = true;
UPDATE casos_inovacao SET categoria = 'Habitação' WHERE categoria = 'Urbanismo' AND status_ativo = true;
*/

-- 5. Verificação final - execute após as correções
SELECT 
  '=== VERIFICAÇÃO FINAL ===' as status;

SELECT 
  categoria,
  COUNT(*) as total_casos
FROM casos_inovacao 
WHERE status_ativo = true
GROUP BY categoria 
ORDER BY total_casos DESC;

-- 6. Casos que ainda estão com categoria problemática (após correções)
SELECT 
  '=== CASOS AINDA COM PROBLEMA (após correções) ===' as status;

SELECT 
  id,
  titulo,
  categoria,
  created_at
FROM casos_inovacao 
WHERE (categoria IS NULL OR categoria = '' OR TRIM(categoria) = '')
  AND status_ativo = true
ORDER BY created_at DESC;