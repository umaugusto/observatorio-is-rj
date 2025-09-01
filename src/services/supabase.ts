import { createClient } from '@supabase/supabase-js';
import type { User, CasoInovacao, ContactMessage, ContactMessageInput } from '../types';
import { DemoInterceptor } from './demoInterceptor';

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

// Helper function to check if current user is in demo mode
const isDemoMode = (): boolean => {
  // Check if there's a demo user in localStorage or session
  try {
    const demoFlag = localStorage.getItem('demo-mode');
    return demoFlag === 'true';
  } catch {
    return false;
  }
};

// Set demo mode flag
export const setDemoMode = (isDemo: boolean): void => {
  try {
    if (isDemo) {
      localStorage.setItem('demo-mode', 'true');
    } else {
      localStorage.removeItem('demo-mode');
    }
  } catch (error) {
    console.error('Error setting demo mode:', error);
  }
};

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
  pessoas_impactadas?: number;
  orcamento?: number;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
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
}

// Database functions
export const getCasos = async (): Promise<CasoInovacao[]> => {
  if (isDemoMode()) {
    return DemoInterceptor.getCasos();
  }
  const { data, error } = await supabase
    .from('casos_inovacao')
    .select(`
      *,
      extensionista:usuarios(*)
    `)
    .eq('status_ativo', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Imagens de exemplo por categoria (usadas quando não há imagem)
  const categoryImages: Record<string, string> = {
    'Educação': 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&h=600&fit=crop&crop=center',
    'Saúde': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center',
    'Meio Ambiente': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
    'Cultura': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&crop=center',
    'Tecnologia': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    'Empreendedorismo': 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=600&fit=crop&crop=center',
    'Inclusão Social': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop&crop=center',
    'Urbanismo': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=center',
    'Alimentação': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop&crop=center',
    'Esporte': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
  };
  
  // Mapear dados para manter compatibilidade e adicionar imagens
  return (data || []).map(caso => ({
    ...caso,
    data_cadastro: caso.created_at, // Para compatibilidade
    coordenadas_mapa: caso.coordenadas_lat && caso.coordenadas_lng ? {
      lat: caso.coordenadas_lat,
      lng: caso.coordenadas_lng
    } : undefined,
    // Garantir que sempre tenha uma imagem
    imagem_url: caso.imagem_url || categoryImages[caso.categoria] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&crop=center',
    // Garantir que tenha resumo
    resumo: caso.resumo || (caso.descricao ? caso.descricao.substring(0, 120) + '...' : 'Resumo não disponível')
  }));
};

export const getCasosByCategory = async (categoria: string): Promise<CasoInovacao[]> => {
  if (isDemoMode()) {
    return DemoInterceptor.getCasosByCategory(categoria);
  }
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
  
  // Mesmas imagens da função getCasos para consistência
  const categoryImages: Record<string, string> = {
    'Educação': 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&h=600&fit=crop&crop=center',
    'Saúde': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center',
    'Meio Ambiente': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
    'Cultura': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&crop=center',
    'Tecnologia': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    'Empreendedorismo': 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=600&fit=crop&crop=center',
    'Inclusão Social': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop&crop=center',
    'Urbanismo': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=center',
    'Alimentação': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop&crop=center',
    'Esporte': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
  };
  
  // Mapear dados para manter compatibilidade
  return (data || []).map(caso => ({
    ...caso,
    data_cadastro: caso.created_at, // Para compatibilidade
    coordenadas_mapa: caso.coordenadas_lat && caso.coordenadas_lng ? {
      lat: caso.coordenadas_lat,
      lng: caso.coordenadas_lng
    } : undefined,
    // Garantir que sempre tenha uma imagem
    imagem_url: caso.imagem_url || categoryImages[caso.categoria] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&crop=center',
    // Garantir que tenha resumo
    resumo: caso.resumo || (caso.descricao ? caso.descricao.substring(0, 120) + '...' : 'Resumo não disponível')
  }));
};

export const getUser = async (userId: string): Promise<User | null> => {
  if (isDemoMode()) {
    return DemoInterceptor.getUser(userId);
  }
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
  if (isDemoMode()) {
    return DemoInterceptor.getAllUsers();
  }
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
  if (isDemoMode()) {
    return DemoInterceptor.createNewUser(userData);
  }
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
  if (isDemoMode()) {
    return DemoInterceptor.updateUser(userId, updates);
  }
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
  if (isDemoMode()) {
    return DemoInterceptor.deleteUser(userId);
  }
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
  if (isDemoMode()) {
    await DemoInterceptor.toggleUserStatus(userId);
    const user = await DemoInterceptor.getUser(userId);
    return user || {} as User;
  }
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
  if (isDemoMode()) {
    return DemoInterceptor.uploadAvatar(userId, file);
  }
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
  if (isDemoMode()) {
    return DemoInterceptor.uploadAvatarOnly(file);
  }
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
  if (isDemoMode()) {
    return DemoInterceptor.deleteAvatar(userId, currentAvatarUrl);
  }
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

// ============================================================================
// FUNÇÕES PARA GERENCIAMENTO DE CASOS
// ============================================================================

export const getAllCasos = async (): Promise<CasoInovacao[]> => {
  console.log('📋 getAllCasos: Buscando todos os casos...');
  
  const { data, error } = await supabase
    .from('casos_inovacao')
    .select(`
      *,
      extensionista:usuarios(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ getAllCasos: Erro ao buscar casos:', error);
    throw error;
  }
  
  console.log('✅ getAllCasos: Encontrados', data?.length || 0, 'casos');
  
  // Mesmas imagens para consistência
  const categoryImages: Record<string, string> = {
    'Educação': 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&h=600&fit=crop&crop=center',
    'Saúde': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center',
    'Meio Ambiente': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
    'Cultura': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&crop=center',
    'Tecnologia': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    'Empreendedorismo': 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=600&fit=crop&crop=center',
    'Inclusão Social': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop&crop=center',
    'Urbanismo': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=center',
    'Alimentação': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop&crop=center',
    'Esporte': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
  };
  
  return (data || []).map(caso => ({
    ...caso,
    data_cadastro: caso.created_at,
    coordenadas_mapa: caso.coordenadas_lat && caso.coordenadas_lng ? {
      lat: caso.coordenadas_lat,
      lng: caso.coordenadas_lng
    } : undefined,
    // Garantir que sempre tenha uma imagem
    imagem_url: caso.imagem_url || categoryImages[caso.categoria] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&crop=center',
    // Garantir que tenha resumo
    resumo: caso.resumo || (caso.descricao ? caso.descricao.substring(0, 120) + '...' : 'Resumo não disponível')
  }));
};

export const getCasoById = async (casoId: string): Promise<CasoInovacao | null> => {
  if (isDemoMode()) {
    return DemoInterceptor.getCasoById(casoId);
  }
  console.log('🔍 getCasoById: Buscando caso com ID:', casoId);
  
  const { data, error } = await supabase
    .from('casos_inovacao')
    .select(`
      *,
      extensionista:usuarios(*)
    `)
    .eq('id', casoId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.warn('⚠️ getCasoById: Caso não encontrado:', casoId);
      return null;
    }
    console.error('❌ getCasoById: Erro ao buscar caso:', error);
    throw error;
  }
  
  console.log('✅ getCasoById: Caso encontrado:', data.titulo);
  
  // Mesmas imagens para consistência
  const categoryImages: Record<string, string> = {
    'Educação': 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&h=600&fit=crop&crop=center',
    'Saúde': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center',
    'Meio Ambiente': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
    'Cultura': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&crop=center',
    'Tecnologia': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    'Empreendedorismo': 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=600&fit=crop&crop=center',
    'Inclusão Social': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop&crop=center',
    'Urbanismo': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=center',
    'Alimentação': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop&crop=center',
    'Esporte': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
  };
  
  return {
    ...data,
    data_cadastro: data.created_at,
    coordenadas_mapa: data.coordenadas_lat && data.coordenadas_lng ? {
      lat: data.coordenadas_lat,
      lng: data.coordenadas_lng
    } : undefined,
    // Garantir que sempre tenha uma imagem
    imagem_url: data.imagem_url || categoryImages[data.categoria] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&crop=center',
    // Garantir que tenha resumo
    resumo: data.resumo || (data.descricao ? data.descricao.substring(0, 120) + '...' : 'Resumo não disponível')
  };
};

export const createCaso = async (casoData: Omit<DatabaseCasoInovacao, 'id' | 'created_at' | 'updated_at'>): Promise<CasoInovacao> => {
  if (isDemoMode()) {
    return DemoInterceptor.createCaso(casoData);
  }
  console.log('🆕 createCaso: Criando caso:', casoData.titulo);
  
  const { data, error } = await supabase
    .from('casos_inovacao')
    .insert([casoData])
    .select(`
      *,
      extensionista:usuarios(*)
    `)
    .single();

  if (error) {
    console.error('❌ createCaso: Erro ao criar caso:', error);
    throw error;
  }

  console.log('✅ createCaso: Caso criado com sucesso:', data.titulo);
  
  return {
    ...data,
    data_cadastro: data.created_at,
    coordenadas_mapa: data.coordenadas_lat && data.coordenadas_lng ? {
      lat: data.coordenadas_lat,
      lng: data.coordenadas_lng
    } : undefined
  };
};

export const updateCaso = async (casoId: string, updates: Partial<DatabaseCasoInovacao>): Promise<CasoInovacao> => {
  if (isDemoMode()) {
    return DemoInterceptor.updateCaso(casoId, updates);
  }
  console.log('✏️ updateCaso: Atualizando caso:', casoId);
  
  // Remove campos que não devem ser atualizados
  const { id, created_at, updated_at, ...validUpdates } = updates;
  
  const { data, error } = await supabase
    .from('casos_inovacao')
    .update(validUpdates)
    .eq('id', casoId)
    .select(`
      *,
      extensionista:usuarios(*)
    `);

  if (error) {
    console.error('❌ updateCaso: Erro ao atualizar caso:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('Caso não encontrado ou não foi possível atualizar');
  }

  const updatedCaso = data[0];
  console.log('✅ updateCaso: Caso atualizado com sucesso:', updatedCaso.titulo);
  
  return {
    ...updatedCaso,
    data_cadastro: updatedCaso.created_at,
    coordenadas_mapa: updatedCaso.coordenadas_lat && updatedCaso.coordenadas_lng ? {
      lat: updatedCaso.coordenadas_lat,
      lng: updatedCaso.coordenadas_lng
    } : undefined
  };
};

export const deleteCaso = async (casoId: string): Promise<void> => {
  if (isDemoMode()) {
    return DemoInterceptor.deleteCaso(casoId);
  }
  console.log('🗑️ deleteCaso: Removendo caso:', casoId);
  
  const { error } = await supabase
    .from('casos_inovacao')
    .delete()
    .eq('id', casoId);

  if (error) {
    console.error('❌ deleteCaso: Erro ao remover caso:', error);
    throw error;
  }

  console.log('✅ deleteCaso: Caso removido com sucesso');
};

export const toggleCasoStatus = async (casoId: string, statusAtivo: boolean): Promise<CasoInovacao> => {
  console.log('🔄 toggleCasoStatus: Alterando status do caso:', casoId, 'para', statusAtivo);
  
  const { data, error } = await supabase
    .from('casos_inovacao')
    .update({ status_ativo: statusAtivo })
    .eq('id', casoId)
    .select(`
      *,
      extensionista:usuarios(*)
    `)
    .single();

  if (error) {
    console.error('❌ toggleCasoStatus: Erro ao alterar status:', error);
    throw error;
  }

  console.log('✅ toggleCasoStatus: Status alterado com sucesso');
  
  return {
    ...data,
    data_cadastro: data.created_at,
    coordenadas_mapa: data.coordenadas_lat && data.coordenadas_lng ? {
      lat: data.coordenadas_lat,
      lng: data.coordenadas_lng
    } : undefined
  };
};

// Funções para upload de imagens de casos
export const uploadCaseImage = async (file: File, casoId?: string): Promise<string> => {
  console.log('📸 uploadCaseImage: Fazendo upload de imagem do caso');
  
  // Validar arquivo
  if (file.size > 1 * 1024 * 1024) { // 1MB
    throw new Error('Arquivo muito grande. Máximo 1MB.');
  }
  
  if (!file.type.startsWith('image/')) {
    throw new Error('Apenas imagens são permitidas.');
  }
  
  // Gerar nome único para o arquivo
  const fileExt = file.name.split('.').pop();
  const tempId = casoId || 'temp-' + Date.now();
  const fileName = `${tempId}-${Date.now()}.${fileExt}`;
  const filePath = `casos/${fileName}`;
  
  // Upload para o storage
  const { error: uploadError } = await supabase.storage
    .from('case-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (uploadError) {
    console.error('❌ uploadCaseImage: Erro no upload:', uploadError);
    throw uploadError;
  }
  
  // Obter URL pública
  const { data } = supabase.storage
    .from('case-images')
    .getPublicUrl(filePath);
    
  console.log('✅ uploadCaseImage: Imagem enviada com sucesso:', data.publicUrl);
  return data.publicUrl;
};

export const deleteCaseImage = async (imageUrl: string): Promise<void> => {
  console.log('🗑️ deleteCaseImage: Removendo imagem do caso');
  
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const filePath = `casos/${fileName}`;
    
    // Remover arquivo do storage
    const { error: deleteError } = await supabase.storage
      .from('case-images')
      .remove([filePath]);
      
    if (deleteError) {
      console.warn('⚠️ deleteCaseImage: Erro ao remover arquivo do storage:', deleteError);
    }
  } catch (error) {
    console.warn('⚠️ deleteCaseImage: Erro ao processar URL da imagem:', error);
  }
  
  console.log('✅ deleteCaseImage: Imagem removida com sucesso');
};

// ========================== CONTACT MESSAGES ==========================

export const createContactMessage = async (messageData: ContactMessageInput): Promise<ContactMessage> => {
  if (isDemoMode()) {
    await DemoInterceptor.createContactMessage(messageData);
    // Return a mock response since demo doesn't actually create
    return {
      id: `demo-msg-${Date.now()}`,
      ...messageData,
      status: 'pendente' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  console.log('📬 createContactMessage: Criando mensagem de contato de:', messageData.email);
  
  const { data, error } = await supabase
    .from('mensagens_contato')
    .insert([{
      ...messageData,
      status: 'pendente'
    }])
    .select('*')
    .single();

  if (error) {
    console.error('❌ createContactMessage: Erro ao criar mensagem:', error);
    throw error;
  }

  console.log('✅ createContactMessage: Mensagem criada com sucesso:', data.assunto);
  return data;
};

export const getAllMessages = async (): Promise<ContactMessage[]> => {
  if (isDemoMode()) {
    return DemoInterceptor.getAllMessages();
  }
  console.log('📋 getAllMessages: Buscando todas as mensagens de contato');
  
  const { data, error } = await supabase
    .from('mensagens_contato')
    .select(`
      *,
      extensionista:usuarios!mensagens_contato_respondido_por_fkey(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ getAllMessages: Erro ao buscar mensagens:', error);
    throw error;
  }

  console.log('✅ getAllMessages: Encontradas', data.length, 'mensagens');
  return data || [];
};

export const updateMessageStatus = async (messageId: string, status: 'lido' | 'respondido', userId?: string, resposta?: string): Promise<ContactMessage> => {
  if (isDemoMode()) {
    await DemoInterceptor.updateMessageStatus(messageId, status);
    // Return mock updated message
    const messages = await DemoInterceptor.getAllMessages();
    return messages.find(m => m.id === messageId) || {} as ContactMessage;
  }
  console.log('✏️ updateMessageStatus: Atualizando status da mensagem:', messageId, 'para', status);
  
  const updateData: any = { status };
  
  if (userId) {
    updateData.respondido_por = userId;
  }
  
  if (resposta) {
    updateData.resposta = resposta;
  }
  
  const { data, error } = await supabase
    .from('mensagens_contato')
    .update(updateData)
    .eq('id', messageId)
    .select(`
      *,
      extensionista:usuarios!mensagens_contato_respondido_por_fkey(*)
    `)
    .single();

  if (error) {
    console.error('❌ updateMessageStatus: Erro ao atualizar status:', error);
    throw error;
  }

  console.log('✅ updateMessageStatus: Status atualizado com sucesso');
  return data;
};

export const getUnreadMessagesCount = async (): Promise<number> => {
  if (isDemoMode()) {
    return DemoInterceptor.getUnreadMessagesCount();
  }
  console.log('🔍 getUnreadMessagesCount: Contando mensagens não lidas');
  
  const { count, error } = await supabase
    .from('mensagens_contato')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pendente');

  if (error) {
    console.error('❌ getUnreadMessagesCount: Erro ao contar mensagens:', error);
    throw error;
  }

  const unreadCount = count || 0;
  console.log('✅ getUnreadMessagesCount:', unreadCount, 'mensagens não lidas');
  return unreadCount;
};