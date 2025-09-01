import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Home } from './pages/Home';
import { Casos } from './pages/Casos';
import { CasoDetalhes } from './pages/CasoDetalhes';
import { Categorias } from './pages/Categorias';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { UserManagement } from './pages/admin/UserManagement';
import { CaseManagement } from './pages/admin/CaseManagement';
import { CaseEditor } from './pages/admin/CaseEditor';
import { ROUTES } from './utils/constants';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route path={ROUTES.CASOS} element={<Casos />} />
              <Route path="/caso/:id" element={<CasoDetalhes />} />
              <Route path={ROUTES.LOGIN} element={<Login />} />
              
              {/* Protected Routes */}
              <Route 
                path={ROUTES.PROFILE} 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes - Protected */}
              <Route 
                path={ROUTES.ADMIN_USERS} 
                element={
                  <ProtectedRoute adminOnly>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path={ROUTES.ADMIN_CASES} 
                element={
                  <ProtectedRoute adminOnly>
                    <CaseManagement />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path={`${ROUTES.ADMIN_CASE_EDIT}/:id`} 
                element={
                  <ProtectedRoute adminOnly>
                    <CaseEditor />
                  </ProtectedRoute>
                } 
              />
              
              {/* Páginas públicas */}
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/mapa" element={<PlaceholderPage title="Mapa" />} />
              <Route path="/sobre" element={<PlaceholderPage title="Sobre" />} />
              <Route path="/contato" element={<PlaceholderPage title="Contato" />} />
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Componente temporário para páginas não implementadas
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-24 h-24 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
        <span className="text-4xl">🚧</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-6">
        Esta página está em desenvolvimento.
      </p>
      <a href="/" className="btn-primary">
        Voltar ao Início
      </a>
    </div>
  </div>
);

// Página 404
const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <span className="text-4xl">❌</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Página não encontrada</h1>
      <p className="text-gray-600 mb-6">
        A página que você está procurando não existe.
      </p>
      <a href="/" className="btn-primary">
        Voltar ao Início
      </a>
    </div>
  </div>
);

export default App;