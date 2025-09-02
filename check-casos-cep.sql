-- ============================================
-- VERIFICAR CASOS SEM CEP CADASTRADO
-- ============================================
-- Script para identificar casos que não aparecem no mapa por falta de localização

-- 1. Estatísticas gerais de localização
SELECT 
  '=== RESUMO GERAL DE LOCALIZAÇÃO ===' as status,
  COUNT(*) as total_casos,
  COUNT(cep) as com_cep,
  COUNT(cidade) as com_cidade,
  COUNT(bairro) as com_bairro,
  COUNT(coordenadas_lat) as com_coordenadas_lat,
  COUNT(coordenadas_lng) as com_coordenadas_lng,
  COUNT(localizacao) as com_localizacao_antiga
FROM casos_inovacao 
WHERE status_ativo = true;

-- 2. Casos que NÃO vão aparecer no mapa (sem qualquer informação de localização)
SELECT 
  '=== CASOS SEM LOCALIZAÇÃO (NÃO APARECEM NO MAPA) ===' as status;

SELECT 
  id,
  titulo,
  categoria,
  cep,
  cidade,
  estado,
  bairro,
  coordenadas_lat,
  coordenadas_lng,
  localizacao,
  created_at
FROM casos_inovacao 
WHERE status_ativo = true
  AND cep IS NULL 
  AND cidade IS NULL 
  AND coordenadas_lat IS NULL 
  AND localizacao IS NULL
ORDER BY created_at DESC;

-- 3. Casos com informação parcial (só cidade, sem CEP/coordenadas)
SELECT 
  '=== CASOS COM LOCALIZAÇÃO PARCIAL (BAIXA PRECISÃO NO MAPA) ===' as status;

SELECT 
  id,
  titulo,
  categoria,
  cep,
  cidade,
  estado,
  bairro,
  coordenadas_lat,
  coordenadas_lng,
  localizacao,
  created_at
FROM casos_inovacao 
WHERE status_ativo = true
  AND (cidade IS NOT NULL OR localizacao IS NOT NULL)
  AND cep IS NULL 
  AND coordenadas_lat IS NULL
ORDER BY created_at DESC;

-- 4. Casos IDEAIS (com CEP ou coordenadas) - aparecem com boa precisão no mapa
SELECT 
  '=== CASOS COM BOA LOCALIZAÇÃO (APARECEM CORRETAMENTE NO MAPA) ===' as status;

SELECT 
  id,
  titulo,
  categoria,
  cep,
  cidade,
  estado,
  bairro,
  coordenadas_lat,
  coordenadas_lng,
  created_at
FROM casos_inovacao 
WHERE status_ativo = true
  AND (cep IS NOT NULL OR (coordenadas_lat IS NOT NULL AND coordenadas_lng IS NOT NULL))
ORDER BY created_at DESC;

-- 5. Lista de cidades encontradas para referência
SELECT 
  '=== CIDADES ENCONTRADAS NOS CASOS ===' as status;

SELECT 
  cidade,
  COUNT(*) as quantidade_casos
FROM casos_inovacao 
WHERE status_ativo = true 
  AND cidade IS NOT NULL
GROUP BY cidade
ORDER BY quantidade_casos DESC;

-- 6. Lista de bairros encontrados para referência  
SELECT 
  '=== BAIRROS ENCONTRADOS NOS CASOS ===' as status;

SELECT 
  bairro,
  cidade,
  COUNT(*) as quantidade_casos
FROM casos_inovacao 
WHERE status_ativo = true 
  AND bairro IS NOT NULL
GROUP BY bairro, cidade
ORDER BY quantidade_casos DESC;