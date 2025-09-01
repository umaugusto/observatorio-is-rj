import { Link } from 'react-router-dom';
import { APP_NAME, ROUTES } from '../../utils/constants';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">{APP_NAME}</h3>
            <p className="text-gray-300 mb-4 max-w-md">
              Plataforma digital para catalogar, visualizar e promover casos de 
              inovação social no Rio de Janeiro, conectando extensionistas 
              universitários com iniciativas de impacto social.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.HOME} className="text-gray-300 hover:text-white">
                  Início
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CASOS} className="text-gray-300 hover:text-white">
                  Casos
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="text-gray-300 hover:text-white">
                  Categorias
                </Link>
              </li>
              <li>
                <Link to="/mapa" className="text-gray-300 hover:text-white">
                  Mapa
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">
              Informações
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/sobre" className="text-gray-300 hover:text-white">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-gray-300 hover:text-white">
                  Contato
                </Link>
              </li>
              <li>
                <Link to={ROUTES.LOGIN} className="text-gray-300 hover:text-white">
                  Área do Extensionista
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 {APP_NAME}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};