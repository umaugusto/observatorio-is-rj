import { useState } from 'react';
import { 
  checkDatabaseSetup, 
  getSetupInstructions, 
  DatabaseStatus 
} from '../../services/database-setup';

interface DatabaseSetupProps {
  onSetupComplete: () => void;
}

export const DatabaseSetup = ({ onSetupComplete }: DatabaseSetupProps) => {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const instructions = getSetupInstructions();

  const handleCheckSetup = async () => {
    setChecking(true);
    try {
      const result = await checkDatabaseSetup();
      setStatus(result);
      
      if (result.isConfigured) {
        setTimeout(() => {
          onSetupComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao verificar setup:', error);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">
              Configuração do Banco de Dados
            </h1>
            <p className="text-center text-primary-100">
              Siga as instruções abaixo para configurar o Supabase
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Status Check Result */}
            {status && (
              <div className={`mb-6 p-4 rounded-lg ${
                status.isConfigured 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {status.isConfigured ? (
                      <svg className="h-5 w-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${
                      status.isConfigured ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {status.isConfigured 
                        ? '✅ Banco de dados configurado com sucesso!' 
                        : '⚠️ Banco de dados não configurado'}
                    </h3>
                    <div className="mt-2 text-sm">
                      <ul className="space-y-1">
                        <li className={status.hasUsuarios ? 'text-green-700' : 'text-red-700'}>
                          {status.hasUsuarios ? '✓' : '✗'} Tabela de usuários: {
                            status.hasUsuarios ? 'Encontrada' : 'Não encontrada'
                          }
                        </li>
                        <li className={status.hasCasos ? 'text-green-700' : 'text-red-700'}>
                          {status.hasCasos ? '✓' : '✗'} Tabela de casos: {
                            status.hasCasos ? 'Encontrada' : 'Não encontrada'
                          }
                        </li>
                      </ul>
                    </div>
                    {status.isConfigured && (
                      <p className="mt-3 text-sm text-green-600">
                        Redirecionando para a aplicação...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {showInstructions && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Instruções de Configuração
                  </h2>
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {instructions.details.steps.map((step: any) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}

                {/* File Path Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Arquivo SQL:
                      </p>
                      <code className="text-xs bg-gray-200 px-2 py-1 rounded mt-1 inline-block">
                        {instructions.details.sqlFilePath}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex">
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="ml-3 text-sm text-amber-700">
                      {instructions.details.warning}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex gap-4 justify-center">
              {!showInstructions && (
                <button
                  onClick={() => setShowInstructions(true)}
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Ver Instruções
                </button>
              )}
              <button
                onClick={handleCheckSetup}
                disabled={checking}
                className="btn-primary flex items-center gap-2"
              >
                {checking ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verificando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verificar Configuração
                  </>
                )}
              </button>
            </div>

            {/* Help Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-center gap-6 text-sm">
                <a
                  href="https://app.supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir Supabase Dashboard
                </a>
                <a
                  href="https://supabase.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Documentação
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};