const fs = require('node:fs');
const path = require('node:path');
const { carregarConfig } = require('./processador-estoque-v4.1.js');

class VisualizadorLogs {
  constructor({ configPath = path.resolve('config.json') } = {}) {
    this.pastaSaida = fs.existsSync(configPath) ? carregarConfig(path.resolve(configPath)).arquivos.pastaSaida : path.resolve('saida_estoque');
  }

  lerLog(filename) {
    const absolute = path.resolve(this.pastaSaida, filename);
    const relative = path.relative(this.pastaSaida, absolute);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !absolute.endsWith('.json')) throw new Error('Escolha um JSON dentro da pasta de saída.');
    const log = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    if (!log || !log.resumo || typeof log.resumo !== 'object' || !log.execucao) throw new Error('Formato de log não reconhecido.');
    return log;
  }

  arquivosDisponiveis() {
    if (!fs.existsSync(this.pastaSaida)) return [];
    const entries = fs.readdirSync(this.pastaSaida, { withFileTypes: true });
    const names = [];
    for (const entry of entries) {
      if (entry.isFile() && /^log_execucao_.*\.json$/.test(entry.name)) names.push(entry.name);
      if (entry.isDirectory() && entry.name.startsWith('execucao_')) {
        for (const file of fs.readdirSync(path.join(this.pastaSaida, entry.name), { withFileTypes: true })) {
          if (file.isFile() && /^log_execucao_.*\.json$/.test(file.name)) names.push(path.join(entry.name, file.name));
        }
      }
    }
    return names.map((arquivo) => ({ arquivo, data: fs.statSync(path.join(this.pastaSaida, arquivo)).mtime })).sort((a, b) => b.data - a.data);
  }

  exibirDetalhesLog(log) {
    console.log('📋 PROCESSAMENTO', log.execucao.versao);
    console.log('Data:', log.execucao.dataHoraBrasil || log.execucao.dataHora, '; duração:', log.execucao.duracao);
    console.log('Linhas:', log.resumo.totalLinhasProcessadas, '; válidos:', log.resumo.produtosValidos, '; inválidos:', log.resumo.produtosInvalidos, '; erros:', log.resumo.totalErros);
    if (log.pastaExecucao) console.log('Arquivos:', log.pastaExecucao);
    for (const categoria of Array.isArray(log.categorias) ? log.categorias : []) {
      console.log(' ', categoria.nome, ':', categoria.quantidade, 'produtos; R$', categoria.valorTotal);
    }
    for (const file of Array.isArray(log.arquivosGerados) ? log.arquivosGerados : []) {
      console.log(' ', file.arquivo, ':', file.produtos, ';', file.tamanho, 'bytes');
    }
    for (const error of (Array.isArray(log.erros) ? log.erros : []).slice(0, 5)) console.log('  Linha', error.linha, ':', error.erro);
  }

  exibirUltimoProcessamento() {
    if (!fs.existsSync(path.join(this.pastaSaida, 'ultimo_processamento.json'))) {
      console.log('Nenhum processamento concluído. Execute o processador v4.1.1.');
      return;
    }
    this.exibirDetalhesLog(this.lerLog('ultimo_processamento.json'));
  }

  listarLogsDisponiveis() {
    const files = this.arquivosDisponiveis();
    console.log('📂', files.length, 'logs disponíveis');
    for (const file of files.slice(0, 10)) console.log(' ', file.arquivo, file.data.toLocaleString('pt-BR'));
  }

  exibirLogs() { this.exibirUltimoProcessamento(); this.listarLogsDisponiveis(); }
  exibirLogEspecifico(filename) { this.exibirDetalhesLog(this.lerLog(filename)); }

  exibirHistorico(dias = 7) {
    if (!Number.isInteger(dias) || dias < 1 || dias > 3650) throw new Error('Informe de 1 a 3650 dias.');
    const limit = Date.now() - dias * 86400000;
    const files = this.arquivosDisponiveis().filter((file) => file.data.getTime() >= limit);
    console.log('📊', files.length, 'execuções nos últimos', dias, 'dias');
    for (const file of files) {
      console.log(file.arquivo);
      try { this.exibirDetalhesLog(this.lerLog(file.arquivo)); }
      catch (error) { console.log('Log indisponível:', error.message); }
    }
  }

  compararExecucoes(first, second) {
    const a = this.lerLog(first), b = this.lerLog(second);
    console.log('🔍', first, '→', second);
    for (const key of ['produtosValidos', 'produtosInvalidos', 'totalCategorias']) {
      console.log(key, ':', a.resumo[key], '→', b.resumo[key]);
    }
  }
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    const index = args.indexOf('--config');
    let configPath;
    if (index !== -1) {
      if (!args[index + 1]) throw new Error('Informe o caminho depois de --config.');
      configPath = args[index + 1]; args.splice(index, 2);
    }
    const viewer = new VisualizadorLogs(configPath ? { configPath } : {});
    if (!args.length) viewer.exibirLogs();
    else if (args[0] === 'historico' && args.length <= 2) viewer.exibirHistorico(args[1] === undefined ? 7 : Number(args[1]));
    else if (args[0] === 'arquivo' && args.length === 2) viewer.exibirLogEspecifico(args[1]);
    else if (args[0] === 'comparar' && args.length === 3) viewer.compararExecucoes(args[1], args[2]);
    else throw new Error('Uso: visualizar-logs.js [historico dias | arquivo nome.json | comparar primeiro.json segundo.json] [--config caminho]');
  } catch (error) { console.error('❌ Erro ao carregar logs:', error.message); process.exitCode = 1; }
}
module.exports = VisualizadorLogs;
