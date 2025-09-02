-- ============================================
-- SCRIPT PARA ATUALIZAR CEPs DOS CASOS
-- ============================================
-- Script com sugestões de CEPs para bairros conhecidos do Rio de Janeiro
-- Execute APÓS rodar check-casos-cep.sql para identificar os casos

-- IMPORTANTE: 
-- 1. Execute check-casos-cep.sql primeiro para ver quais casos precisam de CEP
-- 2. Revise cada UPDATE antes de executar
-- 3. Substitua 'ID_DO_CASO' pelos IDs reais encontrados no check
-- 4. Verifique se os CEPs sugeridos fazem sentido para cada caso específico

-- ============================================
-- EXEMPLO DE ATUALIZAÇÕES POR BAIRRO
-- ============================================

-- Copacabana (CEPs: 22000-000 a 22099-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '22070-900' WHERE id = 'ID_DO_CASO_COPACABANA';

-- Ipanema (CEPs: 22400-000 a 22499-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '22421-000' WHERE id = 'ID_DO_CASO_IPANEMA';

-- Leblon (CEPs: 22430-000 a 22449-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '22441-000' WHERE id = 'ID_DO_CASO_LEBLON';

-- Tijuca (CEPs: 20500-000 a 20599-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '20511-000' WHERE id = 'ID_DO_CASO_TIJUCA';

-- Centro (CEPs: 20000-000 a 20099-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '20040-020' WHERE id = 'ID_DO_CASO_CENTRO';

-- Botafogo (CEPs: 22250-000 a 22299-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '22280-020' WHERE id = 'ID_DO_CASO_BOTAFOGO';

-- Flamengo (CEPs: 22200-000 a 22249-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '22220-040' WHERE id = 'ID_DO_CASO_FLAMENGO';

-- Barra da Tijuca (CEPs: 22600-000 a 22799-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '22631-000' WHERE id = 'ID_DO_CASO_BARRA';

-- Recreio dos Bandeirantes (CEPs: 22780-000 a 22799-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '22790-000' WHERE id = 'ID_DO_CASO_RECREIO';

-- Lagoa (CEPs: 22460-000 a 22499-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '22471-000' WHERE id = 'ID_DO_CASO_LAGOA';

-- Jardim Botânico (CEPs: 22460-000 a 22499-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '22461-000' WHERE id = 'ID_DO_CASO_JARDIM_BOTANICO';

-- Lapa (CEPs: 20230-000 a 20269-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '20241-190' WHERE id = 'ID_DO_CASO_LAPA';

-- Santa Teresa (CEPs: 20240-000 a 20269-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '20241-011' WHERE id = 'ID_DO_CASO_SANTA_TERESA';

-- Maracanã (CEPs: 20270-000 a 20299-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '20271-020' WHERE id = 'ID_DO_CASO_MARACANA';

-- Vila Isabel (CEPs: 20550-000 a 20599-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '20551-030' WHERE id = 'ID_DO_CASO_VILA_ISABEL';

-- Méier (CEPs: 20720-000 a 20799-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '20735-000' WHERE id = 'ID_DO_CASO_MEIER';

-- Campo Grande (CEPs: 23000-000 a 23099-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '23045-000' WHERE id = 'ID_DO_CASO_CAMPO_GRANDE';

-- Bangu (CEPs: 21800-000 a 21899-999)
-- Exemplo: UPDATE casos_inovacao SET cep = '21825-000' WHERE id = 'ID_DO_CASO_BANGU';

-- ============================================
-- TEMPLATES PARA CASOS ESPECÍFICOS
-- ============================================

-- Para casos só com cidade "Rio de Janeiro" (sem bairro específico):
-- Use CEP genérico do Centro: 20040-020

-- Para casos com estado mas sem cidade:
-- Primeiro defina a cidade, depois o CEP apropriado

-- ============================================
-- EXEMPLO DE SCRIPT COMPLETO
-- ============================================

-- Substitua os comentários abaixo por UPDATEs reais baseados no resultado de check-casos-cep.sql

/*
-- Exemplo real (substitua pelos IDs corretos):
UPDATE casos_inovacao 
SET cep = '22070-900', 
    cidade = COALESCE(cidade, 'Rio de Janeiro'),
    estado = COALESCE(estado, 'RJ')
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'  -- ID do caso em Copacabana
  AND status_ativo = true;

UPDATE casos_inovacao 
SET cep = '22421-000',
    cidade = COALESCE(cidade, 'Rio de Janeiro'), 
    estado = COALESCE(estado, 'RJ')
WHERE id = 'b2c3d4e5-f6g7-8901-bcde-f23456789012'  -- ID do caso em Ipanema
  AND status_ativo = true;
*/

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================

/*
PASSO A PASSO:

1. Execute o script check-casos-cep.sql para identificar casos sem localização

2. Para cada caso encontrado:
   - Anote o ID do caso
   - Identifique o bairro/região (se disponível)
   - Escolha um CEP apropriado da lista acima
   - Substitua 'ID_DO_CASO' pelo ID real

3. Exemplo de comando final:
   UPDATE casos_inovacao 
   SET cep = '22070-900', 
       cidade = COALESCE(cidade, 'Rio de Janeiro'),
       estado = COALESCE(estado, 'RJ')
   WHERE id = 'seu-id-aqui'
     AND status_ativo = true;

4. Execute os UPDATEs um por vez para verificar se está correto

5. Depois de atualizar, acesse /mapa para ver se os casos aparecem corretamente

DICA: Use COALESCE para não sobrescrever dados existentes de cidade/estado
*/