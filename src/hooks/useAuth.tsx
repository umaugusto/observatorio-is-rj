import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, getOrCreateUser, setDemoMode } from '../services/supabase';
import { demoUser } from '../services/demoData';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 useAuth: Iniciando verificação de autenticação');
    
    // Debug: verificar localStorage
    const supabaseAuth = localStorage.getItem('sb-vpdtoxesovtplyowquyh-auth-token');
    console.log('🔍 useAuth: LocalStorage auth token exists:', !!supabaseAuth);
    if (supabaseAuth) {
      try {
        const parsed = JSON.parse(supabaseAuth);
        console.log('🔍 useAuth: Token expires at:', new Date(parsed.expires_at * 1000));
        console.log('🔍 useAuth: Current time:', new Date());
      } catch (e) {
        console.log('🔍 useAuth: Erro ao parsear token do localStorage');
      }
    }
    
    // Verificar sessão existente
    const getInitialSession = async () => {
      try {
        console.log('🔍 useAuth: Verificando sessão existente...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ useAuth: Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('✅ useAuth: Sessão encontrada para:', session.user.email);
          console.log('📅 useAuth: Sessão expira em:', new Date(session.expires_at! * 1000));
          
          try {
            const userData = await getOrCreateUser(session.user);
            console.log('👤 useAuth: Dados do usuário:', userData);
            setUser(userData);
          } catch (userError) {
            console.error('❌ useAuth: Erro ao buscar dados do usuário:', userError);
            // Manter usuário logado mesmo se houver erro ao buscar dados
            setUser({
              id: session.user.id,
              email: session.user.email!,
              nome: session.user.email!.split('@')[0],
              tipo: 'extensionista',
              ativo: true,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at
            } as any);
          }
        } else {
          console.log('ℹ️ useAuth: Nenhuma sessão ativa encontrada');
        }
      } catch (error) {
        console.error('❌ useAuth: Erro na verificação inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças na autenticação
    console.log('👂 useAuth: Configurando listener de mudanças de auth...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 useAuth: Mudança de auth detectada:', event, session?.user?.email);
        
        try {
          if (session?.user) {
            console.log('✅ useAuth: Login detectado para:', session.user.email);
            const userData = await getOrCreateUser(session.user);
            console.log('👤 useAuth: Usuário configurado:', userData);
            setUser(userData);
          } else {
            console.log('🚪 useAuth: Logout detectado');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ useAuth: Erro no listener:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 signIn: Tentando login para:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ signIn: Erro no login:', error);
      throw error;
    }
    
    console.log('✅ signIn: Login bem-sucedido para:', email);
    console.log('📊 signIn: Session data:', data.session?.user?.id);
  };

  const signInDemo = async () => {
    console.log('🎭 signInDemo: Iniciando modo demonstração');
    setLoading(true);
    
    try {
      // Simular delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ativar modo demo
      setDemoMode(true);
      
      // Definir usuário de demonstração
      setUser(demoUser);
      console.log('✅ signInDemo: Modo demo ativado para:', demoUser.nome);
    } catch (error) {
      console.error('❌ signInDemo: Erro no modo demo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Se for usuário demo, fazer logout direto
    if (user?.isDemo) {
      console.log('🎭 signOut: Saindo do modo demo');
      setDemoMode(false);
      setUser(null);
      return;
    }
    
    // Logout normal do Supabase
    setDemoMode(false);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signInDemo,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};