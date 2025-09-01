export const ROUTES = {
  HOME: '/',
  CASOS: '/casos',
  CATEGORIAS: '/categorias',
  MAPA: '/mapa',
  SOBRE: '/sobre',
  CONTATO: '/contato',
  MESSAGES: '/mensagens',
  LOGIN: '/login',
  PROFILE: '/perfil',
  ADMIN_USERS: '/admin/usuarios',
  ADMIN_CASES: '/admin/casos',
  ADMIN_CASE_EDIT: '/admin/casos/editar',
} as const;

export const CATEGORIES = [
  'Educação',
  'Saúde',
  'Meio Ambiente',
  'Geração de Renda',
  'Cultura',
  'Tecnologia Social',
  'Direitos Humanos',
  'Habitação',
] as const;

export const USER_TYPES = {
  ADMIN: 'admin',
  EXTENSIONISTA: 'extensionista',
  PESQUISADOR: 'pesquisador',
  COORDENADOR: 'coordenador',
} as const;

export const CONTACT_TYPES = {
  ACESSO: 'acesso',
  DUVIDA: 'duvida',
  SUGESTAO: 'sugestao',
  OUTRO: 'outro',
} as const;

export const CONTACT_TYPES_LABELS = {
  acesso: 'Solicitar Acesso',
  duvida: 'Dúvida',
  sugestao: 'Sugestão',
  outro: 'Outro',
} as const;

export const APP_NAME = 'Designário';
export const APP_SUBTITLE = 'Observatório de Inovação Social';
export const APP_DESCRIPTION = 'Plataforma digital para catalogar, visualizar e promover casos de inovação social no Rio de Janeiro';