-- ============================================
-- CORRIGIR CAMPO CIDADE VAZIO
-- ============================================
-- 
-- PROBLEMA: Botão "Publicar" desabilitado porque campo cidade está vazio
-- CAUSA: Casos inseridos sem o campo cidade preenchido
-- SOLUÇÃO: Atualizar todos os casos para ter cidade = "Rio de Janeiro"
-- ============================================

-- 1. Verificar casos sem cidade
SELECT 'CASOS SEM CIDADE:' as status;
SELECT 
  titulo,
  cidade,
  bairro,
  CASE 
    WHEN cidade IS NULL OR cidade = '' THEN 'SEM CIDADE ❌'
    ELSE 'COM CIDADE ✅'
  END as status_cidade
FROM casos_inovacao
ORDER BY titulo;

-- 2. Contar quantos casos estão sem cidade
SELECT 'TOTAL DE CASOS SEM CIDADE:' as status;
SELECT COUNT(*) as casos_sem_cidade
FROM casos_inovacao 
WHERE cidade IS NULL OR cidade = '';

-- 3. CORRIGIR: Atualizar todos os casos para ter cidade
UPDATE casos_inovacao 
SET cidade = 'Rio de Janeiro'
WHERE cidade IS NULL OR cidade = '';

-- 4. Também garantir que estado esteja preenchido
UPDATE casos_inovacao 
SET estado = 'RJ'
WHERE estado IS NULL OR estado = '';

-- 5. Verificar se a correção funcionou
SELECT 'APÓS CORREÇÃO:' as status;
SELECT 
  COUNT(*) as total_casos,
  COUNT(CASE WHEN cidade IS NOT NULL AND cidade != '' THEN 1 END) as casos_com_cidade,
  COUNT(CASE WHEN estado IS NOT NULL AND estado != '' THEN 1 END) as casos_com_estado
FROM casos_inovacao;

-- 6. Verificar casos atualizados
SELECT 'CASOS CORRIGIDOS:' as status;
SELECT 
  titulo,
  cidade,
  estado,
  bairro
FROM casos_inovacao
ORDER BY titulo;

SELECT '✅ CORREÇÃO CONCLUÍDA! Agora o botão Publicar deve funcionar!' as final_status;