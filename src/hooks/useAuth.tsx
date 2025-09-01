import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, getOrCreateUser } from '../services/supabase';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 useAuth: Iniciando verificação de autenticação');
    
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
          const userData = await getOrCreateUser(session.user);
          console.log('👤 useAuth: Dados do usuário:', userData);
          setUser(userData);
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

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
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