import type { User, CasoInovacao, ContactMessage, ContactMessageInput } from '../types';
import { demoUser, demoUsers, demoCases, demoMessages, getDemoUnreadCount } from './demoData';

// Interceptor que simula operações do banco de dados para o modo demo
// Todas as operações retornam dados mockados sem persistir alterações

export class DemoInterceptor {
  private static delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // User operations
  static async getAllUsers(): Promise<User[]> {
    await this.delay();
    return demoUsers;
  }

  static async getUser(userId: string): Promise<User | null> {
    await this.delay();
    return demoUsers.find(user => user.id === userId) || null;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    await this.delay();
    const user = demoUsers.find(u => u.id === userId);
    if (!user) throw new Error('Usuário não encontrado');
    
    // Simula atualização sem persistir
    const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
    console.log('🎭 Demo: Simulando atualização de usuário:', updatedUser.nome);
    return updatedUser;
  }

  static async createNewUser(userData: Partial<User>): Promise<User> {
    await this.delay();
    const newUser: User = {
      id: `demo-user-${Date.now()}`,
      email: userData.email || '',
      nome: userData.nome || '',
      tipo: userData.tipo || 'extensionista',
      instituicao: userData.instituicao,
      telefone: userData.telefone,
      bio: userData.bio,
      avatar_url: userData.avatar_url || null,
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isDemo: true
    };
    console.log('🎭 Demo: Simulando criação de usuário:', newUser.nome);
    return newUser;
  }

  static async toggleUserStatus(userId: string): Promise<void> {
    await this.delay();
    console.log('🎭 Demo: Simulando alteração de status do usuário:', userId);
  }

  static async deleteUser(userId: string): Promise<void> {
    await this.delay();
    console.log('🎭 Demo: Simulando exclusão de usuário:', userId);
  }

  // Avatar operations
  static async uploadAvatar(userId: string, _file: File): Promise<string> {
    await this.delay(1000);
    // Simula upload retornando URL de avatar exemplo
    const avatarUrl = `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&t=${Date.now()}`;
    console.log('🎭 Demo: Simulando upload de avatar para usuário:', userId);
    return avatarUrl;
  }

  static async uploadAvatarOnly(_file: File): Promise<string> {
    await this.delay(1000);
    const avatarUrl = `https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face&t=${Date.now()}`;
    console.log('🎭 Demo: Simulando upload de avatar standalone');
    return avatarUrl;
  }

  static async deleteAvatar(userId: string, _url?: string): Promise<void> {
    await this.delay();
    console.log('🎭 Demo: Simulando remoção de avatar:', userId);
  }

  // Case operations
  static async getCasos(): Promise<CasoInovacao[]> {
    await this.delay();
    return demoCases;
  }

  static async getCasosByCategory(categoria: string): Promise<CasoInovacao[]> {
    await this.delay();
    return demoCases.filter(caso => caso.categoria === categoria);
  }

  static async getCasoById(id: string): Promise<CasoInovacao | null> {
    await this.delay();
    return demoCases.find(caso => caso.id === id) || null;
  }

  static async createCaso(caseData: Partial<CasoInovacao>): Promise<CasoInovacao> {
    await this.delay();
    const newCase: CasoInovacao = {
      id: `demo-case-${Date.now()}`,
      titulo: caseData.titulo || '',
      descricao: caseData.descricao || '',
      resumo: caseData.resumo,
      cidade: caseData.cidade,
      estado: caseData.estado,
      bairro: caseData.bairro,
      categoria: caseData.categoria || '',
      subcategoria: caseData.subcategoria,
      imagem_url: caseData.imagem_url,
      coordenadas_lat: caseData.coordenadas_lat,
      coordenadas_lng: caseData.coordenadas_lng,
      pessoas_impactadas: caseData.pessoas_impactadas,
      orcamento: caseData.orcamento,
      data_inicio: caseData.data_inicio,
      status: caseData.status || 'ativo',
      tags: caseData.tags,
      contato_nome: caseData.contato_nome,
      contato_email: caseData.contato_email,
      contato_telefone: caseData.contato_telefone,
      extensionista_id: caseData.extensionista_id || demoUser.id,
      status_ativo: true,
      visualizacoes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      extensionista: demoUser
    };
    console.log('🎭 Demo: Simulando criação de caso:', newCase.titulo);
    return newCase;
  }

  static async updateCaso(id: string, updates: Partial<CasoInovacao>): Promise<CasoInovacao> {
    await this.delay();
    const existingCase = demoCases.find(c => c.id === id);
    if (!existingCase) throw new Error('Caso não encontrado');
    
    const updatedCase = { ...existingCase, ...updates, updated_at: new Date().toISOString() };
    console.log('🎭 Demo: Simulando atualização de caso:', updatedCase.titulo);
    return updatedCase;
  }

  static async deleteCaso(id: string): Promise<void> {
    await this.delay();
    console.log('🎭 Demo: Simulando exclusão de caso:', id);
  }

  // Contact Message operations
  static async createContactMessage(messageData: ContactMessageInput): Promise<void> {
    await this.delay();
    console.log('🎭 Demo: Simulando envio de mensagem de contato:', messageData.assunto);
  }

  static async getAllMessages(): Promise<ContactMessage[]> {
    await this.delay();
    return demoMessages;
  }

  static async updateMessageStatus(messageId: string, status: 'lido' | 'respondido'): Promise<void> {
    await this.delay();
    console.log('🎭 Demo: Simulando atualização de status da mensagem:', messageId, 'para', status);
  }

  static async getUnreadMessagesCount(): Promise<number> {
    await this.delay(200);
    return getDemoUnreadCount();
  }

  // Utility methods
  static isDemoMode(user: User | null): boolean {
    return user?.isDemo === true || user?.tipo === 'demo';
  }

  static showDemoNotification(): void {
    console.log('🎭 Demo: Esta é uma demonstração. Nenhuma alteração foi salva no banco de dados.');
  }
}