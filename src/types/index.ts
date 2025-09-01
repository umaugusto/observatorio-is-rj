export interface User {
  id: string;
  email: string;
  nome: string;
  tipo: 'admin' | 'extensionista';
  data_criacao: string;
}

export interface CasoInovacao {
  id: string;
  titulo: string;
  descricao: string;
  localizacao: string;
  categoria: string;
  extensionista_id: string;
  imagem_url?: string;
  coordenadas_mapa?: {
    lat: number;
    lng: number;
  };
  data_cadastro: string;
  status_ativo: boolean;
  extensionista?: User;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}