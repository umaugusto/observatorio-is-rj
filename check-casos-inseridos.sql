-- ============================================
-- VERIFICAR SE OS CASOS FORAM INSERIDOS
-- ============================================

-- 1. Contar total de casos
SELECT 'TOTAL DE CASOS NA TABELA:' as status;
SELECT COUNT(*) as total_casos FROM casos_inovacao;

-- 2. Contar casos por categoria
SELECT 'CASOS POR CATEGORIA:' as status;
SELECT 
  categoria,
  COUNT(*) as quantidade
FROM casos_inovacao 
GROUP BY categoria
ORDER BY categoria;

-- 3. Verificar casos do usuário extensionista de exemplo
SELECT 'CASOS DO USUÁRIO EXEMPLO:' as status;
SELECT COUNT(*) as casos_usuario_exemplo
FROM casos_inovacao 
WHERE extensionista_id = '550e8400-e29b-41d4-a716-446655440000';

-- 4. Listar todos os casos com títulos
SELECT 'LISTA COMPLETA DOS CASOS:' as status;
SELECT 
  titulo,
  categoria,
  bairro,
  status_ativo,
  created_at
FROM casos_inovacao 
ORDER BY created_at DESC;

-- 5. Verificar se o usuário exemplo existe
SELECT 'USUÁRIO EXTENSIONISTA EXEMPLO:' as status;
SELECT 
  id, nome, email, tipo
FROM usuarios 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 6. Verificar URLs de imagens
SELECT 'VERIFICAR IMAGENS:' as status;
SELECT 
  titulo,
  imagem_url,
  CASE 
    WHEN imagem_url IS NULL THEN 'SEM IMAGEM'
    WHEN imagem_url LIKE 'https://images.unsplash.com/%' THEN 'UNSPLASH OK'
    ELSE 'OUTRA URL'
  END as status_imagem
FROM casos_inovacao
ORDER BY titulo;