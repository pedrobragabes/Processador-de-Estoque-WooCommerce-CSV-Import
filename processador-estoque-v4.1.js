const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Carrega configurações do arquivo config.json
let CONFIG;
try {
  CONFIG = JSON.parse(fs.readFileSync('config.json', 'utf8'));
} catch (error) {
  console.error('❌ Erro ao carregar config.json:', error.message);
  process.exit(1);
}

class ProcessadorEstoqueV4 {
  constructor() {
    this.produtos = [];
    this.categorias = new Map();
    this.estatisticas = {
      totalLinhasProcessadas: 0,
      produtosValidos: 0,
      produtosInvalidos: 0,
      produtosSemEstoque: 0,
      produtosComMarca: 0,
      produtosComPeso: 0,
      erros: [],
      inicioProcessamento: new Date()
    };
    this.logs = [];
    this.logDetalhado = [];
    
    // 🆕 BANCO DE DADOS DE MARCAS - Completo e organizado
    this.marcasConhecidas = {
      // Pet - Rações Premium
      'royal canin': 'Royal Canin',
      'royalcanin': 'Royal Canin',
      'premier': 'Premier',
      'premier pet': 'Premier Pet',
      'golden': 'Golden',
      'golden formula': 'Golden Formula',
      'farmina': 'Farmina',
      'farmina n&d': 'Farmina N&D',
      'origen': 'Origen',
      'acana': 'Acana',
      'taste of the wild': 'Taste of the Wild',
      'hills': "Hill's",
      'purina': 'Purina',
      'proplan': 'Pro Plan',
      'pro plan': 'Pro Plan',
      
      // Pet - Rações Populares
      'pedigree': 'Pedigree',
      'whiskas': 'Whiskas',
      'friskies': 'Friskies',
      'dog chow': 'Dog Chow',
      'cat chow': 'Cat Chow',
      'special dog': 'Special Dog',
      'special cat': 'Special Cat',
      'luck dog': 'Luck Dog',
      'luck cat': 'Luck Cat',
      'max': 'Max',
      'max cat': 'Max Cat',
      'max dog': 'Max Dog',
      'total': 'Total',
      'total dog': 'Total Dog',
      'total cat': 'Total Cat',
      'sabor': 'Sabor & Vida',
      'sabor e vida': 'Sabor & Vida',
      'sabor vida': 'Sabor & Vida',
      'guabi': 'Guabi',
      'guabi natural': 'Guabi Natural',
      'equilibrio': 'Equilíbrio',
      'naturalis': 'Naturalis',
      
      // Veterinária e Medicamentos
      'nexgard': 'NexGard',
      'bravecto': 'Bravecto',
      'simparic': 'Simparic',
      'revolution': 'Revolution',
      'advocate': 'Advocate',
      'frontline': 'Frontline',
      'seresto': 'Seresto',
      'heartgard': 'Heartgard',
      'drontal': 'Drontal',
      'vermifugo': 'Vermífugo',
      'antipulgas': 'Antipulgas',
      'zoetis': 'Zoetis',
      'virbac': 'Virbac',
      'agener': 'Agener',
      'ceva': 'Ceva',
      'merial': 'Merial',
      
      // Higiene e Beleza Pet
      'petbrilho': 'Pet Brilho',
      'pet society': 'Pet Society',
      'plush': 'Plush',
      'nasus': 'Nasus',
      'kelldrin': 'Kelldrin',
      'vitor': 'Vitor',
      'vitalab': 'Vitalab',
      'biovet': 'Biovet',
      'vetnil': 'Vetnil',
      'ecopet': 'Ecopet',
      
      // Aquarismo
      'alcon': 'Alcon',
      'tetra': 'Tetra',
      'sera': 'Sera',
      'tropical': 'Tropical',
      'nutrafin': 'Nutrafin',
      'ocean tech': 'Ocean Tech',
      'oceantech': 'Ocean Tech',
      'boyu': 'Boyu',
      'sarlo': 'Sarlo',
      'sarlo better': 'Sarlo Better',
      'atman': 'Atman',
      'aquatech': 'Aquatech',
      'resun': 'Resun',
      
      // Aves e Pássaros
      'megazoo': 'Megazoo',
      'alimento': 'Alimento',
      'nutrópica': 'Nutrópica',
      'nutropica': 'Nutrópica',
      'zootekna': 'Zootekna',
      'poytara': 'Poytara',
      'trinca ferro': 'Trinca Ferro',
      
      // Piscina
      'genco': 'Genco',
      'hidroazul': 'Hidroazul',
      'bel gard': 'Bel Gard',
      'belguard': 'Bel Gard',
      'barranets': 'Barranets',
      'HTH': 'HTH',
      'acquazero': 'Acquazero',
      
      // Ferramentas e Cutelaria
      'tramontina': 'Tramontina',
      'vonder': 'Vonder',
      'western': 'Western',
      'nautika': 'Nautika',
      'coleman': 'Coleman',
      'guepardo': 'Guepardo',
      'mor': 'Mor',
      'invictus': 'Invictus',
      
      // Pesca
      'marine sports': 'Marine Sports',
      'maruri': 'Maruri',
      'daiwa': 'Daiwa',
      'shimano': 'Shimano',
      'albatroz': 'Albatroz',
      'saint': 'Saint',
      'sumax': 'Sumax',
      
      // Agro e Insumos
      'forth': 'Forth',
      'dimy': 'Dimy',
      'nutriplan': 'Nutriplan',
      'biofertil': 'Biofertil',
      'bionatural': 'BioNatural',
      'vitaplan': 'Vitaplan',
      'plantafol': 'Plantafol',
      
      // Tabacaria
      'palheiro': 'Palheiro',
      'smoking': 'Smoking',
      'zig zag': 'Zig Zag',
      'zigzag': 'Zig Zag',
      'raw': 'RAW',
      'club modiano': 'Club Modiano',
      'copag': 'Copag'
    };
  }

  // Inicializa o processamento
  async processar() {
    try {
      console.log('🚀 Iniciando Processador de Estoque v4.1 - DETECÇÃO DE MARCAS E PESO\n');
      this.adicionarLog('INFO', 'Iniciando processamento v4.1 com detecção inteligente');
      
      this.verificarDependencias();
      this.criarPastaSaida();
      
      await this.lerArquivoCSV();
      await this.gerarArquivosSaida();
      await this.gerarLogDetalhado();
      
      this.exibirRelatorioFinal();
      
    } catch (error) {
      this.adicionarLog('ERRO', `Erro crítico: ${error.message}`);
      console.error('❌ Erro crítico:', error.message);
      process.exit(1);
    }
  }

  // Adiciona entrada ao log
  adicionarLog(nivel, mensagem, detalhes = null) {
    const timestamp = new Date().toISOString();
    const entrada = {
      timestamp,
      nivel,
      mensagem,
      detalhes
    };
    
    this.logs.push(entrada);
    
    if (detalhes) {
      this.logDetalhado.push(entrada);
    }
  }

  // Verifica se todas as dependências estão disponíveis
  verificarDependencias() {
    if (!fs.existsSync(CONFIG.arquivos.entrada)) {
      throw new Error(`Arquivo de entrada não encontrado: ${CONFIG.arquivos.entrada}`);
    }
    
    this.adicionarLog('INFO', 'Dependências verificadas', {
      arquivo: CONFIG.arquivos.entrada,
      tamanho: fs.statSync(CONFIG.arquivos.entrada).size
    });
    console.log('✅ Dependências verificadas');
    console.log(`✅ Banco de marcas carregado: ${Object.keys(this.marcasConhecidas).length} marcas`);
  }

  // Cria pasta de saída se não existir
  criarPastaSaida() {
    if (!fs.existsSync(CONFIG.arquivos.pastaSaida)) {
      fs.mkdirSync(CONFIG.arquivos.pastaSaida, { recursive: true });
      this.adicionarLog('INFO', 'Pasta de saída criada', { pasta: CONFIG.arquivos.pastaSaida });
    } else {
      this.adicionarLog('INFO', 'Pasta de saída já existe', { pasta: CONFIG.arquivos.pastaSaida });
    }
    console.log('✅ Pasta de saída preparada');
  }

  // Lê e processa o arquivo CSV de forma otimizada
  lerArquivoCSV() {
    return new Promise((resolve, reject) => {
      console.log('📖 Lendo arquivo CSV...');
      
      const stream = fs.createReadStream(CONFIG.arquivos.entrada)
        .pipe(csv({ 
          headers: false, 
          separator: ',', 
          strict: false,
          skipEmptyLines: true,
          mapValues: ({ value }) => (value ?? '').trim() 
        }));

      stream.on('data', (row) => {
        this.estatisticas.totalLinhasProcessadas++;
        this.processarLinha(row);
      });

      stream.on('end', () => {
        this.adicionarLog('INFO', 'Arquivo CSV processado', {
          totalLinhas: this.estatisticas.totalLinhasProcessadas,
          produtosValidos: this.estatisticas.produtosValidos,
          produtosInvalidos: this.estatisticas.produtosInvalidos,
          produtosComMarca: this.estatisticas.produtosComMarca,
          produtosComPeso: this.estatisticas.produtosComPeso
        });
        console.log(`✅ Arquivo processado: ${this.estatisticas.totalLinhasProcessadas} linhas`);
        resolve();
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Processa uma linha individual do CSV
  processarLinha(row) {
    try {
      const colunas = Object.keys(row)
        .sort((a, b) => Number(a) - Number(b))
        .map(k => row[k]);

      if (colunas.length < 15) return;

      // Extrai categoria
      const tokenDepartamento = colunas.find(c => c && c.startsWith('Departamento:'));
      const nomeCategoria = this.extrairNomeCategoria(tokenDepartamento);

      // Localiza índice do cabeçalho
      const indiceHeader = this.encontrarIndiceHeader(colunas);
      if (indiceHeader === -1) return;

      // Extrai dados do produto
      const dadosProduto = this.extrairDadosProduto(colunas, indiceHeader);
      if (!dadosProduto) return;

      // Valida produto
      if (!this.validarProduto(dadosProduto)) {
        this.estatisticas.produtosInvalidos++;
        return;
      }

      // Cria objeto produto otimizado para WooCommerce
      const produto = this.criarProdutoWooCommerce(dadosProduto, nomeCategoria);
      
      // Log detalhado do produto processado
      this.adicionarLog('PRODUTO', 'Produto processado', {
        sku: produto.SKU,
        nome: produto.Name,
        categoria: produto.Categories,
        marca: produto['Meta: _marca'] || 'Não detectada',
        peso: produto['Weight (kg)'] || 'Não detectado',
        preco: produto['Regular price'],
        estoque: produto.Stock,
        nomeOriginal: dadosProduto.descricaoRaw
      });
      
      this.produtos.push(produto);
      this.adicionarProdutoCategoria(nomeCategoria, produto);
      this.estatisticas.produtosValidos++;

      if (produto.Stock === 0) {
        this.estatisticas.produtosSemEstoque++;
      }

    } catch (error) {
      this.estatisticas.erros.push({
        linha: this.estatisticas.totalLinhasProcessadas,
        erro: error.message
      });
      this.adicionarLog('ERRO', 'Erro ao processar linha', {
        linha: this.estatisticas.totalLinhasProcessadas,
        erro: error.message,
        stack: error.stack
      });
    }
  }

  // Extrai nome da categoria
  extrairNomeCategoria(tokenDepartamento) {
    if (!tokenDepartamento) return 'SEM_CATEGORIA';
    
    const nome = tokenDepartamento.split(':').slice(1).join(':').trim();
    return nome || 'SEM_CATEGORIA';
  }

  // Encontra índice do header "Valor Custo"
  encontrarIndiceHeader(colunas) {
    return colunas.findIndex(col => col === 'Valor Custo');
  }

  // Extrai dados básicos do produto
  extrairDadosProduto(colunas, indiceHeader) {
    const inicio = indiceHeader + 1;
    if (colunas.length < inicio + 8) return null;

    return {
      skuRaw: colunas[inicio] || '',
      descricaoRaw: colunas[inicio + 1] || '',
      estoqueRaw: colunas[inicio + 2] || '0',
      minimoRaw: colunas[inicio + 3] || '0',
      precoRaw: colunas[inicio + 4] || '0',
      custoRaw: colunas[inicio + 5] || '0'
    };
  }

  // Valida dados do produto
  validarProduto(dados) {
    const sku = this.limparSKU(dados.skuRaw);
    const estoque = this.converterNumero(dados.estoqueRaw);
    const preco = this.converterNumero(dados.precoRaw);
    const custo = this.converterNumero(dados.custoRaw);

    // Validações básicas
    if (!sku && CONFIG.validacoes.skuObrigatorio) return false;
    if (preco < CONFIG.processamento.precoMinimo) return false;
    if (estoque < CONFIG.processamento.estoqueMinimo && !CONFIG.processamento.incluirProdutosSemEstoque) return false;

    // 🆕 V4.1: Validação de preço vs custo (alerta se preço < custo)
    if (preco > 0 && custo > 0 && preco < custo) {
      this.adicionarLog('ALERTA', 'Preço menor que custo', {
        sku,
        preco: preco.toFixed(2),
        custo: custo.toFixed(2),
        diferenca: (custo - preco).toFixed(2)
      });
    }

    // 🆕 V4.1: Validação de preços muito altos ou baixos (possíveis erros)
    if (preco > 10000) {
      this.adicionarLog('ALERTA', 'Preço muito alto (possível erro)', {
        sku,
        preco: preco.toFixed(2),
        produto: dados.descricaoRaw
      });
    }

    return true;
  }

  // 🎯 NOVA FUNÇÃO V4: Detecta marca no nome do produto
  detectarMarca(nomeProduto) {
    if (!nomeProduto) return null;
    
    const nomeMinusculo = nomeProduto.toLowerCase();
    
    // Procura por cada marca conhecida
    for (const [chaveBusca, nomeCorreto] of Object.entries(this.marcasConhecidas)) {
      // Busca com word boundary para evitar falsos positivos
      const regex = new RegExp(`\\b${chaveBusca}\\b`, 'i');
      if (regex.test(nomeMinusculo)) {
        return nomeCorreto;
      }
    }
    
    return null;
  }

  // 🎯 MELHORADA V4: Extrai peso do nome do produto (mais preciso)
  extrairPeso(nome) {
    if (!nome) return null;
    
    // Padrões de peso em ordem de prioridade
    const padroes = [
      /(\d+(?:[,\.]\d+)?)\s*kg/i,           // 10kg, 10.5kg, 10,5kg
      /(\d+(?:[,\.]\d+)?)\s*k/i,            // 10k
      /(\d+)\s*quilos?/i,                    // 10 quilo, 10 quilos
      /(\d+(?:[,\.]\d+)?)\s*g(?!\w)/i,      // 500g (mas não "golden")
      /(\d+(?:[,\.]\d+)?)\s*gramas?/i,      // 500 grama, 500 gramas
      /(\d+(?:[,\.]\d+)?)\s*ml/i,           // 500ml
      /(\d+(?:[,\.]\d+)?)\s*litros?/i,      // 2 litro, 2 litros
      /(\d+(?:[,\.]\d+)?)\s*l(?!\w)/i       // 2L
    ];
    
    for (const padrao of padroes) {
      const match = nome.match(padrao);
      if (match) {
        let valor = parseFloat(match[1].replace(',', '.'));
        
        // Converte tudo para kg
        if (padrao.source.includes('g(?!') || padrao.source.includes('grama')) {
          valor = valor / 1000; // gramas para kg
        } else if (padrao.source.includes('ml') || padrao.source.includes('litro')) {
          valor = valor / 1000; // ml para litros (aproximação)
        }
        
        // Só retorna se o valor for razoável (entre 0.001kg e 50kg)
        if (valor > 0.001 && valor <= 50) {
          return valor.toFixed(3);
        }
      }
    }
    
    return null;
  }

  // Formata nome do produto de forma inteligente
  formatarNomeProduto(nomeRaw) {
    if (!nomeRaw) return '';
    
    // Remove aspas extras e espaços
    let nome = nomeRaw.replace(/^["']+|["']+$/g, '').trim();
    
    // Converte para Title Case (primeira letra de cada palavra maiúscula)
    nome = nome.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    
    // Correções específicas para melhor apresentação
    nome = this.aplicarCorrecoesEspecificas(nome);
    
    // Remove caracteres inválidos para WooCommerce
    nome = nome.replace(/[^\w\s\-.,()&/]/g, '');
    
    // Limita o tamanho (WooCommerce recomenda até 100 caracteres)
    if (nome.length > 100) {
      nome = nome.substring(0, 97) + '...';
    }
    
    return nome;
  }

  // Aplica correções específicas para produtos
  aplicarCorrecoesEspecificas(nome) {
    // Dicionário de correções específicas
    const correcoes = {
      // Animais
      'caes': 'Cães',
      'gatos': 'Gatos',
      'gato': 'Gato',
      'cao': 'Cão',
      'filhotes': 'Filhotes',
      'filhote': 'Filhote',
      'adulto': 'Adulto',
      'adultos': 'Adultos',
      'senior': 'Senior',
      'puppy': 'Puppy',
      'junior': 'Junior',
      
      // Sabores e ingredientes
      'frango': 'Frango',
      'carne': 'Carne',
      'peixe': 'Peixe',
      'salmao': 'Salmão',
      'vegetais': 'Vegetais',
      'arroz': 'Arroz',
      
      // Características
      'castrado': 'Castrado',
      'castrados': 'Castrados',
      'light': 'Light',
      'premium': 'Premium',
      'gold': 'Gold',
      'mini': 'Mini',
      'pequenas': 'Pequenas',
      'medias': 'Médias',
      'grandes': 'Grandes',
      
      // Unidades
      'kg': 'Kg',
      'g': 'g',
      'ml': 'ml',
      'cm': 'cm',
      'l': 'L'
    };
    
    // Aplica as correções
    Object.entries(correcoes).forEach(([de, para]) => {
      const regex = new RegExp(`\\b${de}\\b`, 'gi');
      nome = nome.replace(regex, para);
    });
    
    return nome;
  }

  // Formata categoria (SEM sufixos como _v4)
  formatarCategoria(categoria) {
    if (!categoria) return 'Geral';
    
    // Remove sufixos numéricos ou versões
    categoria = categoria.replace(/_v?\d+$/i, '').trim();
    
    // Converte para Title Case
    return categoria.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  // Cria objeto produto formatado para WooCommerce
  criarProdutoWooCommerce(dados, categoria) {
    const sku = this.limparSKU(dados.skuRaw);
    const nome = this.formatarNomeProduto(dados.descricaoRaw);
    const estoque = Math.floor(this.converterNumero(dados.estoqueRaw));
    const preco = this.converterNumero(dados.precoRaw).toFixed(2);
    const custo = this.converterNumero(dados.custoRaw).toFixed(2);
    const minimo = Math.floor(this.converterNumero(dados.minimoRaw));
    const categoriaFormatada = this.formatarCategoria(categoria);
    
    // 🆕 V4: Detecta marca e peso
    const marcaDetectada = this.detectarMarca(dados.descricaoRaw);
    const pesoDetectado = this.extrairPeso(dados.descricaoRaw);
    
    // Atualiza estatísticas
    if (marcaDetectada) this.estatisticas.produtosComMarca++;
    if (pesoDetectado) this.estatisticas.produtosComPeso++;

    return {
      SKU: sku,
      Name: nome,
      Published: (estoque > 0 && CONFIG.woocommerce.publicarAutomaticamente) ? 1 : 0,
      'Is featured?': 0,
      'Visibility in catalog': CONFIG.woocommerce.visibilidadeCatalogo,
      'Short description': this.gerarDescricaoCurta(nome, categoriaFormatada, marcaDetectada),
      Description: this.gerarDescricaoCompleta(nome, categoriaFormatada, preco, marcaDetectada, pesoDetectado),
      'Tax status': CONFIG.woocommerce.statusTributario,
      'Tax class': CONFIG.woocommerce.classeImposto,
      'In stock?': estoque > 0 ? 1 : 0,
      Stock: estoque,
      'Backorders allowed?': CONFIG.woocommerce.permitirBackorders ? 1 : 0,
      'Sold individually?': CONFIG.woocommerce.venderIndividualmente ? 1 : 0,
      'Weight (kg)': pesoDetectado || '', // 🆕 V4: Peso detectado automaticamente
      'Regular price': preco,
      'Sale price': '',
      Categories: categoriaFormatada, // 🎯 SEM SUFIXOS
      Tags: this.gerarTags(nome, categoriaFormatada, marcaDetectada),
      // 🆕 V4.1: Atributo "Marca" visível na página do produto
      'Attribute 1 name': 'Marca',
      'Attribute 1 value(s)': marcaDetectada || '',
      'Attribute 1 visible': marcaDetectada ? 1 : 0,
      'Attribute 1 global': 1, // Permite criar taxonomia global de marcas
      'Allow customer reviews?': CONFIG.woocommerce.permitirAvaliacoes ? 1 : 0,
      // Campos customizados para controle interno
      'Meta: _custo': custo,
      'Meta: _estoque_minimo': minimo,
      'Meta: _margem': this.calcularMargem(preco, custo),
      'Meta: _categoria_original': categoria,
      'Meta: _nome_original': dados.descricaoRaw,
      'Meta: _marca': marcaDetectada || '', // 🆕 V4: Marca detectada
      'Meta: _peso_detectado': pesoDetectado ? 'Sim' : 'Não' // 🆕 V4: Flag de detecção
    };
  }

  // Gera descrição curta automática
  gerarDescricaoCurta(nome, categoria, marca) {
    let descricao = `${nome}`;
    if (marca) {
      descricao += ` | Marca: ${marca}`;
    }
    descricao += ` | Categoria: ${categoria}`;
    return descricao;
  }

  // 🆕 V4.1: Gera descrição completa otimizada para SEO
  gerarDescricaoCompleta(nome, categoria, preco, marca, peso) {
    let descricao = `<div class="product-description">\n`;
    descricao += `<h2>${nome}</h2>\n`;
    
    // Parágrafo de introdução SEO-friendly
    let intro = `<p>`;
    if (marca) {
      intro += `Produto <strong>${marca}</strong> da linha ${categoria}. `;
    } else {
      intro += `Produto de alta qualidade da categoria ${categoria}. `;
    }
    intro += `Disponível na loja com `;
    if (peso) {
      intro += `<strong>${peso}kg</strong> e `;
    }
    intro += `melhor custo-benefício.</p>\n`;
    descricao += intro;
    
    // Lista de características
    descricao += `<ul class="product-features">\n`;
    if (marca) {
      descricao += `  <li>🏷️ <strong>Marca:</strong> ${marca}</li>\n`;
    }
    if (peso) {
      descricao += `  <li>⚖️ <strong>Peso/Conteúdo:</strong> ${peso} Kg</li>\n`;
    }
    descricao += `  <li>📦 <strong>Categoria:</strong> ${categoria}</li>\n`;
    descricao += `  <li>✅ <strong>Produto Original</strong> com garantia</li>\n`;
    descricao += `  <li>🚚 <strong>Entrega Rápida</strong> para todo o Brasil</li>\n`;
    descricao += `  <li>💳 <strong>Diversas formas de pagamento</strong></li>\n`;
    descricao += `</ul>\n`;
    
    // Call to Action
    descricao += `<div class="cta-section">\n`;
    descricao += `<p><strong>💰 Preço promocional:</strong> <span class="price">R$ ${preco}</span></p>\n`;
    descricao += `<p>📞 <strong>Dúvidas?</strong> Nossa equipe está pronta para ajudar!</p>\n`;
    descricao += `</div>\n`;
    descricao += `</div>`;
    
    return descricao;
  }

  // Gera tags automáticas
  gerarTags(nome, categoria, marca) {
    const tags = [categoria];
    
    // Adiciona marca como tag
    if (marca) {
      tags.push(marca);
    }
    
    // Adiciona tags baseadas no nome do produto
    const palavrasChave = ['Premium', 'Gold', 'Special', 'Royal', 'Bio', 'Natural', 'Filhote', 'Adulto', 'Senior'];
    palavrasChave.forEach(palavra => {
      if (nome.toLowerCase().includes(palavra.toLowerCase())) {
        tags.push(palavra);
      }
    });
    
    return tags.join(', ');
  }

  // Adiciona produto à categoria
  adicionarProdutoCategoria(categoria, produto) {
    const categoriaFormatada = this.formatarCategoria(categoria);
    if (!this.categorias.has(categoriaFormatada)) {
      this.categorias.set(categoriaFormatada, []);
    }
    this.categorias.get(categoriaFormatada).push(produto);
  }

  // Gera todos os arquivos de saída
  async gerarArquivosSaida() {
    console.log('\n📝 Gerando arquivos de saída v4.1...');
    this.adicionarLog('INFO', 'Iniciando geração de arquivos de saída');

    if (CONFIG.saida.criarArquivoGeral) {
      await this.gerarArquivoGeral();
    }

    if (CONFIG.saida.criarArquivosPorCategoria) {
      await this.gerarArquivosPorCategoria();
    }

    if (CONFIG.saida.incluirMetadata) {
      await this.gerarArquivoMetadata();
    }
    
    this.adicionarLog('INFO', 'Arquivos de saída gerados com sucesso');
  }

  // Gera arquivo geral com todos os produtos (SEM sufixo _v4)
  async gerarArquivoGeral() {
    const nomeArquivo = this.gerarNomeArquivo('woocommerce_import_TODOS');
    const caminhoArquivo = path.join(CONFIG.arquivos.pastaSaida, nomeArquivo);
    
    const csvWriter = createCsvWriter({
      path: caminhoArquivo,
      header: this.obterHeaderCSV()
    });

    await csvWriter.writeRecords(this.produtos);
    this.adicionarLog('ARQUIVO', 'Arquivo geral criado', {
      arquivo: nomeArquivo,
      produtos: this.produtos.length,
      tamanho: fs.statSync(caminhoArquivo).size
    });
    console.log(`✅ Arquivo geral criado: ${nomeArquivo} (${this.produtos.length} produtos)`);
  }

  // Gera arquivos separados por categoria (SEM sufixo _v4)
  async gerarArquivosPorCategoria() {
    for (const [categoria, produtos] of this.categorias.entries()) {
      const nomeArquivo = this.gerarNomeArquivo(this.criarSlug(categoria));
      const caminhoArquivo = path.join(CONFIG.arquivos.pastaSaida, nomeArquivo);
      
      const csvWriter = createCsvWriter({
        path: caminhoArquivo,
        header: this.obterHeaderCSV()
      });

      await csvWriter.writeRecords(produtos);
      
      // Estatísticas de marca por categoria
      const produtosComMarca = produtos.filter(p => p['Meta: _marca']).length;
      const produtosComPeso = produtos.filter(p => p['Weight (kg)']).length;
      
      this.adicionarLog('ARQUIVO', 'Arquivo de categoria criado', {
        categoria,
        arquivo: nomeArquivo,
        produtos: produtos.length,
        produtosComMarca,
        produtosComPeso,
        tamanho: fs.statSync(caminhoArquivo).size
      });
      console.log(`✅ Arquivo ${categoria}: ${nomeArquivo} (${produtos.length} produtos, ${produtosComMarca} com marca, ${produtosComPeso} com peso)`);
    }
  }

  // Gera arquivo com metadata e estatísticas
  async gerarArquivoMetadata() {
    const metadata = {
      versao: '4.1.0',
      melhorias: [
        'Detecção automática de marcas (160+ marcas)',
        'Extração inteligente de peso do título',
        'Arquivos sem sufixos de versão',
        'Campo de marca no WooCommerce',
        'Tags automáticas incluindo marca',
        'Descrições enriquecidas com marca e peso',
        'Estatísticas de detecção de marca e peso'
      ],
      dataProcessamento: new Date().toISOString(),
      totalProdutos: this.produtos.length,
      totalCategorias: this.categorias.size,
      estatisticas: this.estatisticas,
      marcasDetectadas: {
        total: this.estatisticas.produtosComMarca,
        percentual: ((this.estatisticas.produtosComMarca / this.produtos.length) * 100).toFixed(2) + '%',
        marcasUnicas: [...new Set(this.produtos.map(p => p['Meta: _marca']).filter(Boolean))].sort()
      },
      pesosDetectados: {
        total: this.estatisticas.produtosComPeso,
        percentual: ((this.estatisticas.produtosComPeso / this.produtos.length) * 100).toFixed(2) + '%'
      },
      configuracao: CONFIG,
      resumoPorCategoria: Array.from(this.categorias.entries()).map(([categoria, produtos]) => ({
        categoria,
        quantidade: produtos.length,
        produtosComMarca: produtos.filter(p => p['Meta: _marca']).length,
        produtosComPeso: produtos.filter(p => p['Weight (kg)']).length,
        valorTotalEstoque: produtos.reduce((total, p) => total + (parseFloat(p['Regular price']) * p.Stock), 0).toFixed(2),
        marcasEncontradas: [...new Set(produtos.map(p => p['Meta: _marca']).filter(Boolean))].sort()
      }))
    };

    const caminhoArquivo = path.join(CONFIG.arquivos.pastaSaida, 'metadata.json');
    fs.writeFileSync(caminhoArquivo, JSON.stringify(metadata, null, 2));
    this.adicionarLog('ARQUIVO', 'Arquivo de metadata criado', {
      arquivo: 'metadata.json',
      tamanho: fs.statSync(caminhoArquivo).size
    });
    console.log('✅ Arquivo de metadata criado');
  }

  // Gera log detalhado da execução
  async gerarLogDetalhado() {
    const agora = new Date();
    const logCompleto = {
      execucao: {
        dataHora: agora.toISOString(),
        dataHoraBrasil: agora.toLocaleString('pt-BR'),
        versao: '4.1.0',
        duracao: ((agora - this.estatisticas.inicioProcessamento) / 1000).toFixed(2) + 's'
      },
      resumo: {
        totalLinhasProcessadas: this.estatisticas.totalLinhasProcessadas,
        produtosValidos: this.estatisticas.produtosValidos,
        produtosInvalidos: this.estatisticas.produtosInvalidos,
        produtosSemEstoque: this.estatisticas.produtosSemEstoque,
        produtosComMarca: this.estatisticas.produtosComMarca,
        produtosComPeso: this.estatisticas.produtosComPeso,
        totalCategorias: this.categorias.size,
        totalErros: this.estatisticas.erros.length
      },
      deteccaoMarcas: {
        total: this.estatisticas.produtosComMarca,
        percentual: ((this.estatisticas.produtosComMarca / this.estatisticas.produtosValidos) * 100).toFixed(2) + '%',
        marcasEncontradas: [...new Set(this.produtos.map(p => p['Meta: _marca']).filter(Boolean))].sort(),
        top5Marcas: this.getTopMarcas(5)
      },
      deteccaoPeso: {
        total: this.estatisticas.produtosComPeso,
        percentual: ((this.estatisticas.produtosComPeso / this.estatisticas.produtosValidos) * 100).toFixed(2) + '%'
      },
      configuracao: CONFIG,
      categorias: Array.from(this.categorias.entries()).map(([categoria, produtos]) => ({
        nome: categoria,
        quantidade: produtos.length,
        comMarca: produtos.filter(p => p['Meta: _marca']).length,
        comPeso: produtos.filter(p => p['Weight (kg)']).length,
        valorTotal: produtos.reduce((total, p) => total + (parseFloat(p['Regular price']) * p.Stock), 0).toFixed(2),
        produtosComEstoque: produtos.filter(p => p.Stock > 0).length,
        produtosSemEstoque: produtos.filter(p => p.Stock === 0).length
      })),
      logs: this.logs,
      erros: this.estatisticas.erros,
      amostrasProcessamento: {
        primeiros5ComMarca: this.produtos
          .filter(p => p['Meta: _marca'])
          .slice(0, 5)
          .map(p => ({
            sku: p.SKU,
            nome: p.Name,
            marca: p['Meta: _marca'],
            peso: p['Weight (kg)'] || 'Não detectado',
            categoria: p.Categories,
            preco: p['Regular price']
          })),
        primeiros5ComPeso: this.produtos
          .filter(p => p['Weight (kg)'])
          .slice(0, 5)
          .map(p => ({
            sku: p.SKU,
            nome: p.Name,
            peso: p['Weight (kg)'],
            marca: p['Meta: _marca'] || 'Não detectada',
            categoria: p.Categories,
            preco: p['Regular price']
          }))
      },
      arquivosGerados: this.logs
        .filter(log => log.nivel === 'ARQUIVO')
        .map(log => ({
          arquivo: log.detalhes.arquivo,
          tamanho: log.detalhes.tamanho,
          produtos: log.detalhes.produtos || 'metadata',
          produtosComMarca: log.detalhes.produtosComMarca || 0,
          produtosComPeso: log.detalhes.produtosComPeso || 0
        }))
    };

    // Salva log detalhado
    const caminhoLog = path.join(CONFIG.arquivos.pastaSaida, `log_execucao_${agora.toISOString().slice(0, 19).replace(/:/g, '-')}.json`);
    fs.writeFileSync(caminhoLog, JSON.stringify(logCompleto, null, 2));
    
    // Salva também um log sempre atualizado (último processamento)
    const caminhoLogAtual = path.join(CONFIG.arquivos.pastaSaida, 'ultimo_processamento.json');
    fs.writeFileSync(caminhoLogAtual, JSON.stringify(logCompleto, null, 2));

    console.log(`✅ Log detalhado salvo: ${path.basename(caminhoLog)}`);
    console.log(`✅ Log atual atualizado: ultimo_processamento.json`);
    
    this.adicionarLog('INFO', 'Logs detalhados gerados', {
      logDetalhado: caminhoLog,
      logAtual: caminhoLogAtual
    });
  }

  // Calcula top marcas mais frequentes
  getTopMarcas(limite) {
    const contagemMarcas = {};
    
    this.produtos.forEach(p => {
      const marca = p['Meta: _marca'];
      if (marca) {
        contagemMarcas[marca] = (contagemMarcas[marca] || 0) + 1;
      }
    });
    
    return Object.entries(contagemMarcas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limite)
      .map(([marca, quantidade]) => ({ marca, quantidade }));
  }

  // Obtém header do CSV para WooCommerce
  obterHeaderCSV() {
    const camposBasicos = [
      { id: 'SKU', title: 'SKU' },
      { id: 'Name', title: 'Name' },
      { id: 'Published', title: 'Published' },
      { id: 'Is featured?', title: 'Is featured?' },
      { id: 'Visibility in catalog', title: 'Visibility in catalog' },
      { id: 'Short description', title: 'Short description' },
      { id: 'Description', title: 'Description' },
      { id: 'Tax status', title: 'Tax status' },
      { id: 'Tax class', title: 'Tax class' },
      { id: 'In stock?', title: 'In stock?' },
      { id: 'Stock', title: 'Stock' },
      { id: 'Backorders allowed?', title: 'Backorders allowed?' },
      { id: 'Sold individually?', title: 'Sold individually?' },
      { id: 'Weight (kg)', title: 'Weight (kg)' },
      { id: 'Regular price', title: 'Regular price' },
      { id: 'Sale price', title: 'Sale price' },
      { id: 'Categories', title: 'Categories' },
      { id: 'Tags', title: 'Tags' },
      // 🆕 V4.1: Campo de Atributo "Marca" - Aparece como atributo do produto
      { id: 'Attribute 1 name', title: 'Attribute 1 name' },
      { id: 'Attribute 1 value(s)', title: 'Attribute 1 value(s)' },
      { id: 'Attribute 1 visible', title: 'Attribute 1 visible' },
      { id: 'Attribute 1 global', title: 'Attribute 1 global' },
      { id: 'Allow customer reviews?', title: 'Allow customer reviews?' },
      { id: 'Meta: _custo', title: 'Meta: _custo' },
      { id: 'Meta: _estoque_minimo', title: 'Meta: _estoque_minimo' },
      { id: 'Meta: _margem', title: 'Meta: _margem' },
      { id: 'Meta: _categoria_original', title: 'Meta: _categoria_original' },
      { id: 'Meta: _nome_original', title: 'Meta: _nome_original' },
      { id: 'Meta: _marca', title: 'Meta: _marca' }, // 🆕 V4
      { id: 'Meta: _peso_detectado', title: 'Meta: _peso_detectado' } // 🆕 V4
    ];

    return camposBasicos;
  }

  // Funções utilitárias
  converterNumero(str) {
    if (typeof str !== 'string') return 0;
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  }

  limparSKU(sku) {
    return (sku + '').replace(/\D/g, '');
  }

  criarSlug(str) {
    return (str || 'SEM_CATEGORIA')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_v?\d+$/i, '') // 🎯 Remove sufixos de versão
      .substring(0, 80) || 'SEM_CATEGORIA';
  }

  gerarNomeArquivo(base) {
    if (CONFIG.saida.formatoData) {
      const agora = new Date();
      const timestamp = agora.toISOString().slice(0, 19).replace(/:/g, '-');
      return `${base}_${timestamp}.csv`;
    }
    return `${base}.csv`;
  }

  calcularMargem(preco, custo) {
    const p = parseFloat(preco);
    const c = parseFloat(custo);
    if (c === 0) return 0;
    return ((p - c) / c * 100).toFixed(2);
  }

  // Exibe relatório final detalhado
  exibirRelatorioFinal() {
    const tempoProcessamento = (new Date() - this.estatisticas.inicioProcessamento) / 1000;
    
    console.log('\n📊 RELATÓRIO FINAL - VERSÃO 4.1.0');
    console.log('='.repeat(70));
    console.log(`⏱️  Tempo de processamento: ${tempoProcessamento.toFixed(2)}s`);
    console.log(`📄 Linhas processadas: ${this.estatisticas.totalLinhasProcessadas}`);
    console.log(`✅ Produtos válidos: ${this.estatisticas.produtosValidos}`);
    console.log(`❌ Produtos inválidos: ${this.estatisticas.produtosInvalidos}`);
    console.log(`📦 Produtos sem estoque: ${this.estatisticas.produtosSemEstoque}`);
    console.log(`🏷️  Total de categorias: ${this.categorias.size}`);
    
    console.log('\n🆕 DETECÇÃO INTELIGENTE:');
    console.log(`   🏷️  Produtos com MARCA detectada: ${this.estatisticas.produtosComMarca} (${((this.estatisticas.produtosComMarca / this.estatisticas.produtosValidos) * 100).toFixed(1)}%)`);
    console.log(`   ⚖️  Produtos com PESO detectado: ${this.estatisticas.produtosComPeso} (${((this.estatisticas.produtosComPeso / this.estatisticas.produtosValidos) * 100).toFixed(1)}%)`);
    console.log(`   🗃️  Banco de dados: ${Object.keys(this.marcasConhecidas).length} marcas`);
    
    // Top 5 marcas mais frequentes
    const topMarcas = this.getTopMarcas(5);
    if (topMarcas.length > 0) {
      console.log('\n🏆 Top 5 Marcas Mais Encontradas:');
      topMarcas.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.marca}: ${item.quantidade} produtos`);
      });
    }
    
    if (this.estatisticas.erros.length > 0) {
      console.log(`\n⚠️  Erros encontrados: ${this.estatisticas.erros.length}`);
      this.estatisticas.erros.slice(0, 3).forEach(erro => {
        console.log(`   Linha ${erro.linha}: ${erro.erro}`);
      });
    }

    console.log('\n📦 Produtos por categoria:');
    const categoriasSorted = Array.from(this.categorias.entries())
      .sort((a, b) => b[1].length - a[1].length);
    
    categoriasSorted.forEach(([categoria, produtos]) => {
      const valorTotal = produtos.reduce((total, p) => 
        total + (parseFloat(p['Regular price']) * p.Stock), 0);
      const comMarca = produtos.filter(p => p['Meta: _marca']).length;
      const comPeso = produtos.filter(p => p['Weight (kg)']).length;
      console.log(`   ${categoria}: ${produtos.length} produtos | ${comMarca} c/ marca | ${comPeso} c/ peso | R$ ${valorTotal.toFixed(2)}`);
    });

    console.log('\n🎉 Processamento v4.1.0 concluído com sucesso!');
  }
}

// Execução principal
if (require.main === module) {
  const processador = new ProcessadorEstoqueV4();
  processador.processar().catch(console.error);
}

module.exports = ProcessadorEstoqueV4;
