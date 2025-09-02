-- ============================================
-- LIMPEZA DE CASOS DUPLICADOS
-- ============================================
-- 
-- PROBLEMA: Casos estão duplicados/triplicados no banco
-- CAUSA: Múltiplas execuções dos scripts de inserção
-- SOLUÇÃO: Limpar tudo e inserir apenas 1 vez cada caso
-- ============================================

-- 1. Primeiro, ver quantos casos duplicados temos
SELECT 'ANÁLISE DE DUPLICATAS:' as status;
SELECT 
  titulo,
  COUNT(*) as vezes_duplicado
FROM casos_inovacao 
GROUP BY titulo 
HAVING COUNT(*) > 1
ORDER BY vezes_duplicado DESC;

-- 2. Contar total antes da limpeza
SELECT 'TOTAL ANTES DA LIMPEZA:' as status;
SELECT COUNT(*) as total_casos FROM casos_inovacao;

-- 3. LIMPAR TODOS OS CASOS DUPLICADOS
-- Vamos deletar TODOS os casos e reinserir apenas 1 de cada
DELETE FROM casos_inovacao;

-- 4. Verificar se limpou
SELECT 'APÓS LIMPEZA:' as status;
SELECT COUNT(*) as casos_restantes FROM casos_inovacao;

-- 5. Garantir que o usuário extensionista existe
INSERT INTO usuarios (id, email, nome, tipo, instituicao, bio, ativo, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'extensionista@exemplo.com',
  'Ana Clara Silva',
  'extensionista',
  'Universidade Federal do Rio de Janeiro - UFRJ',
  'Extensionista universitária especializada em projetos sociais comunitários no Rio de Janeiro.',
  true,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 6. INSERIR APENAS 15 CASOS - SEM DUPLICATAS
INSERT INTO casos_inovacao (
  titulo, descricao, resumo, cidade, estado, bairro, cep,
  categoria, subcategoria, imagem_url, link_projeto,
  coordenadas_lat, coordenadas_lng, pessoas_impactadas,
  orcamento, data_inicio, status, contato_nome,
  contato_email, contato_telefone, extensionista_id,
  status_ativo, visualizacoes
) VALUES

-- 1. Educação - Rocinha
(
  'Biblioteca Comunitária da Rocinha',
  'Projeto que transformou um espaço abandonado em uma biblioteca comunitária com mais de 5 mil livros, oferecendo atividades de leitura, reforço escolar e oficinas culturais para crianças e jovens da Rocinha.',
  'Biblioteca comunitária que atende mais de 300 crianças e jovens mensalmente.',
  'Rio de Janeiro', 'RJ', 'Rocinha', '22451-000',
  'Educação', 'Biblioteca Comunitária',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
  'https://biblioteca-rocinha.org.br',
  -22.9888, -43.2516, 300, 25000.00, '2023-03-01', 'ativo',
  'Maria Santos', 'biblioteca.rocinha@gmail.com', '(21) 99876-5432',
  '550e8400-e29b-41d4-a716-446655440000', true, 142
),

-- 2. Saúde - Cidade de Deus
(
  'Saúde na Comunidade - CDD',
  'Programa de prevenção e promoção da saúde na Cidade de Deus, oferecendo consultas básicas, campanhas de vacinação, palestras educativas e acompanhamento de gestantes.',
  'Atendimento básico de saúde preventiva beneficiando 500 famílias.',
  'Rio de Janeiro', 'RJ', 'Cidade de Deus', '22763-000',
  'Saúde', 'Atenção Básica',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
  'https://saude-cdd.org.br',
  -22.9404, -43.3644, 500, 15000.00, '2023-01-15', 'ativo',
  'Dr. Carlos Eduardo', 'saudecdd@saude.rio', '(21) 99123-4567',
  '550e8400-e29b-41d4-a716-446655440000', true, 89
),

-- 3. Meio Ambiente - Maré
(
  'Horta Urbana Maré Verde',
  'Iniciativa de agricultura urbana que criou hortas comunitárias em lajes e terrenos da Maré, promovendo segurança alimentar, geração de renda e educação ambiental.',
  'Hortas comunitárias que produzem alimentos orgânicos para 50 famílias.',
  'Rio de Janeiro', 'RJ', 'Maré', '21044-020',
  'Meio Ambiente', 'Agricultura Urbana',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
  'https://mare-verde.org.br',
  -22.8560, -43.2496, 200, 30000.00, '2022-08-01', 'ativo',
  'João Silva Verde', 'horta.mare@verde.org', '(21) 98765-4321',
  '550e8400-e29b-41d4-a716-446655440000', true, 156
),

-- 4. Cultura - Santa Teresa
(
  'Arte e Resistência Santa Teresa',
  'Coletivo cultural que oferece oficinas gratuitas de artes visuais, música e teatro para jovens de Santa Teresa. Desenvolve espetáculos comunitários e festivais culturais.',
  'Oficinas culturais que envolvem 150 jovens em atividades artísticas.',
  'Rio de Janeiro', 'RJ', 'Santa Teresa', '20241-180',
  'Cultura', 'Artes Integradas',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
  'https://arte-santateresa.org.br',
  -22.9225, -43.1896, 150, 20000.00, '2023-02-01', 'ativo',
  'Luiza Artista', 'arte.santateresa@cultura.org', '(21) 97654-3210',
  '550e8400-e29b-41d4-a716-446655440000', true, 203
),

-- 5. Tecnologia - Complexo do Alemão
(
  'CodeLab Alemão',
  'Escola de programação gratuita no Complexo do Alemão que ensina desenvolvimento web, mobile e design digital para jovens de 14 a 25 anos.',
  'Formação em tecnologia para jovens da periferia com alta empregabilidade.',
  'Rio de Janeiro', 'RJ', 'Complexo do Alemão', '21051-071',
  'Tecnologia', 'Programação',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop',
  'https://codelab-alemao.org.br',
  -22.8644, -43.2581, 80, 45000.00, '2023-04-01', 'ativo',
  'Tech Rafael', 'codelab.alemao@tech.org', '(21) 96543-2109',
  '550e8400-e29b-41d4-a716-446655440000', true, 278
),

-- 6. Empreendedorismo - Copacabana
(
  'Mulheres Empreendedoras Copacabana',
  'Programa de capacitação em empreendedorismo para mulheres em situação de vulnerabilidade social, oferecendo cursos de gestão e microcrédito.',
  'Capacitação e microcrédito para mulheres abrirem seus próprios negócios.',
  'Rio de Janeiro', 'RJ', 'Copacabana', '22070-900',
  'Empreendedorismo', 'Negócios Sociais',
  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop',
  'https://mulheres-emprendedoras-copa.org.br',
  -22.9711, -43.1822, 120, 35000.00, '2022-11-01', 'concluido',
  'Empresária Ana', 'mulheres.copa@empreender.org', '(21) 95432-1098',
  '550e8400-e29b-41d4-a716-446655440000', true, 167
),

-- 7. Inclusão Social - Bangu
(
  'Inclusão Digital Bangu',
  'Centro de inclusão digital que oferece cursos básicos de informática, internet e redes sociais para idosos e pessoas com baixa escolaridade.',
  'Inclusão digital para idosos e pessoas com dificuldades tecnológicas.',
  'Rio de Janeiro', 'RJ', 'Bangu', '21810-010',
  'Inclusão Social', 'Inclusão Digital',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
  'https://inclusao-digital-bangu.org.br',
  -22.8701, -43.4654, 180, 22000.00, '2023-03-15', 'ativo',
  'Professora Digital', 'inclusao.bangu@digital.org', '(21) 94321-0987',
  '550e8400-e29b-41d4-a716-446655440000', true, 95
),

-- 8. Urbanismo - Centro
(
  'Revitalização Praça Mauá',
  'Projeto colaborativo de revitalização da Praça Mauá e entorno, envolvendo moradores, comerciantes e poder público.',
  'Revitalização colaborativa de espaço público no centro histórico.',
  'Rio de Janeiro', 'RJ', 'Centro', '20081-240',
  'Urbanismo', 'Espaços Públicos',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
  'https://praca-maua-revitalizacao.org.br',
  -22.8955, -43.1836, 1000, 60000.00, '2022-09-01', 'ativo',
  'Urbanista João', 'praca.maua@urbanismo.org', '(21) 93210-9876',
  '550e8400-e29b-41d4-a716-446655440000', true, 324
),

-- 9. Alimentação - Vila Isabel
(
  'Cozinha Solidária Vila Isabel',
  'Restaurante comunitário que oferece refeições nutritivas a preço popular, além de curso profissionalizante de culinária para jovens.',
  'Restaurante popular e escola de culinária promovendo segurança alimentar.',
  'Rio de Janeiro', 'RJ', 'Vila Isabel', '20541-170',
  'Alimentação', 'Segurança Alimentar',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
  'https://cozinha-solidaria-vi.org.br',
  -22.9141, -43.2407, 400, 40000.00, '2023-01-10', 'ativo',
  'Chef Comunitário', 'cozinha.vilaisabel@alimentacao.org', '(21) 92109-8765',
  '550e8400-e29b-41d4-a716-446655440000', true, 188
),

-- 10. Esporte - Tijuca
(
  'Esporte Para Todos - Tijuca',
  'Programa de atividades esportivas gratuitas na Tijuca, oferecendo aulas de futebol, vôlei, basquete e atletismo para crianças e adolescentes.',
  'Programa esportivo gratuito para desenvolvimento juvenil.',
  'Rio de Janeiro', 'RJ', 'Tijuca', '20511-170',
  'Esporte', 'Esporte Comunitário',
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
  'https://esporte-tijuca.org.br',
  -22.9249, -43.2277, 250, 28000.00, '2023-02-20', 'ativo',
  'Professor Esporte', 'esporte.tijuca@atividade.org', '(21) 91098-7654',
  '550e8400-e29b-41d4-a716-446655440000', true, 112
),

-- 11. Educação - Jacarepaguá
(
  'Reforço Escolar Comunitário Jacarepaguá',
  'Programa de reforço escolar gratuito para estudantes do ensino fundamental, oferecendo aulas de matemática, português e ciências.',
  'Reforço escolar gratuito melhorando o desempenho de estudantes carentes.',
  'Rio de Janeiro', 'RJ', 'Jacarepaguá', '22775-001',
  'Educação', 'Reforço Escolar',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
  'https://reforco-jacare.org.br',
  -22.9564, -43.3598, 180, 18000.00, '2023-03-01', 'ativo',
  'Professora Reforço', 'reforco.jacare@educacao.org', '(21) 90987-6543',
  '550e8400-e29b-41d4-a716-446655440000', true, 134
),

-- 12. Saúde - Realengo
(
  'Projeto Saúde Mental Comunitária Realengo',
  'Iniciativa de apoio psicológico e promoção da saúde mental, oferecendo rodas de conversa, terapia comunitária e oficinas de bem-estar.',
  'Apoio psicológico e promoção da saúde mental na comunidade.',
  'Rio de Janeiro', 'RJ', 'Realengo', '21715-000',
  'Saúde', 'Saúde Mental',
  'https://images.unsplash.com/photo-1559757175-0eb30cd6ec1b?w=800&h=600&fit=crop',
  'https://saude-mental-realengo.org.br',
  -22.8789, -43.4284, 160, 12000.00, '2023-04-15', 'ativo',
  'Psicóloga Social', 'mental.realengo@psicologia.org', '(21) 89876-5432',
  '550e8400-e29b-41d4-a716-446655440000', true, 76
),

-- 13. Meio Ambiente - Recreio
(
  'Proteção Costeira Recreio',
  'Projeto de conservação ambiental focado na preservação das praias e restingas do Recreio dos Bandeirantes.',
  'Conservação ambiental das praias e ecossistemas costeiros.',
  'Rio de Janeiro', 'RJ', 'Recreio dos Bandeirantes', '22790-701',
  'Meio Ambiente', 'Conservação Marinha',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
  'https://protecao-costeira-recreio.org.br',
  -23.0272, -43.4453, 300, 35000.00, '2022-10-01', 'ativo',
  'Biólogo Marinho', 'protecao.recreio@ambiente.org', '(21) 88765-4321',
  '550e8400-e29b-41d4-a716-446655440000', true, 198
),

-- 14. Cultura - Lapa
(
  'Lapa Cultural Noturna',
  'Projeto que promove a cultura local na Lapa através de saraus, apresentações de samba e choro, oficinas de dança e música.',
  'Valorização da cultura carioca através de eventos e oficinas.',
  'Rio de Janeiro', 'RJ', 'Lapa', '20230-020',
  'Cultura', 'Música Popular',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop',
  'https://lapa-cultural.org.br',
  -22.9113, -43.1794, 200, 25000.00, '2023-01-20', 'ativo',
  'Sambista Cultural', 'lapa.cultura@samba.org', '(21) 87654-3210',
  '550e8400-e29b-41d4-a716-446655440000', true, 245
),

-- 15. Tecnologia - Campo Grande (IMAGEM CORRIGIDA)
(
  'Robótica na Escola Campo Grande',
  'Programa de ensino de robótica e programação em escolas públicas, usando kits de robótica educacional e metodologia STEAM.',
  'Ensino de robótica e programação para estudantes de escolas públicas.',
  'Rio de Janeiro', 'RJ', 'Campo Grande', '23078-000',
  'Tecnologia', 'Educação Tecnológica',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
  'https://robotica-campo-grande.org.br',
  -22.9064, -43.5553, 120, 50000.00, '2023-02-15', 'ativo',
  'Professor Robot', 'robotica.campo@educacao.org', '(21) 86543-2109',
  '550e8400-e29b-41d4-a716-446655440000', true, 167
);

-- 7. Verificar resultado final
SELECT 'RESULTADO FINAL:' as status;
SELECT COUNT(*) as total_casos_limpos FROM casos_inovacao;

SELECT 'CASOS POR CATEGORIA (DEVE SER 10 CATEGORIAS):' as status;
SELECT 
  categoria,
  COUNT(*) as quantidade
FROM casos_inovacao 
GROUP BY categoria 
ORDER BY categoria;

SELECT '✅ LIMPEZA CONCLUÍDA! Agora você deve ter exatamente 15 casos únicos!' as final_status;