# ESTRUTURA ATUAL DO BANCO DE DADOS - IMPORTANTE

## ⚠️ ATENÇÃO: Estrutura Simplificada

A tabela `casos_inovacao` tem uma **estrutura mínima** diferente do esperado:

### Campos EXISTENTES na tabela casos_inovacao:
```sql
1. id               (uuid) - gerado automaticamente
2. titulo           (text) - obrigatório
3. descricao        (text) - obrigatório  
4. categoria        (text) - obrigatório, padrão 'Outros'
5. extensionista_id (uuid) - opcional
6. status_ativo     (boolean) - obrigatório, padrão true
7. created_at       (timestamp) - automático
8. updated_at       (timestamp) - automático
```

### Campos que NÃO EXISTEM (mas o código espera):
- ❌ **localizacao** - campo antigo de localização
- ❌ **cidade** - novo campo de cidade
- ❌ **estado** - novo campo de estado  
- ❌ **bairro** - campo de bairro
- ❌ **cep** - código postal
- ❌ **resumo** - resumo do caso
- ❌ **coordenadas_lat** - latitude
- ❌ **coordenadas_lng** - longitude
- ❌ **subcategoria** - subcategoria do caso
- ❌ **pessoas_impactadas** - número de pessoas
- ❌ **orcamento** - valor do orçamento
- ❌ **data_inicio** - data de início
- ❌ **data_fim** - data de término
- ❌ **status** - status do projeto
- ❌ **contato_nome** - nome do contato
- ❌ **contato_email** - email do contato
- ❌ **contato_telefone** - telefone
- ❌ **imagem_url** - URL da imagem
- ❌ **link_projeto** - link do projeto
- ❌ **video_url** - URL do vídeo
- ❌ Campos de redes sociais

## 📝 Scripts Disponíveis

### Para estrutura MÍNIMA atual:
- Use: `populate-casos-minimo.sql`
- Insere apenas: titulo, descricao, categoria, extensionista_id, status_ativo

### Para estrutura COMPLETA (se os campos forem adicionados):
- Use: `populate-casos-inovacao.sql` (precisa adaptar)
- Requer adicionar os campos faltantes primeiro

## 🔧 Como Adicionar os Campos Faltantes

Se quiser adicionar os campos para ter a estrutura completa, execute:
```sql
ALTER TABLE casos_inovacao
ADD COLUMN IF NOT EXISTS resumo TEXT,
ADD COLUMN IF NOT EXISTS cidade VARCHAR(255),
ADD COLUMN IF NOT EXISTS estado VARCHAR(2),
ADD COLUMN IF NOT EXISTS bairro VARCHAR(255),
ADD COLUMN IF NOT EXISTS cep VARCHAR(10),
ADD COLUMN IF NOT EXISTS coordenadas_lat DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS coordenadas_lng DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS subcategoria VARCHAR(100),
ADD COLUMN IF NOT EXISTS pessoas_impactadas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS orcamento DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS data_inicio DATE,
ADD COLUMN IF NOT EXISTS data_fim DATE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ativo',
ADD COLUMN IF NOT EXISTS contato_nome VARCHAR(255),
ADD COLUMN IF NOT EXISTS contato_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contato_telefone VARCHAR(20),
ADD COLUMN IF NOT EXISTS imagem_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS link_projeto VARCHAR(500),
ADD COLUMN IF NOT EXISTS video_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20),
ADD COLUMN IF NOT EXISTS visualizacoes INTEGER DEFAULT 0;

-- Para compatibilidade com código antigo:
ADD COLUMN IF NOT EXISTS localizacao VARCHAR(255);
```

## 🚨 Problema Principal

O código da aplicação espera muitos campos que **não existem na tabela atual**. Isso causa:
- Erro ao tentar inserir dados com campos inexistentes
- Erro ao tentar exibir informações de localização
- Mapas não funcionam (sem coordenadas)
- Filtros por localização não funcionam

## ✅ Solução Recomendada

1. **URGENTE**: Execute o script de ALTER TABLE acima para adicionar os campos
2. **DEPOIS**: Use o script `populate-casos-inovacao.sql` completo
3. **OU**: Use `populate-casos-minimo.sql` com a estrutura atual mínima

---
**Data da verificação**: Janeiro 2025
**Verificado via**: information_schema.columns no Supabase