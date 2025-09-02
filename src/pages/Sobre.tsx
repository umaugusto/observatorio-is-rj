import { Link } from 'react-router-dom';

export const Sobre = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sobre o Designário</h1>
            <p className="text-xl text-white/90">
              Observatório de Inovação Social do Rio de Janeiro
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            
            {/* O que é */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">O que é o Designário?</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                O Designário é uma plataforma digital especializada em casos de Inovação Social 
                no estado do Rio de Janeiro, desenvolvida pelo Rio DESIS Lab em parceria com a 
                COPPE/UFRJ.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Nossa missão é reunir, catalogar e divulgar iniciativas que articulam Inovação 
                Social com Design de Serviço, criando um repositório vivo e colaborativo que 
                conecta extensionistas, pesquisadores e comunidades.
              </p>
            </div>

            {/* Metodologia */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nossa Metodologia</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                O projeto integra duas abordagens estratégicas fundamentais:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Inovação Social</h3>
                  <p className="text-gray-600 text-sm">
                    Identificação e análise de soluções criativas desenvolvidas por comunidades 
                    para resolver desafios sociais locais.
                  </p>
                </div>
                <div className="border-l-4 border-secondary-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Design de Serviço</h3>
                  <p className="text-gray-600 text-sm">
                    Aplicação de ferramentas e metodologias de design para estruturar, 
                    analisar e potencializar iniciativas sociais.
                  </p>
                </div>
              </div>
            </div>

            {/* Diferencial */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nosso Diferencial</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Integração Única</h3>
                    <p className="text-gray-600 text-sm">
                      Primeira plataforma a integrar explicitamente Inovação Social e Design de Serviço no Rio de Janeiro.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Plataforma Viva</h3>
                    <p className="text-gray-600 text-sm">
                      Acompanhamento contínuo dos projetos catalogados, mantendo informações sempre atualizadas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Abrangência Estadual</h3>
                    <p className="text-gray-600 text-sm">
                      Cobertura completa do estado do Rio de Janeiro, conectando iniciativas de todas as regiões.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instituição */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quem Somos</h2>
              <div className="flex items-center mb-4">
                <div className="text-primary-600 mr-4">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">COPPE/UFRJ</h3>
                  <p className="text-gray-600 text-sm">
                    Instituto Alberto Luiz Coimbra de Pós-Graduação e Pesquisa de Engenharia
                  </p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                O Designário é desenvolvido pelo <strong>Rio DESIS Lab</strong>, laboratório de pesquisa 
                vinculado ao Programa de Engenharia de Produção da COPPE/UFRJ, sob coordenação da 
                Professora Carla Cipolla.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Nossa equipe é formada por pesquisadores, designers e estudantes comprometidos com 
                a promoção da inovação social e o desenvolvimento sustentável no Rio de Janeiro.
              </p>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Faça Parte</h2>
              <p className="text-gray-600 mb-8">
                Contribua com o mapeamento da inovação social no Rio de Janeiro
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/casos" className="btn-primary">
                  Explorar Casos
                </Link>
                <Link to="/contato" className="btn-secondary">
                  Entre em Contato
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};