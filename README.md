# Processador de Estoque WooCommerce v4.1

Athos → WooCommerce CSV Converter

Ferramenta de uso interno para transformar o CSV exportado do Athos ERP em CSV compatível com o importador do WooCommerce, com detecção automática de marcas e extração de peso/volume. Focada em estoque grande (milhares de linhas) e em manter os dados de produto consistentes dentro da loja.

---

## 1. Objetivo

* Ler o CSV padrão do Athos.
* Normalizar nome, categoria e atributos.
* Detectar marca com base em tabela interna (160+ marcas).
* Extrair peso/volume do nome (kg, g, ml, L).
* Gerar um ou vários CSVs prontos para importar no WooCommerce.
* Registrar logs e estatísticas de processamento.

---

## 2. Principais recursos

* Conversão direta Athos → WooCommerce.
* Detecção de 160+ marcas (pet, aquarismo, veterinária, piscina, pesca, ferramentas, insumos).
* Extração de peso/volume a partir do título (15kg, 500g, 750ml, 1,5kg, 2L).
* Validações básicas: preço mínimo, estoque, SKU.
* Geração de:

  * 1 CSV geral com todos os produtos.
  * CSVs por categoria (opcional).
  * JSON de metadata (estatísticas).
  * JSON de log de execução.
* Inclusão do atributo “Marca” como atributo WooCommerce e como meta.
* Formatação automática de nomes (Title Case).
* Compatível com importador nativo do WooCommerce.

---

## 3. Requisitos

* Node.js 18 ou superior.
* npm (incluso no Node).
* Sistema operacional: Windows, Linux ou macOS.
* CSV exportado do Athos no padrão esperado.

---

## 4. Instalação rápida

```bash
# 1. instalar dependências
npm install

# 2. copiar config de exemplo
# Windows
copy config.example.json config.json
# Linux/macOS
cp config.example.json config.json
```

---

## 5. Configuração (`config.json`)

```json
{
  "arquivos": {
    "entrada": "athos.csv",
    "pastaSaida": "saida_estoque"
  },
  "processamento": {
    "precoMinimo": 0.01,
    "estoqueMinimo": 0,
    "incluirProdutosSemEstoque": true
  },
  "woocommerce": {
    "publicarAutomaticamente": false,
    "permitirAvaliacoes": true,
    "visibilidadeCatalogo": "visible"
  },
  "saida": {
    "criarArquivoGeral": true,
    "criarArquivosPorCategoria": true,
    "incluirMetadata": true,
    "formatoData": true
  }
}
```

Campos relevantes:

* `arquivos.entrada`: nome/caminho do CSV do Athos.
* `arquivos.pastaSaida`: pasta onde ficarão os CSVs gerados.
* `processamento.precoMinimo`: ignora produtos com preço abaixo disso.
* `processamento.incluirProdutosSemEstoque`: controla se produtos zerados entram no CSV.
* `saida.criarArquivosPorCategoria`: se verdadeiro, gera um CSV por categoria do Athos.

---

## 6. Uso

### Opção 1: Windows (arquivo .bat)

1. Coloque o `athos.csv` na raiz do projeto (ou ajuste no `config.json`).
2. Clique em `processarEstoque-v4.1.bat`.

### Opção 2: Node.js direto

```bash
node processador-estoque-v4.1.js
```

O script lê o CSV, processa tudo e cria os arquivos na pasta definida em `saida_estoque/`.

---

## 7. Arquivos gerados

Padrão de saída:

```text
saida_estoque/
├── woocommerce_import_TODOS_2025-10-16T15-30-00.csv   # todos os produtos
├── PET_2025-10-16T15-30-00.csv                        # por categoria
├── AQUARISMO_2025-10-16T15-30-00.csv                  # por categoria
├── metadata_v4.json                                   # estatísticas do processamento
├── log_execucao_v4_2025-10-16T15-30-00.json           # log detalhado
└── ultimo_processamento_v4.json                       # resumo
```

Descrição:

* `woocommerce_import_TODOS_*.csv`: importar direto em Produtos → Importar (WooCommerce).
* `[CATEGORIA]_*.csv`: útil quando a loja importa por partes.
* `metadata_v4.json`: total de linhas, quantas marcas detectadas, quantos pesos extraídos.
* `log_execucao_v4_*.json`: erros, avisos, linhas ignoradas.

---

## 8. Formato do CSV de saída (WooCommerce)

Campos principais gerados:

* `SKU`
* `Name`
* `Published`
* `Regular price`
* `Stock`
* `Categories`
* `Tags`
* `Attribute 1 name` → `Marca`
* `Attribute 1 value(s)` → nome da marca detectada
* Metas internas:

  * `_marca`
  * `_custo`
  * `_margem`

Isso permite importar e já ter a marca visível no produto e também guardada como meta.

---

## 9. Detecção de marcas

O processador mantém um dicionário interno com mais de 160 marcas, incluindo:

* Pet: Royal Canin, PremieR Pet, Golden, Farmina, Whiskas, Pedigree, Special Dog, Special Cat, Guabi, Equilibrio, Magnus, Fórmula Natural.
* Aquarismo: Alcon, Tetra, Sera, API, Seachem, Labcon, Ocean Tech, Tropical, Sarlo, Atman, Aquatech.
* Veterinária: NexGard, Bravecto, Frontline, Drontal, Revolution, Advocate, Seresto, Simparic, Comfortis.
* Piscina: Genco, Hidroall, HTH, Bel Gard.
* Pesca e ferramentas: Tramontina, Marine Sports, Maruri, Daiwa, Shimano, Nautika.
* Insumos/jardim: Forth, Dimy, Vitaplan, Tecnutri, Nutriplan.

Produtos sem marca detectada aparecem no log. Para incluir novas marcas, basta editar a lista no arquivo principal do processador e rodar novamente.

---

## 10. Extração de peso/volume

Padrões reconhecidos no nome do produto:

* `15kg`, `1kg`, `1.5kg`, `10,5kg`
* `500g`, `300g`
* `750ml`, `1l`, `2l`

O valor é convertido para o campo de peso aceito pelo WooCommerce. Se o padrão não for reconhecido, o processador registra aviso no log.

---

## 11. Validação

* Produto sem SKU: marcado no log.
* Produto com preço abaixo de `processamento.precoMinimo`: marcado no log.
* Produto sem estoque: incluído ou não conforme configuração.
* Produto sem marca: marcado no log.

Essas validações não travam o processamento; apenas registram.

---

## 12. Problemas comuns

1. Arquivo não encontrado

   * Mensagem: `Erro: arquivo 'athos.csv' não encontrado`.
   * Causa: CSV não está na raiz ou nome diferente do configurado.
   * Correção: ajustar `config.json` ou renomear o arquivo.

2. Produtos sem marca

   * Motivo: marca não está na lista interna.
   * Correção: adicionar a marca à lista de marcas conhecidas e reprocessar.

3. Peso não reconhecido

   * Motivo: formato diferente dos padrões.
   * Correção: padronizar o nome no Athos ou estender a função de extração.

---

## 13. Boas práticas

* Fazer backup do CSV do Athos antes de processar.
* Testar primeiro com um CSV pequeno.
* Conferir o `metadata_v4.json` depois do processamento.
* Importar no WooCommerce primeiro em ambiente de testes quando possível.

---

## 14. Estrutura do projeto

```text
AquaFlora-Estoque/
├── processador-estoque-v4.1.js   # script principal
├── processarEstoque-v4.1.bat     # atalho Windows
├── config.json                   # config ativa
├── config.example.json           # modelo
├── visualizar-logs.js            # leitura de logs JSON
├── saida_estoque/                # saída dos arquivos
└── README.md
```

---

## 15. Contribuição

* Adicionar novas marcas no arquivo principal.
* Ajustar regras de peso.
* Ajustar mapeamento de categorias.
* Registrar mudanças em `CHANGELOG.md`.

Antes de enviar uma alteração, valide a sintaxe dos dois executáveis:

```powershell
npm test
```

---

## 16. Licença

MIT. Uso interno AquaFlora Agroshop.
