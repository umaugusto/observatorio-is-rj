import { createClient } from '@supabase/supabase-js';
import type { User, CasoInovacao } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true
  }
});

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
  
  // Criar uma Promise com timeout mais rápido para produção
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      console.error('⏰ getUser: TIMEOUT após 5 segundos');
      reject(new Error('Timeout: Query demorou mais de 5 segundos'));
    }, 5000);
  });

  try {
    console.log('🚀 getUser: Iniciando query no Supabase...');
    
    const queryPromise = supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log('⏳ getUser: Query criada, aguardando resposta...');
    
    // Race entre a query e o timeout
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    console.log('📦 getUser: Resposta recebida do Supabase');
    console.log('📊 getUser: Data:', data ? 'existe' : 'null');
    console.log('❌ getUser: Error:', error ? error.code + ': ' + error.message : 'null');

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
    
  } catch (error: any) {
    console.error('💥 getUser: Erro capturado na função:', error);
    
    if (error.message?.includes('Timeout')) {
      console.error('⏰ getUser: Query demorou muito - possível problema de conexão');
      throw new Error('Problema de conexão com o banco de dados');
    }
    
    throw error;
  }
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

// Funções para gerenciamento de usuários (admin)
export const getAllUsers = async (): Promise<User[]> => {
  console.log('📋 getAllUsers: Buscando todos os usuários...');
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ getAllUsers: Erro ao buscar usuários:', error);
    throw error;
  }
  
  console.log('✅ getAllUsers: Encontrados', data?.length || 0, 'usuários');
  
  return (data || []).map(user => ({
    ...user,
    data_criacao: user.created_at
  }));
};

export const createNewUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'data_criacao'>): Promise<User> => {
  console.log('🆕 createNewUser: Criando usuário:', userData.email);
  
  const { data, error } = await supabase
    .from('usuarios')
    .insert([userData])
    .select()
    .single();

  if (error) {
    console.error('❌ createNewUser: Erro ao criar usuário:', error);
    throw error;
  }

  console.log('✅ createNewUser: Usuário criado com sucesso:', data.email);
  
  return {
    ...data,
    data_criacao: data.created_at
  };
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  console.log('✏️ updateUser: Atualizando usuário:', userId);
  
  // Remove campos que não devem ser atualizados
  const { id, created_at, updated_at, data_criacao, ...validUpdates } = updates;
  
  const { data, error } = await supabase
    .from('usuarios')
    .update(validUpdates)
    .eq('id', userId)
    .select();

  if (error) {
    console.error('❌ updateUser: Erro ao atualizar usuário:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('Usuário não encontrado ou não foi possível atualizar');
  }

  const updatedUser = data[0]; // Pegar primeiro (e único) resultado
  console.log('✅ updateUser: Usuário atualizado com sucesso:', updatedUser.email);
  
  return {
    ...updatedUser,
    data_criacao: updatedUser.created_at
  };
};

export const deleteUser = async (userId: string): Promise<void> => {
  console.log('🗑️ deleteUser: Removendo usuário:', userId);
  
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('❌ deleteUser: Erro ao remover usuário:', error);
    throw error;
  }

  console.log('✅ deleteUser: Usuário removido com sucesso');
};

export const toggleUserStatus = async (userId: string, ativo: boolean): Promise<User> => {
  console.log('🔄 toggleUserStatus: Alterando status do usuário:', userId, 'para', ativo);
  
  const { data, error } = await supabase
    .from('usuarios')
    .update({ ativo })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('❌ toggleUserStatus: Erro ao alterar status:', error);
    throw error;
  }

  console.log('✅ toggleUserStatus: Status alterado com sucesso');
  
  return {
    ...data,
    data_criacao: data.created_at
  };
};

export const resetUserPassword = async (email: string): Promise<void> => {
  console.log('🔑 resetUserPassword: Enviando email de reset para:', email);
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    console.error('❌ resetUserPassword: Erro ao enviar email de reset:', error);
    throw error;
  }

  console.log('✅ resetUserPassword: Email de reset enviado com sucesso');
};

// Funções para gerenciamento de avatares
export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  console.log('📸 uploadAvatar: Fazendo upload de avatar para usuário:', userId);
  
  // Validar arquivo
  if (file.size > 2 * 1024 * 1024) { // 2MB
    throw new Error('Arquivo muito grande. Máximo 2MB.');
  }
  
  if (!file.type.startsWith('image/')) {
    throw new Error('Apenas imagens são permitidas.');
  }
  
  // Gerar nome único para o arquivo
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  
  console.log('📁 uploadAvatar: Fazendo upload para path:', filePath);
  
  // Upload para o storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (uploadError) {
    console.error('❌ uploadAvatar: Erro no upload:', uploadError);
    throw new Error(`Erro no upload: ${uploadError.message}`);
  }
  
  // Obter URL pública
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
    
  const avatarUrl = data.publicUrl;
  console.log('🔗 uploadAvatar: URL gerada:', avatarUrl);
  
  // Atualizar URL do avatar no banco APENAS se o usuário existir
  if (!userId.startsWith('temp-')) {
    try {
      console.log('💾 uploadAvatar: Atualizando URL no banco...');
      await updateUser(userId, { avatar_url: avatarUrl });
      console.log('✅ uploadAvatar: Avatar URL atualizada no banco');
    } catch (error) {
      console.error('❌ uploadAvatar: Erro ao atualizar banco:', error);
      throw new Error(`Upload realizado, mas erro ao atualizar perfil: ${(error as any).message}`);
    }
  }
  
  console.log('✅ uploadAvatar: Avatar enviado com sucesso:', avatarUrl);
  return avatarUrl;
};

// Nova função apenas para upload sem atualizar banco
export const uploadAvatarOnly = async (file: File, userId?: string): Promise<string> => {
  console.log('📸 uploadAvatarOnly: Fazendo upload de avatar');
  
  // Validar arquivo
  if (file.size > 2 * 1024 * 1024) { // 2MB
    throw new Error('Arquivo muito grande. Máximo 2MB.');
  }
  
  if (!file.type.startsWith('image/')) {
    throw new Error('Apenas imagens são permitidas.');
  }
  
  // Gerar nome único para o arquivo
  const fileExt = file.name.split('.').pop();
  const tempId = userId || 'temp-' + Date.now();
  const fileName = `${tempId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  
  // Upload para o storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (uploadError) {
    console.error('❌ uploadAvatarOnly: Erro no upload:', uploadError);
    throw uploadError;
  }
  
  // Obter URL pública
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
    
  console.log('✅ uploadAvatarOnly: Avatar enviado com sucesso:', data.publicUrl);
  return data.publicUrl;
};

export const deleteAvatar = async (userId: string, currentAvatarUrl?: string): Promise<void> => {
  console.log('🗑️ deleteAvatar: Removendo avatar do usuário:', userId);
  
  // Extrair caminho do arquivo da URL se fornecida
  if (currentAvatarUrl) {
    try {
      const url = new URL(currentAvatarUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `avatars/${fileName}`;
      
      // Remover arquivo do storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);
        
      if (deleteError) {
        console.warn('⚠️ deleteAvatar: Erro ao remover arquivo do storage:', deleteError);
        // Não throw error aqui, pois queremos limpar o avatar_url mesmo se o arquivo não existir
      }
    } catch (error) {
      console.warn('⚠️ deleteAvatar: Erro ao processar URL do avatar:', error);
    }
  }
  
  // Limpar avatar_url no banco
  await updateUser(userId, { avatar_url: null });
  
  console.log('✅ deleteAvatar: Avatar removido com sucesso');
};