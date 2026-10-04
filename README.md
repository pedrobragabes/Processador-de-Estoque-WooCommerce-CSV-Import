# Processador Athos → WooCommerce 4.1.1

Conversor local de uma variante de exportação Athos para CSV WooCommerce.
A revisão de 04/10/2026 corrige comandos, identidade dos produtos, números, unidades,
preservação das exportações e leitura dos logs. Não acessa ERP, WordPress ou APIs.

## Instalar e executar

Use Node 22+ e npm 10+. Na pasta do projeto:

    npm ci
    Copy-Item config.example.json config.json
    npm start
    npm run logs

Coloque a exportação em athos.csv ou ajuste arquivos.entrada na configuração.
O atalho processarEstoque-v4.1.bat executa o arquivo atual e informa falhas corretamente.
Os atalhos usam a pasta do próprio projeto. Configuração ativa e CSVs são ignorados pelo Git.

Para usar outra pasta de configuração:

    npm start -- --config "C:\MinhaPasta\config.json"
    npm run logs -- --config "C:\MinhaPasta\config.json"

Os caminhos de entrada/saída seguem o arquivo de configuração. Importar a classe não
lê uma configuração nem encerra o processo; a leitura ocorre na construção da instância.

## Contrato de entrada

O leitor reconhece a variante do código original: CSV UTF-8, delimitador vírgula,
campos entre aspas quando necessário e registros com pelo menos 15 células.
Cada linha de produto contém a célula Valor Custo; as seis células seguintes são:

| Posição após o marcador | Campo |
| --- | --- |
| 1 | SKU |
| 2 | Descrição |
| 3 | Estoque |
| 4 | Estoque mínimo |
| 5 | Preço |
| 6 | Custo |

A categoria vem da célula Departamento:nome. Aspas e quebras de linha dentro de campos
são tratadas pelo parser. Não se presume compatibilidade com outros layouts Athos;
confira uma amostra autorizada antes de operar. Cada linha tem limite de 1 MiB.

- SKU conserva letras, separadores e zeros iniciais. Duplicatas, comparadas sem
  diferenciar maiúsculas/minúsculas, interrompem a execução antes de publicar arquivos.
- Números aceitos: 1.234,56; 10,50; 10.50; R$ 1.234,50. Grupos de três dígitos com
  ponto seguem a convenção brasileira: 1.234 significa 1234.
- Preço/custo são finitos, não negativos e expressáveis em centavos. Estoque/mínimo
  são inteiros não negativos. Preço/estoque ausentes ou ilegíveis não viram zero.
  Nome vazio é recusado.
- Registros recusados entram na contagem/log. Sem contrato reconhecido ou produto
  válido, não há exportação. Confira as recusas antes de importar um lote.
- Limites e inclusão de produtos sem estoque seguem processamento. O exemplo exige
  SKU; configurações antigas podem manter validacoes.skuObrigatorio como false,
  mas produtos sem SKU não oferecem identidade confiável para atualizações.
- Opções/seções antigas ausentes recebem os padrões do exemplo. Booleanos em texto,
  limites inválidos e caminhos vazios são recusados.

## Campos WooCommerce e unidades

O CSV contém SKU, nome, preço regular, estoque, publicação, categoria, tags e metadados.
O exemplo gera produtos não publicados. publicarAutomaticamente apenas preenche
Published: não conecta nem importa no site.

Nomes preservam acentos. A descrição HTML escapa textos de origem e usa o preço
informado, sem inventar promoção, entrega ou garantia.

A marca é detectada por 119 aliases locais, priorizando nomes mais específicos.
É heurística e exige revisão. O atributo Marca não implementa a taxonomia WooCommerce Brands.

kg/g reconhecidos no título são convertidos para Weight (kg). ml/L ficam no atributo
local Conteúdo. Não se presume densidade para converter volume em massa. Confira
embalagem, peso de transporte e configuração da loja em kg antes de importar.

Referência: [schema oficial WooCommerce](https://github.com/woocommerce/woocommerce/wiki/Product-CSV-Import-Schema).
Confira o mapeamento e as unidades na loja de homologação.

## Exportações preservadas

Cada execução concluída tem uma pasta exclusiva:

    saida_estoque/
    ├── ultimo_processamento.json
    └── execucao_DATA_IDENTIFICADOR/
        ├── woocommerce_import_TODOS.csv
        ├── categoria_NOME_HASH.csv
        ├── metadata.json
        ├── log_execucao_DATA.json
        └── ultimo_processamento.json

As opções saida controlam os arquivos e os sufixos de data em seus nomes. A pasta
de execução é sempre exclusiva. Categorias com slug parecido não sobrescrevem arquivos.
Pasta iniciada por ponto e terminada em .pendente é temporária: uma falha pode deixá-la
para inspeção; não corresponde a uma exportação concluída.

A pasta final só é publicada depois de gerar arquivos/logs. O índice da última execução
é substituído atomicamente depois disso. Arquivos antigos não são sobrescritos.
Não é preciso limpar a saída antes de converter outro lote. Arquive/remova manualmente
uma execução escolhida quando desejar.

    npm run logs -- historico 7
    npm run logs -- arquivo "execucao_DATA_IDENTIFICADOR\log_execucao_DATA.json"
    npm run logs -- comparar "execucao_A\ultimo_processamento.json" "execucao_B\ultimo_processamento.json"

O visualizador aceita logs antigos na raiz. Arquivos/parâmetros inválidos retornam
código diferente de zero; não procura arquivos fora da saída configurada.

## Verificação e limites

    npm test
    npm audit

Vinte e um testes usam dados sintéticos e arquivos temporários próprios, incluindo conversão
multilinha, reexecução sem sobrescrita, configuração, CLI/npm e logs. A CI roda Node 22
em Linux e Windows e verifica segredos.

A revisão não importou produtos reais, mediu desempenho em estoque real ou validou
um layout fornecido pela loja. Faça backup e homologue uma amostra autorizada no WooCommerce
antes do uso operacional. Produtos variáveis, imagens, sincronização via API e alteração
automática de preços continuam fora deste conversor local.

## Licença

MIT; texto existente em [LICENSE](LICENSE).
