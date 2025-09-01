export interface User {
  id: string;
  email: string;
  nome: string;
  tipo: 'extensionista' | 'pesquisador' | 'coordenador' | 'demo';
  is_admin?: boolean; // Flag para identificar se o usuário tem permissões administrativas
  is_root?: boolean; // Flag para identificar o usuário root do sistema
  instituicao?: string;
  telefone?: string;
  bio?: string;
  avatar_url?: string | null;
  ativo: boolean;
  must_change_password?: boolean; // Flag para forçar troca de senha no primeiro acesso
  created_at: string;
  updated_at: string;
  data_criacao?: string; // Para compatibilidade
  isDemo?: boolean; // Flag para identificar usuário de demonstração
}

export interface CasoInovacao {
  id: string;
  titulo: string;
  descricao: string;
  resumo?: string;
  // Campos de localização atualizados
  cidade?: string;
  estado?: string;
  bairro?: string;
  cep?: string;
  localizacao?: string; // Para compatibilidade com dados antigos
  categoria: string;
  subcategoria?: string;
  imagem_url?: string;
  link_projeto?: string;
  video_url?: string;
  coordenadas_lat?: number;
  coordenadas_lng?: number;
  coordenadas_mapa?: {
    lat: number;
    lng: number;
  }; // Para compatibilidade
  pessoas_impactadas?: number;
  orcamento?: number;
  data_inicio?: string;
  data_fim?: string;
  status?: 'planejamento' | 'ativo' | 'concluido' | 'pausado';
  tags?: string[];
  // Campos da equipe do projeto
  contato_nome?: string;
  contato_email?: string;
  contato_telefone?: string;
  // Redes sociais
  instagram_url?: string;
  facebook_url?: string;
  whatsapp?: string;
  extensionista_id: string;
  status_ativo: boolean;
  visualizacoes?: number;
  created_at: string;
  updated_at: string;
  data_cadastro?: string; // Para compatibilidade
  extensionista?: User;
}

export interface ContactMessage {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
  tipo_solicitacao: 'acesso' | 'duvida' | 'sugestao' | 'outro';
  status: 'pendente' | 'lido' | 'respondido';
  respondido_por?: string;
  resposta?: string;
  created_at: string;
  updated_at: string;
  extensionista?: User; // Para quando carregamos dados do extensionista que respondeu
}

export interface ContactMessageInput {
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
  tipo_solicitacao: 'acesso' | 'duvida' | 'sugestao' | 'outro';
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
}