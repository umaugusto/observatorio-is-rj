# Guia: Migração Completa da Estrutura do Banco de Dados

Este guia explica como migrar sua tabela `casos_inovacao` da estrutura mínima atual para a estrutura completa com todos os campos que o código espera.

## 🎯 Objetivo

Transformar sua tabela atual (8 campos) em uma tabela completa (32+ campos) para que **todas as funcionalidades do site funcionem perfeitamente**.

## 📋 Pré-requisitos

- Acesso ao **Supabase Dashboard** com permissões de administrador
- Backup dos dados atuais (recomendado)

## ⚠️ ATENÇÃO: Faça Backup Primeiro!

Antes de começar, **faça backup** dos dados existentes:

```sql
-- Execute no Supabase para ver seus dados atuais
SELECT * FROM casos_inovacao;

-- Se tiver dados importantes, copie-os antes de continuar
```

## 🔧 Passo a Passo

### Etapa 1: Adicionar Todos os Campos Necessários

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Execute o arquivo**: `01-adicionar-campos-completos.sql`

**Este script adiciona:**
- ✅ **Localização**: cidade, estado, bairro, cep, localizacao
- ✅ **Coordenadas**: coordenadas_lat, coordenadas_lng
- ✅ **Informações**: resumo, subcategoria
- ✅ **Mídia**: imagem_url, link_projeto, video_url
- ✅ **Métricas**: pessoas_impactadas, orcamento, visualizacoes
- ✅ **Datas**: data_inicio, data_fim, status
- ✅ **Contato**: contato_nome, contato_email, contato_telefone
- ✅ **Redes Sociais**: instagram_url, facebook_url, whatsapp
- ✅ **Tags**: array de tags relacionadas

### Etapa 2: Popular com Dados Completos

1. **Após a Etapa 1 executar com sucesso**
2. **Execute o arquivo**: `02-popular-casos-completos.sql`

**Este script insere:**
- ✅ **1 usuário extensionista** de exemplo
- ✅ **15 casos realistas** do Rio de Janeiro
- ✅ **Todos os campos preenchidos** com dados plausíveis
- ✅ **Localizações reais** com coordenadas corretas
- ✅ **Dados variados** por categoria

## 📊 O Que Você Terá Após a Migração

### Estrutura Completa da Tabela

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **Campos Existentes** | | |
| id | uuid | ID único (mantido) |
| titulo | text | Título do caso (mantido) |
| descricao | text | Descrição detalhada (mantido) |
| categoria | text | Categoria principal (mantido) |
| extensionista_id | uuid | Responsável (mantido) |
| status_ativo | boolean | Ativo/inativo (mantido) |
| created_at | timestamp | Data criação (mantido) |
| updated_at | timestamp | Data atualização (mantido) |
| **Campos Novos** | | |
| resumo | text | Resumo curto |
| cidade | varchar(255) | Nome da cidade |
| estado | varchar(10) | Sigla do estado |
| bairro | varchar(255) | Nome do bairro |
| cep | varchar(10) | Código postal |
| localizacao | varchar(255) | Localização formatada |
| coordenadas_lat | decimal | Latitude |
| coordenadas_lng | decimal | Longitude |
| subcategoria | varchar(100) | Subcategoria específica |
| imagem_url | varchar(500) | URL da imagem |
| link_projeto | varchar(500) | Site do projeto |
| video_url | varchar(500) | Vídeo do projeto |
| pessoas_impactadas | integer | Nº pessoas beneficiadas |
| orcamento | decimal | Valor do orçamento |
| data_inicio | date | Data de início |
| data_fim | date | Data de término |
| status | varchar(50) | Status do projeto |
| contato_nome | varchar(255) | Nome do contato |
| contato_email | varchar(255) | Email do contato |
| contato_telefone | varchar(20) | Telefone do contato |
| instagram_url | varchar(500) | Instagram do projeto |
| facebook_url | varchar(500) | Facebook do projeto |
| whatsapp | varchar(20) | WhatsApp do contato |
| visualizacoes | integer | Contador de visualizações |
| tags | text[] | Array de tags |

### 15 Casos de Exemplo Inseridos

**Distribuição por categoria:**
- **Educação** (2): Biblioteca Rocinha, Reforço Jacarepaguá
- **Saúde** (2): CDD Saúde, Saúde Mental Realengo  
- **Meio Ambiente** (2): Horta Maré, Proteção Recreio
- **Cultura** (2): Arte Santa Teresa, Lapa Cultural
- **Tecnologia** (2): CodeLab Alemão, Robótica Campo Grande
- **Outros** (5): Empreendedorismo, Inclusão, Urbanismo, Alimentação, Esporte

**Localizações reais:**
- Rocinha, Cidade de Deus, Maré, Santa Teresa
- Complexo do Alemão, Copacabana, Bangu, Centro
- Vila Isabel, Tijuca, Jacarepaguá, Realengo
- Recreio dos Bandeirantes, Lapa, Campo Grande

## ✅ Funcionalidades Que Passam a Funcionar

Após a migração, **todas** as funcionalidades do site funcionarão:

### 🗺️ Mapas Interativos
- ✅ Localização precisa de cada caso
- ✅ Coordenadas reais dos bairros
- ✅ Mapas na página de detalhes
- ✅ Visualização geográfica

### 🔍 Filtros e Buscas
- ✅ Filtro por cidade/estado/bairro
- ✅ Busca por localização
- ✅ Filtros por categoria e subcategoria
- ✅ Tags relacionadas

### 📊 Informações Completas
- ✅ Resumos e descrições
- ✅ Métricas de impacto
- ✅ Informações de orçamento
- ✅ Datas de projeto
- ✅ Status do projeto

### 🔗 Contatos e Redes
- ✅ Informações de contato
- ✅ Links para redes sociais
- ✅ Site do projeto
- ✅ Vídeos do projeto

### 🖼️ Imagens e Mídia
- ✅ Imagens por categoria
- ✅ URLs de vídeo
- ✅ Links externos

## 🚨 Solução de Problemas

### Erro durante a Etapa 1
```sql
-- Se der erro de campo já existe:
-- É normal, significa que alguns campos já existiam
-- Continue normalmente para a Etapa 2
```

### Erro durante a Etapa 2
```sql
-- Se der erro de usuário já existe:
-- Também é normal, o script usa ON CONFLICT DO NOTHING
-- Continue e verifique o resultado final
```

### Verificar se funcionou
```sql
-- Execute para verificar campos:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'casos_inovacao' 
ORDER BY column_name;

-- Execute para verificar dados:
SELECT titulo, cidade, bairro, categoria 
FROM casos_inovacao 
LIMIT 5;
```

## 🎉 Resultado Final

Após executar ambos os scripts:

1. **Acesse o site** local ou produção
2. **Vá para a página inicial** - deve mostrar estatísticas
3. **Clique em "Casos"** - deve listar 15 casos
4. **Clique em qualquer caso** - deve mostrar mapa e detalhes
5. **Teste os filtros** por categoria
6. **Verifique as páginas** de categorias

**Tudo deve funcionar perfeitamente!** 🚀

## 📞 Suporte

Se encontrar problemas:
1. Execute os scripts de verificação acima
2. Confira se todos os campos foram criados
3. Verifique se os dados foram inseridos
4. Teste o site passo a passo

---

**Data:** Janeiro 2025  
**Versão:** 1.0 - Migração Completa