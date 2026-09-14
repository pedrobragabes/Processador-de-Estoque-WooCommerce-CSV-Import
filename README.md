# Legacy ERP CSV Converter

Converte exportações CSV do Athos ERP em arquivos para o importador do WooCommerce. Foi desenvolvido a partir de um problema real de varejo: adaptar um catálogo legado sem uma API de integração adequada.

## Problema e solução

Dados de nome, marca, categoria, peso e preço precisam de transformação antes da importação. O processador lê o arquivo configurado, aplica regras locais e gera CSVs e relatórios para revisão humana. Não envia produtos por uma API nem sincroniza estoque em tempo real.

## O que existe

- Parsing CSV com `csv-parser` e escrita com `csv-writer`.
- Tabela local de marcas, extração de peso/volume e normalização de nomes.
- Conversão para colunas WooCommerce, incluindo atributos/metadados de marca.
- CSV geral, saídas por categoria, estatísticas e visualizador de logs.

```text
CSV Athos → parsing → normalização e regras → CSV WooCommerce → revisão/importação manual
```

Stack: Node.js, JavaScript, `csv-parser` e `csv-writer`. A implementação está em `processador-estoque-v4.1.js`; os scripts npm apontam para essa entrada.

## Instalação e execução

```powershell
npm ci
Copy-Item config.example.json config.json
# Configure arquivos.entrada e arquivos.pastaSaida para dados locais de teste.
npm test
npm start
```

`config.json` precisa existir no diretório de execução. O projeto usa arquivo JSON, não variáveis de ambiente. `arquivos` define entrada/saída; `processamento` e `validacoes` controlam filtros; `woocommerce` define campos do CSV; `saida` controla os artefatos. `publicarAutomaticamente` é um campo de saída, não uma chamada à loja.

Use `npm run logs` para inspecionar estatísticas locais. `npm test` valida sintaxe; não substitui a revisão do CSV nem um teste de importação em uma loja de sandbox.

## Limites e reutilização

As heurísticas de marcas, categorias e peso são específicas do domínio original e podem classificar incorretamente produtos de outro segmento. É necessário revisar resultados e adaptar as regras. Não há benchmark ou garantia de escala publicada nesta auditoria.

Este é o precursor/manual companion do Stock Sync Python. Para o portfólio, sua melhor função é mostrar a evolução da integração; não precisa disputar um dos seis destaques com o sincronizador.

## Segurança, status e licença

Não versione exports, `config.json` com caminhos privados, CSVs gerados ou logs comerciais. A execução é local e não requer credenciais WooCommerce. Case de origem real, mantido como ferramenta legada de importação. A licença MIT e sua atribuição original foram preservadas em [LICENSE](LICENSE).
