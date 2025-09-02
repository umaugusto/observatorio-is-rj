/**
 * Formatação de dados - Observatório de Inovação Social
 */

/**
 * Formatar telefone com máscara (99) 9999-9999 ou (99) 99999-9999
 */
export const formatTelefone = (value: string): string => {
  // Remove tudo que não é dígito
  const cleanValue = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedValue = cleanValue.substring(0, 11);
  
  // Aplica a máscara
  if (limitedValue.length <= 10) {
    // Formato: (99) 9999-9999
    return limitedValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Formato: (99) 99999-9999
    return limitedValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

/**
 * Remover máscara do telefone (retorna apenas números)
 */
export const cleanTelefone = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Validar se telefone tem formato correto
 */
export const isValidTelefone = (value: string): boolean => {
  const cleaned = cleanTelefone(value);
  // Aceita 10 ou 11 dígitos (com ou sem 9º dígito no celular)
  return cleaned.length >= 10 && cleaned.length <= 11;
};