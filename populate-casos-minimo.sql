-- ============================================
-- SCRIPT PARA ESTRUTURA MÍNIMA DA TABELA
-- ============================================
-- Sua tabela tem apenas 8 campos:
-- id, titulo, descricao, categoria, extensionista_id,
-- status_ativo, created_at, updated_at
-- ============================================

-- Criar usuário extensionista de exemplo (caso não exista)
INSERT INTO usuarios (id, email, nome, tipo, ativo, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'extensionista@exemplo.com',
  'Ana Clara Silva',
  'extensionista',
  true,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Inserir casos com APENAS os campos que existem
INSERT INTO casos_inovacao (
  titulo,
  descricao,
  categoria,
  extensionista_id,
  status_ativo
) VALUES
-- 1. Educação
(
  'Biblioteca Comunitária da Rocinha',
  'Projeto que transformou um espaço abandonado em uma biblioteca comunitária com mais de 5 mil livros, oferecendo atividades de leitura, reforço escolar e oficinas culturais para crianças e jovens da Rocinha. O projeto conta com voluntários da comunidade e parcerias com editoras para doação de livros.',
  'Educação',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 2. Saúde
(
  'Saúde na Comunidade - CDD',
  'Programa de prevenção e promoção da saúde na Cidade de Deus, oferecendo consultas básicas, campanhas de vacinação, palestras educativas e acompanhamento de gestantes. O projeto é desenvolvido por estudantes de medicina e enfermagem em parceria com a unidade básica de saúde local.',
  'Saúde',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 3. Meio Ambiente
(
  'Horta Urbana Maré Verde',
  'Iniciativa de agricultura urbana que criou hortas comunitárias em lajes e terrenos da Maré, promovendo segurança alimentar, geração de renda e educação ambiental. O projeto ensina técnicas de cultivo sustentável e comercializa os produtos na feira local.',
  'Meio Ambiente',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 4. Cultura
(
  'Arte e Resistência Santa Teresa',
  'Coletivo cultural que oferece oficinas gratuitas de artes visuais, música e teatro para jovens de Santa Teresa. O projeto desenvolve espetáculos comunitários, exposições de arte e festivais culturais que valorizam a cultura local e promovem inclusão social através da arte.',
  'Cultura',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 5. Tecnologia
(
  'CodeLab Alemão',
  'Escola de programação gratuita no Complexo do Alemão que ensina desenvolvimento web, mobile e design digital para jovens de 14 a 25 anos. O projeto conta com laboratório de informática, mentoria profissional e programa de estágio em empresas de tecnologia.',
  'Tecnologia',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 6. Empreendedorismo
(
  'Mulheres Empreendedoras Copacabana',
  'Programa de capacitação em empreendedorismo para mulheres em situação de vulnerabilidade social de Copacabana e adjacências. Oferece cursos de gestão, marketing digital, formalização de negócios e microcrédito para abertura de pequenos negócios.',
  'Empreendedorismo',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 7. Inclusão Social
(
  'Inclusão Digital Bangu',
  'Centro de inclusão digital que oferece cursos básicos de informática, internet e redes sociais para idosos e pessoas com baixa escolaridade em Bangu. O projeto conta com computadores adaptados e metodologia específica para o público 60+.',
  'Inclusão Social',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 8. Urbanismo
(
  'Revitalização Praça Mauá',
  'Projeto colaborativo de revitalização da Praça Mauá e entorno, envolvendo moradores, comerciantes e poder público. Inclui limpeza urbana, plantio de árvores, instalação de mobiliário urbano e programação cultural regular no espaço público.',
  'Urbanismo',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 9. Alimentação
(
  'Cozinha Solidária Vila Isabel',
  'Restaurante comunitário que oferece refeições nutritivas a preço popular em Vila Isabel, além de curso profissionalizante de culinária para jovens em situação de vulnerabilidade. O projeto promove segurança alimentar e geração de emprego.',
  'Alimentação',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 10. Esporte
(
  'Esporte Para Todos - Tijuca',
  'Programa de atividades esportivas gratuitas na Tijuca, oferecendo aulas de futebol, vôlei, basquete e atletismo para crianças e adolescentes. Inclui competições locais, festival esportivo anual e formação de equipes comunitárias.',
  'Esporte',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 11. Educação - Reforço
(
  'Reforço Escolar Comunitário Jacarepaguá',
  'Programa de reforço escolar gratuito para estudantes do ensino fundamental em Jacarepaguá, oferecendo aulas de matemática, português e ciências. Conta com professores voluntários e material didático adaptado às necessidades locais.',
  'Educação',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 12. Saúde Mental
(
  'Projeto Saúde Mental Comunitária Realengo',
  'Iniciativa de apoio psicológico e promoção da saúde mental em Realengo, oferecendo rodas de conversa, terapia comunitária, oficinas de bem-estar e encaminhamento para atendimento especializado quando necessário.',
  'Saúde',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 13. Conservação
(
  'Proteção Costeira Recreio',
  'Projeto de conservação ambiental focado na preservação das praias e restingas do Recreio dos Bandeirantes. Inclui mutirões de limpeza, replantio de vegetação nativa, educação ambiental e monitoramento da qualidade da água.',
  'Meio Ambiente',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 14. Música
(
  'Lapa Cultural Noturna',
  'Projeto que promove a cultura local na Lapa através de saraus, apresentações de samba e choro, oficinas de dança e música. Valoriza artistas locais, oferece espaço cultural gratuito e mantém viva a tradição musical carioca.',
  'Cultura',
  '550e8400-e29b-41d4-a716-446655440000',
  true
),

-- 15. Robótica
(
  'Robótica na Escola Campo Grande',
  'Programa de ensino de robótica e programação em escolas públicas de Campo Grande, usando kits de robótica educacional e metodologia STEAM. Desenvolve competições de robótica estudantil e forma professores multiplicadores.',
  'Tecnologia',
  '550e8400-e29b-41d4-a716-446655440000',
  true
);

-- Verificar se funcionou
SELECT COUNT(*) as total_casos_inseridos FROM casos_inovacao;
SELECT 'Script executado com sucesso! Casos inseridos na estrutura mínima.' as status;