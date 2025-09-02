-- ============================================
-- VERIFICAR ESTRUTURA DA TABELA CASOS_INOVACAO
-- ============================================

-- 1. Mostrar todos os campos da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'casos_inovacao' 
ORDER BY ordinal_position;

-- 2. Verificar se existem dados nos campos cidade/estado/cep
SELECT 'CAMPOS DE LOCALIZAÇÃO:' as status;
SELECT 
  COUNT(*) as total_casos,
  COUNT(cidade) as com_cidade,
  COUNT(estado) as com_estado, 
  COUNT(cep) as com_cep,
  COUNT(bairro) as com_bairro,
  COUNT(localizacao) as com_localizacao
FROM casos_inovacao;

-- 3. Mostrar alguns exemplos de dados
SELECT 'EXEMPLOS DE DADOS:' as status;
SELECT 
  titulo,
  cidade,
  estado,
  cep,
  bairro,
  localizacao
FROM casos_inovacao 
LIMIT 5;