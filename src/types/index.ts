export interface User {
  id: string;
  email: string;
  nome: string;
  tipo: 'admin' | 'extensionista' | 'pesquisador' | 'coordenador';
  instituicao?: string;
  telefone?: string;
  bio?: string;
  avatar_url?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  data_criacao?: string; // Para compatibilidade
}

export interface CasoInovacao {
  id: string;
  titulo: string;
  descricao: string;
  resumo?: string;
  localizacao: string;
  bairro?: string;
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
  contato_nome?: string;
  contato_email?: string;
  contato_telefone?: string;
  extensionista_id: string;
  status_ativo: boolean;
  visualizacoes?: number;
  created_at: string;
  updated_at: string;
  data_cadastro?: string; // Para compatibilidade
  extensionista?: User;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}