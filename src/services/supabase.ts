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
  data_criacao: string;
}

export interface DatabaseCasoInovacao {
  id: string;
  titulo: string;
  descricao: string;
  localizacao: string;
  categoria: string;
  extensionista_id: string;
  imagem_url: string | null;
  coordenadas_mapa: { lat: number; lng: number } | null;
  data_cadastro: string;
  status_ativo: boolean;
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
    .order('data_cadastro', { ascending: false });

  if (error) throw error;
  return data || [];
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
    .order('data_cadastro', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getUser = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
  
  return data;
};