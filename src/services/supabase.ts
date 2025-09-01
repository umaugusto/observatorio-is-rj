import { createClient } from '@supabase/supabase-js';
import type { User, CasoInovacao } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database interfaces matching Supabase tables
export interface DatabaseUser {
  id: string;
  email: string;
  nome: string;
  tipo: 'admin' | 'extensionista';
  instituicao?: string;
  telefone?: string;
  bio?: string;
  avatar_url?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCasoInovacao {
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
  pessoas_impactadas?: number;
  orcamento?: number;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  tags?: string[];
  contato_nome?: string;
  contato_email?: string;
  contato_telefone?: string;
  extensionista_id: string;
  status_ativo: boolean;
  visualizacoes?: number;
  created_at: string;
  updated_at: string;
}

// Database functions
export const getCasos = async (): Promise<CasoInovacao[]> => {
  const { data, error } = await supabase
    .from('casos_inovacao')
    .select(`
      *,
      extensionista:usuarios(*)
    `)
    .eq('status_ativo', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Mapear dados para manter compatibilidade
  return (data || []).map(caso => ({
    ...caso,
    data_cadastro: caso.created_at, // Para compatibilidade
    coordenadas_mapa: caso.coordenadas_lat && caso.coordenadas_lng ? {
      lat: caso.coordenadas_lat,
      lng: caso.coordenadas_lng
    } : undefined
  }));
};

export const getCasosByCategory = async (categoria: string): Promise<CasoInovacao[]> => {
  const { data, error } = await supabase
    .from('casos_inovacao')
    .select(`
      *,
      extensionista:usuarios(*)
    `)
    .eq('categoria', categoria)
    .eq('status_ativo', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Mapear dados para manter compatibilidade
  return (data || []).map(caso => ({
    ...caso,
    data_cadastro: caso.created_at, // Para compatibilidade
    coordenadas_mapa: caso.coordenadas_lat && caso.coordenadas_lng ? {
      lat: caso.coordenadas_lat,
      lng: caso.coordenadas_lng
    } : undefined
  }));
};

export const getUser = async (userId: string): Promise<User | null> => {
  console.log('🔍 getUser: Buscando usuário com ID:', userId);
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('❌ getUser: Erro ao buscar usuário:', error);
    console.error('❌ getUser: Código do erro:', error.code);
    console.error('❌ getUser: Mensagem:', error.message);
    
    // Se o erro for "row not found", é diferente de erro de conexão
    if (error.code === 'PGRST116') {
      console.warn('⚠️ getUser: Usuário não encontrado na tabela usuarios. Isso pode ser normal.');
      return null;
    }
    
    throw error; // Re-throw outros erros
  }
  
  console.log('✅ getUser: Usuário encontrado:', { id: data.id, email: data.email, tipo: data.tipo });
  
  // Mapear dados para manter compatibilidade
  return data ? {
    ...data,
    data_criacao: data.created_at // Para compatibilidade
  } : null;
};

// Nova função para criar usuário automaticamente se não existir
export const createUserFromAuth = async (authUser: any): Promise<User> => {
  console.log('🆕 createUserFromAuth: Criando usuário para:', authUser.email);
  
  const userData = {
    id: authUser.id,
    email: authUser.email,
    nome: authUser.email.split('@')[0] || 'Usuário',
    tipo: 'extensionista' as const,
    instituicao: authUser.email.includes('@') ? authUser.email.split('@')[1] : null,
    ativo: true
  };

  const { data, error } = await supabase
    .from('usuarios')
    .insert([userData])
    .select()
    .single();

  if (error) {
    console.error('❌ createUserFromAuth: Erro ao criar usuário:', error);
    throw error;
  }

  console.log('✅ createUserFromAuth: Usuário criado com sucesso:', data.email);
  
  return {
    ...data,
    data_criacao: data.created_at
  };
};

// Função para obter ou criar usuário
export const getOrCreateUser = async (authUser: any): Promise<User | null> => {
  try {
    // Primeiro tenta buscar o usuário existente
    const existingUser = await getUser(authUser.id);
    if (existingUser) {
      return existingUser;
    }
    
    // Se não encontrar, cria automaticamente
    console.log('👤 getOrCreateUser: Usuário não existe, criando automaticamente...');
    return await createUserFromAuth(authUser);
    
  } catch (error) {
    console.error('❌ getOrCreateUser: Erro geral:', error);
    return null;
  }
};