# Histórico de Mudanças

Todas as mudanças notáveis do projeto Processador de Estoque v4.1 estão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [4.1.1] - 2026-10-04

### Corrigido

- CLI/npm/atalhos apontam para o arquivo atual e retornam falha corretamente.
- SKU e acentos preservados; números inválidos recusados; volume separado da massa.
- Exclusão de estoque zero funciona; duplicatas interrompem a conversão.
- Categorias com slugs parecidos não sobrescrevem arquivos.
- Cada execução é publicada em pasta exclusiva após concluir arquivos/logs.
  Índice de log substituído atomicamente; arquivos anteriores preservados.
- Descrições escapam dados de origem e removem condições comerciais sem evidência.
- Visualizador compatível com os campos gerados e logs históricos.
- Guia de contribuição reparado e contrato de entrada documentado.
- Vinte e um testes sintéticos de comportamento e CI Linux/Windows Node 22.

Importação na loja e desempenho real permanecem sem validação nesta revisão.
Os números históricos abaixo são relatos anteriores, não medições novas.
A lista atual contém 119 aliases heurísticos de marcas.

## [4.1.0] - 2025-10-16

### Adicionado
- **🎯 PRINCIPAL**: Atributo de marca para taxonomia nativa do WooCommerce (`Attribute 1 name: Marca`)
- Marcas agora aparecem como atributos filtráveis no WooCommerce (não apenas tags!)
- Validação de preços: alertas quando preço é menor que custo
- Detecção de preços altos: alertas para preços acima de R$ 10.000 (possíveis erros)
- Descrições de produtos otimizadas para SEO com estrutura HTML
- Lista de características nas descrições com ícones
- Seção de call-to-action nas descrições
- Detecção automática de 162 marcas
- Extração inteligente de peso/volume
- Logs JSON detalhados

### Mudado
- Documentação reorganizada e traduzida para português
- Descrições de produtos aprimoradas com melhor estrutura SEO
- Sistema de validação melhorado com verificações de custo vs preço
- README atualizado com foco específico
- Arquivos sem sufixos de versão

### Performance
- Alta performance mantida: ~7.500 produtos/segundo
- Detecção de marca: 10.2% média (até 96% em categorias específicas)
- Detecção de peso: 30.3% média
- Sem impacto de performance com novas validações

### Documentação
- Documentação completa em português
- Guia de instalação adicionado
- README atualizado com seção "Como Funciona"
- Guia de contribuição criado

## [4.0.0] - 2025-10-16

### Adicionado
- Sistema de detecção automática de marcas com 119+ marcas em múltiplas categorias
- Extração inteligente de peso dos títulos de produtos (kg, g, ml, litros)
- Campo de marca nos metadados WooCommerce (`Meta: _marca`)
- Flag de detecção de peso (`Meta: _peso_detectado`)
- Descrições de produtos enriquecidas com marca
- Geração automática de tags de marca
- Estatísticas de top marcas nos relatórios
- Detecção específica de marca por categoria
- Análise detalhada de marcas em arquivos de metadata

### Mudado
- Removidos sufixos de versão dos nomes de arquivos de saída
- Descrições de produtos aprimoradas para incluir informações de marca e peso
- Descrições curtas melhoradas com integração de marca
- Cabeçalhos CSV atualizados para incluir campos meta de marca
- Algoritmo de detecção de peso refinado com suporte a múltiplos formatos
- Formatação de categoria aprimorada sem sufixos de versão

### Performance
- Detecção de marca: 401 produtos (10.2%)
- Detecção de peso: 1.191 produtos (30.3%)
- Tempo de processamento: <0.6 segundos para 4.000 produtos
- Zero degradação de performance com novos recursos

### Corrigido
- Falsos positivos na detecção de peso (ex: "golden" detectado como "g")
- Faixa de validação de peso (0.001kg a 50kg)
- Geração de slug de categoria removendo sufixos de versão

## [3.0.0] - 2025-10-15

### Adicionado
- Formatação Title Case para nomes de produtos
- Remoção automática de aspas extras dos nomes de produtos
- Correções específicas de marca (BioNatural, Royal Canin, etc.)
- Descrições automáticas otimizadas para SEO
- Geração automática de tags baseada em atributos do produto
- Extração básica de peso dos títulos
- Geração aprimorada de metadata
- Correções específicas de categoria
- Formatação inteligente de nomes de produtos

### Mudado
- Formato de nome de produto de MAIÚSCULAS para Title Case
- Formato de descrição para incluir formatação HTML
- Sistema de tags mais inteligente
- Formatação de categoria para Title Case

### Corrigido
- Aspas extras nos nomes de produtos
- Capitalização inconsistente
- Descrições ausentes
- Campos de tag vazios

## [2.0.0] - 2025-10-14

### Adicionado
- Otimização de performance com parsing de CSV por streaming
- Geração de arquivos baseada em categoria
- Sistema abrangente de logging
- Rastreamento de tempo de execução
- Estatísticas de produtos por categoria
- Rastreamento e relatório de erros
- Geração de arquivo de metadata
- Suporte a arquivo de configuração (config.json)

### Mudado
- Método de leitura de CSV de arquivo completo para streaming
- Uso de memória reduzido em 60%
- Velocidade de processamento melhorada em 40%

### Performance
- Tempo de processamento: ~0.5 segundos para 4.000 produtos
- Uso de memória: ~50MB (reduzido de 125MB)

## [1.0.0] - 2025-10-13

### Adicionado
- Versão inicial
- Conversão básica de CSV de Athos para formato WooCommerce
- Validação de produtos
- Limpeza de SKU
- Processamento de preço e estoque
- Extração de categoria
- Tratamento básico de erros

### Recursos
- Arquivo único de saída com todos os produtos
- Mapeamento básico de campos WooCommerce
- Suporte a codificação UTF-8

## [Não Lançado]

### Planejado
- Integração de URL de imagens
- Suporte a produtos variáveis
- Regras de preços em massa
- Opções avançadas de filtragem
- Suporte multilíngue
- Integração de API com WooCommerce
- Sincronização de estoque em tempo real

---

## Comparação de Versões

| Versão | Produtos/seg | Detecção Marca | Detecção Peso | Formato Arquivo |
|--------|-------------|----------------|---------------|-----------------|
| 4.1.0  | 7.500       | 162 marcas     | Inteligente   | Nomes limpos    |
| 4.0.0  | 7.500       | 119 marcas     | Inteligente   | Nomes limpos    |
| 3.0.0  | 7.300       | Manual         | Básico        | Com sufixo      |
| 2.0.0  | 6.800       | Não            | Não           | Com sufixo      |
| 1.0.0  | 4.000       | Não            | Não           | Básico          |

## Guia de Migração

### De 3.0 para 4.0

1. Nenhuma mudança de configuração necessária
2. Arquivos de saída não terão mais sufixo `_v3`
3. Novos campos de marca e peso preenchidos automaticamente
4. Revise detecções de marca em `metadata.json`
5. Atualize scripts que esperem nomes de arquivo antigos

### De 2.0 para 3.0

1. Nomes de produtos serão reformatados
2. Descrições serão aprimoradas
3. Revise mudanças de formatação antes de importar

### De 1.0 para 2.0

1. Adicione arquivo `config.json` com configurações
2. Atualize caminhos de arquivo para nova estrutura
3. Revise novos recursos de logging

## Suporte

Para problemas ou dúvidas sobre versões específicas, consulte o arquivo README.md ou entre em contato com a equipe de desenvolvimento.

## Links

- [Repositório](#)
- [Problemas](#)
- [Documentação](README.md)
