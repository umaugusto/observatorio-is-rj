-- ============================================
-- OBSERVATÓRIO DE INOVAÇÃO SOCIAL RJ
-- Script de Setup do Banco de Dados Supabase
-- ============================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse seu projeto no Supabase Dashboard
-- 2. Vá para SQL Editor (ícone de terminal)
-- 3. Cole este script completo
-- 4. Clique em "Run" para executar
-- ============================================

-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CRIAR TABELAS
-- ============================================

-- Tabela de usuários (extensionistas e admins)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'extensionista' CHECK (tipo IN ('admin', 'extensionista')),
  instituicao VARCHAR(255),
  telefone VARCHAR(20),
  bio TEXT,
  avatar_url VARCHAR(500),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de casos de inovação social
CREATE TABLE IF NOT EXISTS casos_inovacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  resumo TEXT,
  localizacao VARCHAR(255) NOT NULL,
  bairro VARCHAR(100),
  categoria VARCHAR(100) NOT NULL,
  subcategoria VARCHAR(100),
  imagem_url VARCHAR(500),
  link_projeto VARCHAR(500),
  video_url VARCHAR(500),
  coordenadas_lat DECIMAL(10,8),
  coordenadas_lng DECIMAL(11,8),
  pessoas_impactadas INTEGER DEFAULT 0,
  orcamento DECIMAL(12,2),
  data_inicio DATE,
  data_fim DATE,
  status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('planejamento', 'ativo', 'concluido', 'pausado')),
  tags TEXT[], -- Array de tags
  contato_nome VARCHAR(255),
  contato_email VARCHAR(255),
  contato_telefone VARCHAR(20),
  extensionista_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  status_ativo BOOLEAN DEFAULT true,
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de imagens adicionais dos casos
CREATE TABLE IF NOT EXISTS caso_imagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caso_id UUID REFERENCES casos_inovacao(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de parceiros dos casos
CREATE TABLE IF NOT EXISTS caso_parceiros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caso_id UUID REFERENCES casos_inovacao(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(100), -- universidade, ong, empresa, governo
  logo_url VARCHAR(500),
  website VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de métricas/indicadores dos casos
CREATE TABLE IF NOT EXISTS caso_metricas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caso_id UUID REFERENCES casos_inovacao(id) ON DELETE CASCADE,
  indicador VARCHAR(255) NOT NULL,
  valor VARCHAR(255) NOT NULL,
  unidade VARCHAR(50),
  periodo VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_casos_categoria ON casos_inovacao(categoria);
CREATE INDEX IF NOT EXISTS idx_casos_localizacao ON casos_inovacao(localizacao);
CREATE INDEX IF NOT EXISTS idx_casos_bairro ON casos_inovacao(bairro);
CREATE INDEX IF NOT EXISTS idx_casos_status ON casos_inovacao(status);
CREATE INDEX IF NOT EXISTS idx_casos_ativo ON casos_inovacao(status_ativo);
CREATE INDEX IF NOT EXISTS idx_casos_extensionista ON casos_inovacao(extensionista_id);
CREATE INDEX IF NOT EXISTS idx_casos_data_inicio ON casos_inovacao(data_inicio);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- ============================================
-- CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE casos_inovacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE caso_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE caso_parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE caso_metricas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS DE SEGURANÇA - USUARIOS
-- ============================================

-- Política: Todos podem ver usuários ativos
CREATE POLICY "usuarios_select_public" ON usuarios
  FOR SELECT USING (ativo = true);

-- Política: Usuários podem ver seus próprios dados completos
CREATE POLICY "usuarios_select_own" ON usuarios
  FOR SELECT USING (auth.uid() = id);

-- Política: Usuários podem atualizar seus próprios dados
CREATE POLICY "usuarios_update_own" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Política: Admins têm acesso total
CREATE POLICY "usuarios_admin_all" ON usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND tipo = 'admin' 
      AND ativo = true
    )
  );

-- ============================================
-- POLÍTICAS DE SEGURANÇA - CASOS_INOVACAO
-- ============================================

-- Política: Casos ativos são públicos para leitura
CREATE POLICY "casos_select_public" ON casos_inovacao
  FOR SELECT USING (status_ativo = true);

-- Política: Extensionistas podem inserir casos
CREATE POLICY "casos_insert_extensionista" ON casos_inovacao
  FOR INSERT WITH CHECK (
    auth.uid() = extensionista_id
    AND EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND tipo IN ('admin', 'extensionista')
      AND ativo = true
    )
  );

-- Política: Extensionistas podem editar seus próprios casos
CREATE POLICY "casos_update_own" ON casos_inovacao
  FOR UPDATE USING (
    auth.uid() = extensionista_id
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND tipo = 'admin'
      AND ativo = true
    )
  );

-- Política: Extensionistas podem deletar seus próprios casos
CREATE POLICY "casos_delete_own" ON casos_inovacao
  FOR DELETE USING (
    auth.uid() = extensionista_id
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND tipo = 'admin'
      AND ativo = true
    )
  );

-- ============================================
-- POLÍTICAS - TABELAS RELACIONADAS
-- ============================================

-- Políticas para caso_imagens
CREATE POLICY "caso_imagens_select_public" ON caso_imagens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM casos_inovacao 
      WHERE id = caso_id 
      AND status_ativo = true
    )
  );

CREATE POLICY "caso_imagens_insert_owner" ON caso_imagens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM casos_inovacao 
      WHERE id = caso_id 
      AND extensionista_id = auth.uid()
    )
  );

-- Políticas para caso_parceiros
CREATE POLICY "caso_parceiros_select_public" ON caso_parceiros
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM casos_inovacao 
      WHERE id = caso_id 
      AND status_ativo = true
    )
  );

CREATE POLICY "caso_parceiros_insert_owner" ON caso_parceiros
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM casos_inovacao 
      WHERE id = caso_id 
      AND extensionista_id = auth.uid()
    )
  );

-- Políticas para caso_metricas
CREATE POLICY "caso_metricas_select_public" ON caso_metricas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM casos_inovacao 
      WHERE id = caso_id 
      AND status_ativo = true
    )
  );

CREATE POLICY "caso_metricas_insert_owner" ON caso_metricas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM casos_inovacao 
      WHERE id = caso_id 
      AND extensionista_id = auth.uid()
    )
  );

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_casos_updated_at BEFORE UPDATE ON casos_inovacao
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERIR DADOS INICIAIS DE EXEMPLO
-- ============================================

-- Criar usuário admin padrão (IMPORTANTE: Altere a senha depois!)
INSERT INTO usuarios (id, email, nome, tipo, instituicao, bio, ativo) 
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@observatorio-is.rj.gov.br',
  'Administrador do Sistema',
  'admin',
  'Observatório de Inovação Social RJ',
  'Administrador principal da plataforma do Observatório de Inovação Social do Rio de Janeiro.',
  true
) ON CONFLICT (email) DO NOTHING;

-- Criar alguns extensionistas de exemplo
INSERT INTO usuarios (email, nome, tipo, instituicao, telefone, bio) VALUES
  (
    'joao.silva@ufrj.br',
    'João Silva',
    'extensionista',
    'UFRJ - Universidade Federal do Rio de Janeiro',
    '(21) 98765-4321',
    'Professor e coordenador de projetos de extensão na área de desenvolvimento sustentável.'
  ),
  (
    'maria.santos@puc-rio.br',
    'Maria Santos',
    'extensionista',
    'PUC-Rio',
    '(21) 97654-3210',
    'Pesquisadora em inovação social e coordenadora de projetos comunitários.'
  ),
  (
    'pedro.costa@uerj.br',
    'Pedro Costa',
    'extensionista',
    'UERJ - Universidade do Estado do Rio de Janeiro',
    '(21) 96543-2109',
    'Especialista em tecnologias sociais e educação popular.'
  ),
  (
    'ana.oliveira@uff.br',
    'Ana Oliveira',
    'extensionista',
    'UFF - Universidade Federal Fluminense',
    '(21) 95432-1098',
    'Coordenadora de projetos de economia solidária e cooperativismo.'
  )
ON CONFLICT (email) DO NOTHING;

-- Inserir casos de inovação de exemplo
WITH ext_joao AS (SELECT id FROM usuarios WHERE email = 'joao.silva@ufrj.br'),
     ext_maria AS (SELECT id FROM usuarios WHERE email = 'maria.santos@puc-rio.br'),
     ext_pedro AS (SELECT id FROM usuarios WHERE email = 'pedro.costa@uerj.br'),
     ext_ana AS (SELECT id FROM usuarios WHERE email = 'ana.oliveira@uff.br')
INSERT INTO casos_inovacao (
  titulo, descricao, resumo, localizacao, bairro, categoria, 
  pessoas_impactadas, data_inicio, status, extensionista_id, tags
) VALUES
  (
    'Horta Comunitária Manguinhos',
    'Projeto de agricultura urbana que promove segurança alimentar e geração de renda para 50 famílias em situação de vulnerabilidade social no Complexo de Manguinhos. A horta ocupa um terreno de 2000m² e produz mensalmente cerca de 1 tonelada de alimentos orgânicos.',
    'Horta urbana comunitária para segurança alimentar e geração de renda.',
    'Complexo de Manguinhos',
    'Manguinhos',
    'Meio Ambiente',
    200,
    '2023-03-15',
    'ativo',
    (SELECT id FROM ext_joao),
    ARRAY['agricultura urbana', 'sustentabilidade', 'segurança alimentar', 'geração de renda']
  ),
  (
    'Alfabetização Digital para Idosos - Copacabana',
    'Programa de inclusão digital voltado para pessoas acima de 60 anos, oferecendo cursos gratuitos de informática básica, uso de smartphones e navegação segura na internet. As aulas acontecem 3 vezes por semana no Centro de Convivência de Copacabana.',
    'Cursos de tecnologia e inclusão digital para a terceira idade.',
    'Copacabana',
    'Copacabana',
    'Educação',
    150,
    '2023-01-10',
    'ativo',
    (SELECT id FROM ext_maria),
    ARRAY['inclusão digital', 'terceira idade', 'educação', 'tecnologia']
  ),
  (
    'Reciclagem e Arte na Rocinha',
    'Oficinas de artesanato utilizando materiais recicláveis, transformando resíduos em produtos comercializáveis. O projeto capacita jovens e adultos em técnicas de upcycling, promovendo consciência ambiental e geração de renda alternativa.',
    'Oficinas de artesanato com materiais recicláveis para geração de renda.',
    'Rocinha',
    'Rocinha',
    'Meio Ambiente',
    80,
    '2023-02-01',
    'ativo',
    (SELECT id FROM ext_pedro),
    ARRAY['reciclagem', 'artesanato', 'economia circular', 'capacitação profissional']
  ),
  (
    'Cooperativa de Costureiras da Maré',
    'Cooperativa de produção têxtil formada por mulheres da comunidade da Maré, produzindo uniformes escolares, roupas e acessórios. O projeto promove autonomia econômica e fortalecimento do empreendedorismo feminino local.',
    'Cooperativa têxtil de mulheres para geração de renda e autonomia.',
    'Complexo da Maré',
    'Maré',
    'Geração de Renda',
    45,
    '2022-11-20',
    'ativo',
    (SELECT id FROM ext_ana),
    ARRAY['cooperativismo', 'economia solidária', 'empoderamento feminino', 'moda sustentável']
  ),
  (
    'Biblioteca Comunitária Cidade de Deus',
    'Espaço de leitura e atividades culturais que oferece acesso gratuito a livros, contação de histórias, oficinas de escrita criativa e reforço escolar para crianças e adolescentes da comunidade.',
    'Biblioteca e centro cultural comunitário com atividades educativas.',
    'Cidade de Deus',
    'Jacarepaguá',
    'Educação',
    300,
    '2022-08-15',
    'ativo',
    (SELECT id FROM ext_joao),
    ARRAY['leitura', 'cultura', 'educação', 'literatura']
  ),
  (
    'Mutirão de Saúde Preventiva - Complexo do Alemão',
    'Ações mensais de saúde preventiva incluindo aferição de pressão, testes de glicemia, orientação nutricional e encaminhamento para serviços de saúde. Parceria com estudantes de medicina e enfermagem.',
    'Ações de saúde preventiva e orientação em comunidades.',
    'Complexo do Alemão',
    'Alemão',
    'Saúde',
    500,
    '2023-04-01',
    'ativo',
    (SELECT id FROM ext_maria),
    ARRAY['saúde preventiva', 'atenção primária', 'saúde comunitária']
  ),
  (
    'Cursinho Popular Pré-Vestibular - Centro',
    'Curso preparatório gratuito para o ENEM e vestibulares, atendendo jovens de baixa renda. As aulas acontecem aos sábados e incluem material didático, simulados e orientação vocacional.',
    'Preparatório gratuito para vestibular voltado a jovens de baixa renda.',
    'Centro',
    'Centro',
    'Educação',
    120,
    '2023-02-20',
    'ativo',
    (SELECT id FROM ext_pedro),
    ARRAY['educação', 'vestibular', 'inclusão educacional', 'juventude']
  ),
  (
    'Oficina de Música e Cidadania - Vigário Geral',
    'Projeto que oferece aulas gratuitas de instrumentos musicais, canto coral e teoria musical para crianças e adolescentes, utilizando a música como ferramenta de transformação social e desenvolvimento pessoal.',
    'Formação musical e cidadã para jovens através da música.',
    'Vigário Geral',
    'Vigário Geral',
    'Cultura',
    60,
    '2022-09-10',
    'ativo',
    (SELECT id FROM ext_ana),
    ARRAY['música', 'cultura', 'arte-educação', 'juventude']
  );

-- Inserir algumas métricas de exemplo
WITH caso_horta AS (SELECT id FROM casos_inovacao WHERE titulo LIKE 'Horta Comunitária%' LIMIT 1),
     caso_digital AS (SELECT id FROM casos_inovacao WHERE titulo LIKE 'Alfabetização Digital%' LIMIT 1)
INSERT INTO caso_metricas (caso_id, indicador, valor, unidade, periodo) VALUES
  ((SELECT id FROM caso_horta), 'Alimentos produzidos', '1000', 'kg', 'mensal'),
  ((SELECT id FROM caso_horta), 'Famílias atendidas', '50', 'famílias', 'atual'),
  ((SELECT id FROM caso_horta), 'Área cultivada', '2000', 'm²', 'atual'),
  ((SELECT id FROM caso_digital), 'Idosos formados', '85', 'pessoas', '2023'),
  ((SELECT id FROM caso_digital), 'Horas de aula', '240', 'horas', '2023'),
  ((SELECT id FROM caso_digital), 'Taxa de conclusão', '78', '%', '2023');

-- Inserir alguns parceiros de exemplo
WITH caso_horta AS (SELECT id FROM casos_inovacao WHERE titulo LIKE 'Horta Comunitária%' LIMIT 1)
INSERT INTO caso_parceiros (caso_id, nome, tipo, website) VALUES
  ((SELECT id FROM caso_horta), 'Fiocruz', 'universidade', 'https://www.fiocruz.br'),
  ((SELECT id FROM caso_horta), 'Embrapa', 'governo', 'https://www.embrapa.br'),
  ((SELECT id FROM caso_horta), 'Instituto Phi', 'ong', 'https://www.institutophi.org.br');

-- ============================================
-- MENSAGEM FINAL
-- ============================================

-- Se você chegou até aqui, o setup foi concluído com sucesso!
-- 
-- PRÓXIMOS PASSOS:
-- 1. Configure a autenticação no Supabase Auth
-- 2. Crie usuários de teste no painel Authentication
-- 3. Associe os usuários Auth aos registros da tabela 'usuarios' usando o mesmo ID
-- 4. Teste o login na aplicação
-- 
-- IMPORTANTE:
-- - Altere a senha do admin padrão
-- - Configure backup automático no Supabase
-- - Monitore o uso de RLS para garantir segurança
-- 
-- ============================================