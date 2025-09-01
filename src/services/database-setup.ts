import { supabase } from './supabase';

export interface SetupResult {
  success: boolean;
  message: string;
  details?: any;
  error?: any;
}

export interface DatabaseStatus {
  isConfigured: boolean;
  hasUsuarios: boolean;
  hasCasos: boolean;
  userCount?: number;
  caseCount?: number;
  error?: any;
}

/**
 * Verifica se o banco de dados está configurado corretamente
 */
export const checkDatabaseSetup = async (): Promise<DatabaseStatus> => {
  const status: DatabaseStatus = {
    isConfigured: false,
    hasUsuarios: false,
    hasCasos: false,
  };

  try {
    // Verificar tabela usuarios
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id', { count: 'exact', head: true });

    if (!usuariosError) {
      status.hasUsuarios = true;
      status.userCount = usuarios?.length || 0;
    }

    // Verificar tabela casos_inovacao
    const { data: casos, error: casosError } = await supabase
      .from('casos_inovacao')
      .select('id', { count: 'exact', head: true });

    if (!casosError) {
      status.hasCasos = true;
      status.caseCount = casos?.length || 0;
    }

    // Banco está configurado se ambas as tabelas existem
    status.isConfigured = status.hasUsuarios && status.hasCasos;

    return status;
  } catch (error) {
    console.error('Erro ao verificar configuração do banco:', error);
    return {
      ...status,
      error,
    };
  }
};

/**
 * Verifica se existe pelo menos um usuário admin
 */
export const checkAdminExists = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('tipo', 'admin')
      .eq('ativo', true)
      .limit(1);

    return !error && data && data.length > 0;
  } catch {
    return false;
  }
};

/**
 * Retorna estatísticas básicas do banco
 */
export const getDatabaseStats = async () => {
  try {
    const [usuariosResult, casosResult, categoriasResult] = await Promise.all([
      supabase.from('usuarios').select('*', { count: 'exact', head: true }),
      supabase.from('casos_inovacao').select('*', { count: 'exact', head: true }),
      supabase.from('casos_inovacao').select('categoria').eq('status_ativo', true),
    ]);

    const categorias = new Set(
      categoriasResult.data?.map((item: any) => item.categoria) || []
    );

    return {
      totalUsuarios: usuariosResult.count || 0,
      totalCasos: casosResult.count || 0,
      totalCategorias: categorias.size,
      success: true,
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      totalUsuarios: 0,
      totalCasos: 0,
      totalCategorias: 0,
      success: false,
      error,
    };
  }
};

/**
 * Função para orientar o usuário sobre o setup
 * Como não podemos executar DDL via client, retornamos instruções
 */
export const getSetupInstructions = (): SetupResult => {
  return {
    success: false,
    message: 'Execute o script SQL no Supabase Dashboard',
    details: {
      steps: [
        {
          step: 1,
          title: 'Acesse o Supabase Dashboard',
          description: 'Entre em https://app.supabase.com e selecione seu projeto',
        },
        {
          step: 2,
          title: 'Abra o SQL Editor',
          description: 'No menu lateral, clique em "SQL Editor" (ícone de terminal)',
        },
        {
          step: 3,
          title: 'Cole o Script SQL',
          description:
            'Copie todo o conteúdo do arquivo src/scripts/setup-database.sql e cole no editor',
        },
        {
          step: 4,
          title: 'Execute o Script',
          description: 'Clique no botão "Run" ou pressione Ctrl+Enter para executar',
        },
        {
          step: 5,
          title: 'Configure Autenticação',
          description:
            'Vá em Authentication > Users e crie usuários de teste com os emails do script',
        },
        {
          step: 6,
          title: 'Teste o Setup',
          description: 'Volte para a aplicação e clique em "Verificar Configuração"',
        },
      ],
      sqlFilePath: 'src/scripts/setup-database.sql',
      warning:
        'IMPORTANTE: Após criar usuários no Supabase Auth, use o mesmo ID (UUID) na tabela usuarios para vincular corretamente.',
    },
  };
};

/**
 * Tenta executar uma query simples para testar conexão
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('usuarios').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};