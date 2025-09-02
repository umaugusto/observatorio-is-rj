-- ============================================
-- VERIFICAR CATEGORIAS NO BANCO DE DADOS
-- ============================================
-- Script para verificar quais categorias estão sendo usadas

-- 1. Listar todas as categorias únicas no banco
SELECT 
  '=== CATEGORIAS ENCONTRADAS NO BANCO ===' as status;

SELECT 
  categoria,
  COUNT(*) as quantidade_casos,
  COUNT(CASE WHEN status_ativo = true THEN 1 END) as casos_ativos
FROM casos_inovacao 
GROUP BY categoria 
ORDER BY quantidade_casos DESC;

-- 2. Verificar se existem categorias que não estão na lista do constants.ts
SELECT 
  '=== CATEGORIAS NÃO ESPERADAS (não estão no constants.ts) ===' as status;

SELECT DISTINCT categoria
FROM casos_inovacao 
WHERE categoria NOT IN (
  'Educação',
  'Saúde', 
  'Meio Ambiente',
  'Geração de Renda',
  'Cultura',
  'Tecnologia Social',
  'Direitos Humanos',
  'Habitação'
) AND status_ativo = true;

-- 3. Verificar categorias do constants.ts que não têm casos
SELECT 
  '=== CATEGORIAS SEM CASOS (estão no constants.ts mas sem dados) ===' as status;

WITH categorias_esperadas AS (
  SELECT unnest(ARRAY[
    'Educação',
    'Saúde', 
    'Meio Ambiente',
    'Geração de Renda',
    'Cultura',
    'Tecnologia Social',
    'Direitos Humanos',
    'Habitação'
  ]) as categoria
)
SELECT ce.categoria
FROM categorias_esperadas ce
LEFT JOIN casos_inovacao ci ON ce.categoria = ci.categoria AND ci.status_ativo = true
WHERE ci.categoria IS NULL;

-- 4. Estatísticas detalhadas por categoria
SELECT 
  '=== ESTATÍSTICAS DETALHADAS POR CATEGORIA ===' as status;

SELECT 
  categoria,
  COUNT(*) as total_casos,
  COUNT(CASE WHEN status_ativo = true THEN 1 END) as casos_ativos,
  SUM(pessoas_impactadas) as total_pessoas_impactadas,
  SUM(orcamento) as total_orcamento,
  COUNT(DISTINCT cidade) as cidades_atendidas,
  MIN(created_at) as primeiro_caso,
  MAX(created_at) as ultimo_caso
FROM casos_inovacao 
WHERE status_ativo = true
GROUP BY categoria 
ORDER BY casos_ativos DESC, total_pessoas_impactadas DESC;

-- 5. Verificar se há casos com categoria NULL ou vazia
SELECT 
  '=== CASOS COM CATEGORIA PROBLEMÁTICA ===' as status;

SELECT 
  id,
  titulo,
  categoria,
  status_ativo,
  created_at
FROM casos_inovacao 
WHERE (categoria IS NULL OR categoria = '' OR TRIM(categoria) = '')
ORDER BY created_at DESC;